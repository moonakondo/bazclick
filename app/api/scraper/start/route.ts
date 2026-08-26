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

interface ScraperRequest {
  inputs: unknown;
  sources?: unknown;
}

interface ScraperEvent {
  status: "status" | "item" | "complete" | "error";
  message?: string;
  item?: RawListing & Record<string, unknown>;
  error?: string;
}

export async function POST(req: Request) {
  let body: ScraperRequest;

  try {
    body = (await req.json()) as ScraperRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.inputs) || body.inputs.length === 0) {
    return NextResponse.json(
      { error: "Inputs array is required." },
      { status: 400 }
    );
  }

  const inputs = body.inputs.filter(
    (input): input is string => typeof input === "string"
  );

  if (inputs.length === 0) {
    return NextResponse.json(
      { error: "Inputs must contain at least one valid string." },
      { status: 400 }
    );
  }

  const sources = Array.isArray(body.sources)
    ? body.sources.filter(
        (source): source is string => typeof source === "string"
      )
    : ["google"];

  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = async (data: ScraperEvent): Promise<void> => {
    await writer.write(
      encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
    );
  };

  (async () => {
    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

    try {
      const isLocal = process.env.NODE_ENV === "development";

      await sendEvent({
        status: "status",
        message: "Launching browser engine...",
      });

      let executablePath: string;

      if (isLocal) {
        executablePath =
          process.env.PUPPETEER_EXECUTABLE_PATH ||
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
      } else {
        executablePath = await chromium.executablePath();

        console.log(
          "Chromium executable path:",
          executablePath
        );
      }

      if (!executablePath) {
        throw new Error(
          "Chromium executable path could not be determined."
        );
      }

      browser = await puppeteer.launch({
        args: isLocal ? [] : chromium.args,
        defaultViewport: {
          width: 1280,
          height: 800,
        },
        executablePath,
        headless: true,
      });

      const page = await browser.newPage();

      for (const rawInput of inputs) {
        const cleanInput = rawInput.trim();

        if (!cleanInput) {
          continue;
        }

        const isUrl =
          cleanInput.startsWith("http://") ||
          cleanInput.startsWith("https://");

        const rawListings: RawListing[] = [];

        // ---------------------------------------------------------
        // 1. GOOGLE MAPS
        // ---------------------------------------------------------

        if (sources.includes("google")) {
          await sendEvent({
            status: "status",
            message: `Scanning Google Maps for "${cleanInput}"...`,
          });

          const mapResults = await scrapeGoogleMapsDetailed(
            page,
            cleanInput,
            100
          );

          rawListings.push(...mapResults);
        }

        // ---------------------------------------------------------
        // 2. YELP
        // ---------------------------------------------------------

        if (!isUrl && sources.includes("yelp")) {
          await sendEvent({
            status: "status",
            message: `Scanning Yelp listings for "${cleanInput}"...`,
          });

          const yelpResults = await scrapeYelpPublic(
            page,
            cleanInput,
            2
          );

          rawListings.push(...yelpResults);
        }

        // ---------------------------------------------------------
        // 3. YELLOW PAGES
        // ---------------------------------------------------------

        if (!isUrl && sources.includes("yellowpages")) {
          await sendEvent({
            status: "status",
            message: `Scanning Yellow Pages listings for "${cleanInput}"...`,
          });

          const ypResults = await scrapeYellowPagesPublic(
            page,
            cleanInput,
            2
          );

          rawListings.push(...ypResults);
        }

        // ---------------------------------------------------------
        // 4. DEDUPLICATION
        // ---------------------------------------------------------

        const deduplicated = deduplicateListings(rawListings);

        await sendEvent({
          status: "status",
          message: `Found ${deduplicated.length} unique businesses. Enriching domain details...`,
        });

        // ---------------------------------------------------------
        // 5. WEBSITE ENRICHMENT
        // ---------------------------------------------------------

        for (let i = 0; i < deduplicated.length; i++) {
          const item = deduplicated[i];

          await sendEvent({
            status: "status",
            message: `[${i + 1}/${deduplicated.length}] Enriching ${item.name}...`,
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
              enrichmentData = await scrapeWebsiteContactsFast(
                item.website,
                page
              );
            } catch (error) {
              console.error(
                `Website enrichment failed for ${item.website}:`,
                error
              );
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
      }

      await sendEvent({
        status: "complete",
        message: "Scraping & enrichment task finished successfully!",
      });
    } catch (error: unknown) {
      console.error("API Scraping error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during scraping.";

      try {
        await sendEvent({
          status: "error",
          error: errorMessage,
        });
      } catch (streamError) {
        console.error(
          "Unable to send scraper error to client:",
          streamError
        );
      }
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error(
            "Failed to close browser:",
            closeError
          );
        }
      }

      try {
        await writer.close();
      } catch (closeError) {
        console.error(
          "Failed to close response stream:",
          closeError
        );
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