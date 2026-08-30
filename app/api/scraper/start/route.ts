import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import {
  scrapeGoogleMapsDetailed,
  scrapeYelpPublic,
  scrapeYellowPagesPublic,
  deduplicateListings,
  RawListing,
} from "@/scraper/multi-source";
import { scrapeWebsiteContactsFast } from "@/scraper/website-enrichment";

export const runtime = "nodejs";
export const maxDuration = 60;

// How long (ms) we let ourselves actually work before self-pausing.
// Kept well under maxDuration (60s) — scraping Maps/Yelp/Yellow Pages
// for a single input can itself take 20-40s before enrichment even
// starts, so this needs real margin, not just a few seconds.
const TIME_BUDGET_MS = 32_000;

interface ResumeState {
  // Inputs that haven't been started at all yet.
  pendingInputs: string[];
  // Listings for the input that was IN PROGRESS when we paused —
  // already scraped from Google Maps/Yelp/Yellow Pages and deduplicated,
  // just not fully enriched yet. Resuming continues enrichment on these
  // WITHOUT re-scraping them, so no duplicate work happens.
  currentInputListings?: (RawListing & Record<string, unknown>)[];
  currentInputLabel?: string;
}

interface ScraperRequest {
  inputs: unknown;
  sources?: unknown;
  resumeState?: ResumeState;
}

interface ScraperEvent {
  status: "status" | "item" | "complete" | "error" | "paused";
  message?: string;
  item?: RawListing & Record<string, unknown>;
  error?: string;
  resumeState?: ResumeState;
}

