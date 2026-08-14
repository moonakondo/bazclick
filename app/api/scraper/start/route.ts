import { NextRequest } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import {
  scrapeGoogleMapsDetailed,
  scrapeYelpPublic,
  scrapeYellowPagesPublic,
  deduplicateListings,
  RawListing,
} from "@/scraper/multi-source";
import {
  scrapeWebsiteContactsFast,
  isValidQualityLead,
} from "@/scraper/website-enrichment";

// Configure Next.js runtime limits for scraping
export const maxDuration = 60; // Allows route to run up to 60s on Vercel
export const dynamic = "force-dynamic";

async function getBrowserInstance() {
  const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

  if (isVercel) {
    // Vercel Serverless Environment
    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Local Laptop Environment (Windows)
    const puppeteerLocal = await import("puppeteer");
    return await puppeteerLocal.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,800"],
    });
  }
}

export async function POST(req: NextRequest) {
  const { inputs, sources = ["google", "yelp", "yellowpages"] } = await req.json();

  if (!inputs || !Array.isArray(inputs) || !inputs.length) {
    return new Response(JSON.stringify({ error: "No inputs provided." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        sendEvent({ status: "status", message: "Launching browser engines..." });

        const browser = await getBrowserInstance();
        const page = await browser.newPage();
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        let rawListings: RawListing[] = [];

        for (const input of inputs) {
          const cleanInput = input.trim();
          if (!cleanInput) continue;

          if (sources.includes("google")) {
            sendEvent({ status: "status", message: `Scanning Google Maps listings...` });
            const mapResults = await scrapeGoogleMapsDetailed(page, cleanInput, 100);
            rawListings.push(...mapResults);
          }

          if (!cleanInput.startsWith("http")) {
            if (sources.includes("yelp")) {
              sendEvent({ status: "status", message: `Navigating multi-page Yelp results...` });
              const yelpResults = await scrapeYelpPublic(page, cleanInput, 3);
              rawListings.push(...yelpResults);
            }

            if (sources.includes("yellowpages")) {
              sendEvent({ status: "status", message: `Navigating multi-page Yellow Pages results...` });
              const ypResults = await scrapeYellowPagesPublic(page, cleanInput, 3);
              rawListings.push(...ypResults);
            }
          }
        }

        const uniqueListings = deduplicateListings(rawListings);
        const totalDiscovered = uniqueListings.length;

        sendEvent({
          status: "status",
          message: `Discovered ${totalDiscovered} potential listings. Extracting emails & social links...`,
        });

        let validLeadsCount = 0;

        for (let i = 0; i < uniqueListings.length; i++) {
          const listing = uniqueListings[i];

          let enrichment = {
            email: "N/A",
            email_role: "N/A",
            facebook: "N/A",
            instagram: "N/A",
            linkedin: "N/A",
            twitter: "N/A",
            youtube: "N/A",
            tiktok: "N/A",
          };

          if (listing.website && listing.website !== "N/A") {
            enrichment = await scrapeWebsiteContactsFast(listing.website, page);
          }

          if (!isValidQualityLead(enrichment)) {
            continue;
          }

          validLeadsCount++;
          const completeItem = { ...listing, ...enrichment };

          sendEvent({
            status: "item",
            item: completeItem,
            count: validLeadsCount,
            message: `${validLeadsCount} Leads Scraped out of ${totalDiscovered} Discovered & Still Finding...`,
          });
        }

        await browser.close();

        sendEvent({
          status: "complete",
          count: validLeadsCount,
          message: `${validLeadsCount} Leads Scraped totally.`,
        });

        controller.close();
      } catch (err: any) {
        sendEvent({ status: "error", error: err.message || "Scraping failed." });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}