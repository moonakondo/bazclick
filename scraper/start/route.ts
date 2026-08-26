import { NextRequest } from "next/server";
import { scrapeMultipleKeywords, AdvancedLead } from "@/scraper/advanced-multi-source";

export const runtime = "nodejs";
// Puppeteer runs can take minutes — raise this if your host allows it
// (e.g. Vercel Pro allows up to 800s on this config; ignored on plain Node hosting).
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  let body: { keywords?: string[]; requireActiveAds?: boolean };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid JSON body." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const keywords: string[] = Array.isArray(body.keywords) ? body.keywords : [];
  const requireActiveAds: boolean = !!body.requireActiveAds;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      function sendEvent(data: Record<string, unknown>) {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller already closed/errored — ignore
        }
      }

      if (keywords.length === 0) {
        sendEvent({ type: "error", message: "No keywords provided." });
        sendEvent({ type: "done" });
        closed = true;
        controller.close();
        return;
      }

      sendEvent({
        type: "status",
        message: `Starting scrape for ${keywords.length} keyword(s)...`,
      });

      try {
        await scrapeMultipleKeywords(keywords, requireActiveAds, (lead: AdvancedLead) => {
          sendEvent({ type: "lead", lead });
        });
        sendEvent({ type: "done" });
      } catch (err) {
        // This is the top-level safety net. Individual scrape failures inside
        // scrapeGoogleAndMaps are already caught there and logged to the server
        // console — this only fires on something unexpected escaping that.
        console.error("Scraper stream error:", err);
        sendEvent({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown scraper error",
        });
        sendEvent({ type: "done" });
      } finally {
        closed = true;
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

export async function GET() {
  return new Response(
    JSON.stringify({ success: true, status: "ready", message: "Scraper service is ready." }),
    { headers: { "Content-Type": "application/json" } }
  );
}