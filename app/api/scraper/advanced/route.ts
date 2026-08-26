import { NextRequest, NextResponse } from "next/server";
import { scrapeGoogleAndMaps, isCommercialDomain } from "@/scraper/advanced-multi-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const maxDuration = 300; // 5-minute timeout window for streaming

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keywords: string[] = body.keywords || [];
    
    // Defaulted to false so leads aren't dropped while Facebook ID check is blocked/walled.
    // If sent explicitly in the request body, it will honor that value.
    const requireActiveAds: boolean = body.requireActiveAds ?? false;
    
    // Limits max listings per keyword to keep execution fast
    const maxListingsPerKeyword: number = body.maxListingsPerKeyword || 15;

    if (!keywords.length) {
      return NextResponse.json({ success: false, error: "No keywords provided" }, { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(data: any) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (_) {}
        }

        try {
          sendEvent({
            type: "status",
            message: requireActiveAds
              ? "Starting scraper (Active Facebook Ads leads only)..."
              : "Starting scraper (all leads, active ads filter disabled for debugging)...",
          });

          let totalFound = 0;

          // Global dedup set shared across all keywords in this execution
          const globalSeenTracker = new Set<string>();

          for (const rawKeyword of keywords) {
            const keyword = rawKeyword.trim();

            sendEvent({ type: "status", message: `Auditing leads for: "${keyword}"...` });

            const leads = await scrapeGoogleAndMaps(
              keyword, 
              globalSeenTracker, 
              requireActiveAds, 
              maxListingsPerKeyword
            );

            for (const lead of leads) {
              const website = (lead as any).Website || (lead as any).websiteUrl || "N/A";
              if (isCommercialDomain(website)) {
                totalFound++;
                sendEvent({ type: "lead", lead, count: totalFound });
              }
            }
          }

          sendEvent({
            type: "done",
            message: `Finished. ${totalFound} verified lead(s) found${requireActiveAds ? " with active Facebook ads" : ""}.`,
          });
          controller.close();
        } catch (err: any) {
          sendEvent({ type: "error", message: err.message || "Scraping engine execution failed." });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0, no-transform",
        Pragma: "no-cache",
        Expires: "0",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}