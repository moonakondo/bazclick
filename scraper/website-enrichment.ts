import * as cheerio from "cheerio";

export interface EnrichedData {
  email: string;
  email_role: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  tiktok: string;
}

export function classifyEmailRole(email: string): string {
  if (!email || email === "N/A") return "N/A";
  const prefix = email.toLowerCase().split("@")[0];

  if (prefix.includes("owner") || prefix.includes("founder")) return "Owner / Founder";
  if (prefix.includes("ceo") || prefix.includes("md")) return "CEO / Managing Director";
  if (prefix.includes("cmo") || prefix.includes("marketing")) return "Marketing Manager / Head of Marketing";
  if (prefix.includes("seo")) return "SEO Manager / SEO Lead";
  if (prefix.includes("director")) return "Director";
  if (prefix.includes("sales")) return "Sales Manager / Head of Sales";
  if (prefix.includes("gm")) return "General Manager";
  if (prefix.includes("info") || prefix.includes("hello") || prefix.includes("contact")) return "Office / General email";

  return "General Contact";
}

// Google Search Fallback engine to achieve high email match rates
export async function googleSearchEmailFallback(
  page: any,
  websiteUrl: string
): Promise<string> {
  try {
    const domain = websiteUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
    const searchQuery = `email "https://${domain}"`;

    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, {
      waitUntil: "domcontentloaded",
      timeout: 12000,
    });

    const pageContent = await page.content();
    const rawMatches = pageContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    const matches: string[] = rawMatches || [];

    const validEmail = matches.find(
      (e: string) => !e.endsWith(".png") && !e.endsWith(".jpg") && !e.includes("google") && !e.includes("schema")
    );

    return validEmail || "N/A";
  } catch {
    return "N/A";
  }
}

export async function scrapeWebsiteContactsFast(
  url: string,
  page?: any
): Promise<EnrichedData> {
  const result: EnrichedData = {
    email: "N/A",
    email_role: "N/A",
    facebook: "N/A",
    instagram: "N/A",
    linkedin: "N/A",
    twitter: "N/A",
    youtube: "N/A",
    tiktok: "N/A",
  };

  try {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const validEmails = Array.from(new Set(emailMatches)).filter(
        (e: string) => !e.endsWith(".png") && !e.endsWith(".jpg") && !e.endsWith(".webp")
      );

      if (validEmails.length > 0) {
        result.email = validEmails[0];
      }

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href") || "";
        if (href.includes("facebook.com/") && result.facebook === "N/A") result.facebook = href;
        if (href.includes("instagram.com/") && result.instagram === "N/A") result.instagram = href;
        if (href.includes("linkedin.com/") && result.linkedin === "N/A") result.linkedin = href;
        if ((href.includes("twitter.com/") || href.includes("x.com/")) && result.twitter === "N/A") result.twitter = href;
        if (href.includes("youtube.com/") && result.youtube === "N/A") result.youtube = href;
        if (href.includes("tiktok.com/") && result.tiktok === "N/A") result.tiktok = href;
      });
    }
  } catch {}

  // Fallback to Google Search to hit maximum email discovery rate
  if (result.email === "N/A" && page && url !== "N/A") {
    const googleEmail = await googleSearchEmailFallback(page, url);
    if (googleEmail !== "N/A") {
      result.email = googleEmail;
    }
  }

  result.email_role = classifyEmailRole(result.email);
  return result;
}

// Accepts lead if it has an email OR at least 2 social media pages
export function isValidQualityLead(lead: EnrichedData): boolean {
  if (lead.email !== "N/A") return true;

  let socialCount = 0;
  if (lead.facebook !== "N/A") socialCount++;
  if (lead.instagram !== "N/A") socialCount++;
  if (lead.linkedin !== "N/A") socialCount++;
  if (lead.twitter !== "N/A") socialCount++;
  if (lead.youtube !== "N/A") socialCount++;
  if (lead.tiktok !== "N/A") socialCount++;

  return socialCount >= 2;
}