export async function POST(req: Request) {
  const startTime = Date.now();

  let body: ScraperRequest;

  try {
    body = (await req.json()) as ScraperRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const resumeState = body.resumeState;

  const inputs = Array.isArray(body.inputs)
    ? body.inputs.filter((input): input is string => typeof input === "string")
    : [];

  // A resume request legitimately has an empty top-level "inputs" —
  // everything relevant lives inside resumeState instead. Only require
  // inputs when this is a fresh (non-resumed) request.
  if (!resumeState && inputs.length === 0) {
    return NextResponse.json(
      { error: "Inputs array is required." },
      { status: 400 }
    );
  }

  const sources = Array.isArray(body.sources)
    ? body.sources.filter((source): source is string => typeof source === "string")
    : ["google"];

  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = async (data: ScraperEvent): Promise<void> => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  const timeIsUp = () => Date.now() - startTime > TIME_BUDGET_MS;

  (async () => {
    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

    try {
      const isLocal = process.env.NODE_ENV === "development";

      await sendEvent({ status: "status", message: "Launching browser engine..." });

      let executablePath: string;

      if (isLocal) {
        executablePath =
          process.env.PUPPETEER_EXECUTABLE_PATH ||
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
      } else {
        executablePath = await chromium.executablePath();
        console.log("Chromium executable path:", executablePath);
      }

      if (!executablePath) {
        throw new Error("Chromium executable path could not be determined.");
      }

      browser = await puppeteer.launch({
        args: isLocal ? [] : chromium.args,
        defaultViewport: { width: 1280, height: 800 },
        executablePath,
        headless: true,
      });

      const page = await browser.newPage();

      // Build the work queue. If we're resuming, the in-progress input's
      // already-scraped listings go first (finish that one before moving
      // on), followed by whatever inputs hadn't been started yet.
      const remainingInputsQueue: string[] = resumeState
        ? [...resumeState.pendingInputs]
        : [...inputs];

      // If resuming mid-enrichment, finish those listings first.
      if (resumeState?.currentInputListings?.length) {
        const label = resumeState.currentInputLabel || "previous search";
        const listings = resumeState.currentInputListings;

        await sendEvent({
          status: "status",
          message: `Resuming enrichment for "${label}" (${listings.length} remaining)...`,
        });

        const pauseResult = await enrichListings(
          listings,
          page,
          sendEvent,
          timeIsUp
        );

        if (pauseResult.pausedAt !== null) {
          await sendEvent({
            status: "paused",
            message: "Approaching the time limit for this request — pausing and will resume automatically.",
            resumeState: {
              pendingInputs: remainingInputsQueue,
              currentInputListings: listings.slice(pauseResult.pausedAt),
              currentInputLabel: label,
            },
          });
          return; // stop here — browser closes in finally, client will call again
        }
      }

      // Process each remaining input from scratch (Maps/Yelp/YP -> dedupe -> enrich).
      for (let qi = 0; qi < remainingInputsQueue.length; qi++) {
        const rawInput = remainingInputsQueue[qi];
        const cleanInput = rawInput.trim();
        if (!cleanInput) continue;

        // If we're already close to the budget, don't START a brand-new
        // scraping phase (Maps/Yelp/YP) for this input at all — scraping
        // itself has no internal time-check, so beginning one this late
        // risks running past Vercel's hard limit before we get a chance
        // to send a clean "paused" event. Defer the WHOLE input, unstarted,
        // to the next request instead.
        if (timeIsUp()) {
          await sendEvent({
            status: "paused",
            message: "Approaching the time limit for this request — pausing and will resume automatically.",
            resumeState: {
              pendingInputs: remainingInputsQueue.slice(qi),
            },
          });
          return;
        }

        const isUrl = cleanInput.startsWith("http://") || cleanInput.startsWith("https://");
        const rawListings: RawListing[] = [];

        if (sources.includes("google")) {
          await sendEvent({ status: "status", message: `Scanning Google Maps for "${cleanInput}"...` });
          const mapResults = await scrapeGoogleMapsDetailed(page, cleanInput, 100);
          rawListings.push(...mapResults);
        }

        if (!isUrl && sources.includes("yelp") && !timeIsUp()) {
          await sendEvent({ status: "status", message: `Scanning Yelp listings for "${cleanInput}"...` });
          const yelpResults = await scrapeYelpPublic(page, cleanInput, 2);
          rawListings.push(...yelpResults);
        }

        if (!isUrl && sources.includes("yellowpages") && !timeIsUp()) {
          await sendEvent({ status: "status", message: `Scanning Yellow Pages listings for "${cleanInput}"...` });
          const ypResults = await scrapeYellowPagesPublic(page, cleanInput, 2);
          rawListings.push(...ypResults);
        }

        const deduplicated = deduplicateListings(rawListings) as (RawListing & Record<string, unknown>)[];

        await sendEvent({
          status: "status",
          message: `Found ${deduplicated.length} unique businesses. Enriching domain details...`,
        });

        const pauseResult = await enrichListings(deduplicated, page, sendEvent, timeIsUp);

        if (pauseResult.pausedAt !== null) {
          await sendEvent({
            status: "paused",
            message: "Approaching the time limit for this request — pausing and will resume automatically.",
            resumeState: {
              // remaining inputs after this one, still to be started fresh
              pendingInputs: remainingInputsQueue.slice(qi + 1),
              currentInputListings: deduplicated.slice(pauseResult.pausedAt),
              currentInputLabel: cleanInput,
            },
          });
          return;
        }
      }

      await sendEvent({
        status: "complete",
        message: "Scraping & enrichment task finished successfully!",
      });
    } catch (error: unknown) {
      console.error("API Scraping error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred during scraping.";

      try {
        await sendEvent({ status: "error", error: errorMessage });
      } catch (streamError) {
        console.error("Unable to send scraper error to client:", streamError);
      }
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error("Failed to close browser:", closeError);
        }
      }
      try {
        await writer.close();
      } catch (closeError) {
        console.error("Failed to close response stream:", closeError);
      }
    }
  })();

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// Enriches listings one at a time, sending each as an "item" event.
// Returns pausedAt: the index it stopped at (to resume from) if the time
// budget ran out mid-list, or null if it finished the whole list.
async function enrichListings(
  listings: (RawListing & Record<string, unknown>)[],
  page: any,
  sendEvent: (data: ScraperEvent) => Promise<void>,
  timeIsUp: () => boolean
): Promise<{ pausedAt: number | null }> {
  for (let i = 0; i < listings.length; i++) {
    if (timeIsUp()) {
      return { pausedAt: i };
    }

    const item = listings[i];

    await sendEvent({
      status: "status",
      message: `[${i + 1}/${listings.length}] Enriching ${item.name}...`,
    });

    let enrichmentData: {
      email: string;
      email_role: string;
      facebook: string;
      instagram: string;
      linkedin: string;
      twitter: string;
      youtube: string;
      tiktok: string;
    } = {
      email: "N/A",
      email_role: "N/A",
      facebook: "N/A",
      instagram: "N/A",
      linkedin: "N/A",
      twitter: "N/A",
      youtube: "N/A",
      tiktok: "N/A",
    };

    if (item.website && item.website !== "N/A") {
      try {
        enrichmentData = await scrapeWebsiteContactsFast(item.website as string, page);
      } catch (error) {
        console.error(`Website enrichment failed for ${item.website}:`, error);
      }
    }

    await sendEvent({
      status: "item",
      item: {
        ...item,
        email: enrichmentData.email,
        email_role: enrichmentData.email_role,
        facebook: enrichmentData.facebook,
        instagram: enrichmentData.instagram,
        linkedin: enrichmentData.linkedin,
        twitter: enrichmentData.twitter,
        youtube: enrichmentData.youtube,
        tiktok: enrichmentData.tiktok,
      },
    });
  }

  return { pausedAt: null };
}