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
export const maxDuration = 60; // Max allowed duration on Vercel hobby/pro tier

export async function POST(req: Request) {
  const { inputs, sources = ["google"] } = await req.json();

  if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
    return NextResponse.json(
      { error: "Inputs array is required." },
      { status: 400 }
    );
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (data: any) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  // Run scraper process asynchronously inside the stream lifecycle
  (async () => {
    let browser = null;

    try {
      sendEvent({ status: "status", message: "Launching browser engine..." });

      const isLocal = process.env.NODE_ENV === "development";
      const executablePath = isLocal
        ? process.env.PUPPETEER_EXECUTABLE_PATH ||
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // Adjust path if local Chrome is elsewhere
        : await chromium.executablePath();

      browser = await puppeteer.launch({
        args: isLocal ? [] : chromium.args,
        defaultViewport: { width: 1280, height: 800 },
        executablePath,
        headless: true,
      });

      const page = await browser.newPage();

      for (const rawInput of inputs) {
        const cleanInput = rawInput.trim();
        if (!cleanInput) continue;

        const isUrl = cleanInput.startsWith("http");
        const rawListings: RawListing[] = [];

        // 1. Google Maps Scraping (Targeting up to 100 leads per query/link)
        if (sources.includes("google")) {
          sendEvent({
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

        // 2. Yelp & Yellow Pages (Only executed for text search keywords, skipped for URLs)
        if (!isUrl) {
          if (sources.includes("yelp")) {
            sendEvent({
              status: "status",
              message: `Scanning Yelp listings for "${cleanInput}"...`,
            });
            const yelpResults = await scrapeYelpPublic(page, cleanInput, 2);
            rawListings.push(...yelpResults);
          }

          if (sources.includes("yellowpages")) {
            sendEvent({
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
        }

        // Deduplicate extracted raw items
        const deduplicated = deduplicateListings(rawListings);
        sendEvent({
          status: "status",
          message: `Found ${deduplicated.length} unique businesses. Enriching domain details...`,
        });

        // 3. Website Enrichment Phase (Extracts Emails, Socials, & Contact Info)
        for (let i = 0; i < deduplicated.length; i++) {
          const item = deduplicated[i];

          sendEvent({
            status: "status",
            message: `[${i + 1}/${deduplicated.length}] Enriching ${item.name}...`,
          });

          // Default values in case enrichment fails or site has no website
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
              // IMPORTANT: url comes first, page comes second —
              // this matches scrapeWebsiteContactsFast's real signature
              enrichmentData = await scrapeWebsiteContactsFast(
                item.website,
                page
              );
            } catch {
              // Gracefully handle domain fetch timeouts
            }
          }

          // Emit finished lead to client UI instantly
          sendEvent({
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

      sendEvent({
        status: "complete",
        message: "Scraping & enrichment task finished successfully!",
      });
    } catch (error: any) {
      console.error("API Scraping error:", error);
      sendEvent({
        status: "error",
        error: error?.message || "An unexpected error occurred during scraping.",
      });
    } finally {
      if (browser) await browser.close();
      writer.close();
    }
  })();

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}