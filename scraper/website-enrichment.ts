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

function getRootDomain(websiteUrl: string): string {
  return websiteUrl
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase();
}

function extractValidEmails(text: string): string[] {
  const rawMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  return Array.from(new Set(rawMatches)).filter(
    (e) =>
      !e.endsWith(".png") &&
      !e.endsWith(".jpg") &&
      !e.endsWith(".jpeg") &&
      !e.endsWith(".webp") &&
      !e.endsWith(".gif") &&
      !e.includes("sentry") &&
      !e.includes("wixpress") &&
      !e.includes("example.com")
  );
}

// Prefer an email whose domain matches the business's own website domain;
// fall back to the first valid email found if none match.
function pickBestEmail(emails: string[], domain: string): string {
  if (!emails.length) return "N/A";
  const domainMatch = emails.find((e) => e.toLowerCase().endsWith(`@${domain}`));
  return domainMatch || emails[0];
}

const CANDIDATE_PATHS = ["", "/contact", "/contact-us", "/about", "/about-us"];

async function fetchEmailsFromPath(baseUrl: string, path: string): Promise<{ emails: string[]; social: Partial<EnrichedData> }> {
  const social: Partial<EnrichedData> = {};
  try {
    const target = `${baseUrl.replace(/\/$/, "")}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(target, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return { emails: [], social };

    const html = await res.text();
    const $ = cheerio.load(html);
    const emails = extractValidEmails(html);

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (href.includes("facebook.com/") && !social.facebook) social.facebook = href;
      if (href.includes("instagram.com/") && !social.instagram) social.instagram = href;
      if (href.includes("linkedin.com/") && !social.linkedin) social.linkedin = href;
      if ((href.includes("twitter.com/") || href.includes("x.com/")) && !social.twitter) social.twitter = href;
      if (href.includes("youtube.com/") && !social.youtube) social.youtube = href;
      if (href.includes("tiktok.com/") && !social.tiktok) social.tiktok = href;
    });

    return { emails, social };
  } catch {
    return { emails: [], social };
  }
}

async function fetchEmailsViaPuppeteer(page: any, baseUrl: string, path: string): Promise<string[]> {
  try {
    const target = `${baseUrl.replace(/\/$/, "")}${path}`;
    await page.goto(target, { waitUntil: "networkidle2", timeout: 15000 });
    const content = await page.content();
    return extractValidEmails(content);
  } catch {
    return [];
  }
}

// Google Search Fallback — tries a couple of phrasings and prefers
// a result email that matches the business's own domain.
export async function googleSearchEmailFallback(page: any, websiteUrl: string): Promise<string> {
  const domain = getRootDomain(websiteUrl);
  const queries = [
    `email "@${domain}"`,
    `"contact" email site:${domain}`,
  ];

  const foundEmails: string[] = [];

  for (const q of queries) {
    try {
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(q)}`, {
        waitUntil: "domcontentloaded",
        timeout: 12000,
      });
      const pageContent = await page.content();
      foundEmails.push(...extractValidEmails(pageContent));
    } catch {
      // try next query
    }

    // Stop early if we already have a domain-matching email
    if (foundEmails.some((e) => e.toLowerCase().endsWith(`@${domain}`))) break;
  }

  return pickBestEmail(foundEmails, domain);
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

  const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
  const domain = getRootDomain(formattedUrl);
  const allEmails: string[] = [];

  // Pass 1: fast fetch() across homepage + a few likely contact/about pages
  for (const path of CANDIDATE_PATHS) {
    const { emails, social } = await fetchEmailsFromPath(formattedUrl, path);
    allEmails.push(...emails);

    // Fill in socials the first time we see them
    if (social.facebook && result.facebook === "N/A") result.facebook = social.facebook;
    if (social.instagram && result.instagram === "N/A") result.instagram = social.instagram;
    if (social.linkedin && result.linkedin === "N/A") result.linkedin = social.linkedin;
    if (social.twitter && result.twitter === "N/A") result.twitter = social.twitter;
    if (social.youtube && result.youtube === "N/A") result.youtube = social.youtube;
    if (social.tiktok && result.tiktok === "N/A") result.tiktok = social.tiktok;

    // Stop early once we find a domain-matching email — no need to keep crawling
    if (allEmails.some((e) => e.toLowerCase().endsWith(`@${domain}`))) break;
  }

  // Pass 2: if fetch() found nothing, and we have a real Puppeteer page,
  // re-check the same pages with a real browser (catches JS-rendered emails)
  if (allEmails.length === 0 && page) {
    for (const path of CANDIDATE_PATHS) {
      const emails = await fetchEmailsViaPuppeteer(page, formattedUrl, path);
      allEmails.push(...emails);
      if (allEmails.some((e) => e.toLowerCase().endsWith(`@${domain}`))) break;
    }
  }

  if (allEmails.length > 0) {
    result.email = pickBestEmail(allEmails, domain);
  }

  // Pass 3: Google Search fallback, only if still nothing
  if (result.email === "N/A" && page && url !== "N/A") {
    const googleEmail = await googleSearchEmailFallback(page, formattedUrl);
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

export { scrapeWebsiteContactsFast as enrichWebsiteDetails };