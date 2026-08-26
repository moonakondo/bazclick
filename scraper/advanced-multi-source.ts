import puppeteer from "puppeteer-core";
import type { Page, LaunchOptions } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";

export interface AdvancedLead {
  "Brand Name": string;
  "Website": string;
  "Brand Category": string;
  "Address": string;
  "Service Area": string;
  "Email": string;
  "Phone": string;
  "Facebook": string;
  "YouTube": string;
  "Instagram": string;
  "Instagram Followers": string;
  "FB Follower": string;
  "YouTube Subscriber": string;
  "Social Activity": string;
  "SM Last Post": string;
  "SM Video Content Quality": string;
  "SM Image Content Quality": string;
  "SM Posting Frequency": string;
  "FB Ads": string;
  "Website Present": string;
  "Website Functions": string;
  "Website Speed": string;
  "Website Content": string;
  "Website On-page SEO": string;
  "Website Design": string;
  "Website Condition": string;
  "Website Traffic": string;
  "Website's Missings": string;
  "Google Ads": string;
  "Google My Business": string;
  "GMB Post Frequency": string;
  "GMB Review": string;
  "GMB Quality": string;
  "Top 5 Missings for Brand": string;
  "Main Brand Problem": string;
  "Overall Missing Notes": string;
  "Automated Business Gap Mail": string;
  "Send Email to Brand Author": string;
  _isRunningFacebookAds?: boolean;
}

const INFORMATIONAL_DOMAINS = [
  "wikipedia.org", "youtube.com", "quora.com", "reddit.com",
  "pinterest.com", "medium.com", "bdjobs.com", "bikroy.com", "daraz.com.bd", "yellowpages.com",
];

export function isCommercialDomain(url: string): boolean {
  if (!url || url === "N/A") return true;
  return !INFORMATIONAL_DOMAINS.some((domain) => url.toLowerCase().includes(domain));
}

export function parseDhakaZone(address: string) {
  const addr = address.toLowerCase();
  if (addr.includes("uttara") || addr.includes("turag") || addr.includes("abdullahpur")) return { area: "Uttara", zone: "DNCC Zone 01" };
  if (addr.includes("mirpur") || addr.includes("pallabi") || addr.includes("kafrul")) return { area: "Mirpur", zone: "DNCC Zone 02" };
  if (addr.includes("gulshan") || addr.includes("banani") || addr.includes("baridhara") || addr.includes("nikunja") || addr.includes("mohakali")) return { area: "Gulshan / Banani", zone: "DNCC Zone 03" };
  if (addr.includes("badda") || addr.includes("rampura") || addr.includes("vatara") || addr.includes("aftabnagar")) return { area: "Badda / Rampura", zone: "DNCC Zone 04" };
  if (addr.includes("mohammadpur") || addr.includes("adabor") || addr.includes("tejgaon") || addr.includes("karwan bazar")) return { area: "Mohammadpur / Tejgaon", zone: "DNCC Zone 05" };
  if (addr.includes("dhanmondi") || addr.includes("kalabagan") || addr.includes("new market") || addr.includes("green road")) return { area: "Dhanmondi", zone: "DSCC Zone 01" };
  if (addr.includes("motijheel") || addr.includes("paltan") || addr.includes("kakrail")) return { area: "Motijheel", zone: "DSCC Zone 02" };
  if (addr.includes("lalbagh") || addr.includes("kotwali") || addr.includes("old dhaka")) return { area: "Old Dhaka", zone: "DSCC Zone 03" };
  if (addr.includes("jatrabari") || addr.includes("demra")) return { area: "Jatrabari", zone: "DSCC Zone 04" };
  if (addr.includes("khilgaon") || addr.includes("basabo") || addr.includes("mugda")) return { area: "Khilgaon", zone: "DSCC Zone 05" };

  return { area: "Dhaka Central", zone: "General Dhaka Zone" };
}

function cleanLocationText(rawText: string, businessName: string): string {
  if (!rawText) return "Dhaka, Bangladesh";
  let cleaned = rawText.replace(/(\+?880\s?1[3-9]\d{2}[-\s]?\d{6}|\b01[3-9]\d{2}[-\s]?\d{6}\b)/g, "");
  if (businessName) {
    const escName = businessName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(escName, "gi"), "");
  }
  cleaned = cleaned
    .replace(/\b[1-5]\.\d(\(\d+\))?/g, "")
    .replace(/Interior architect office|Interior designer|Architectural designer|Corporate office|Home goods store/gi, "")
    .replace(/Website|Directions|Save|Share|Call|Claim this business|Open|Closed|·/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length < 8 ? "Dhaka, Bangladesh" : cleaned;
}

async function resolveFacebookPageId(page: Page, facebookUrl: string): Promise<string | null> {
  if (!facebookUrl || facebookUrl === "N/A") return null;
  try {
    await page.goto(facebookUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    const html = await page.content();
    const patterns = [
      /"pageID":"(\d+)"/,
      /"page_id":"(\d+)"/,
      /"entity_id":"(\d+)"/,
      /profile_id=(\d+)/,
      /"userID":"(\d+)"/,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m && m[1]) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}

export async function checkFacebookAdsStatus(
  page: Page,
  facebookUrl: string
): Promise<{ isRunningAds: boolean; status: string }> {
  if (!facebookUrl || facebookUrl === "N/A") {
    return { isRunningAds: false, status: "Inactive (No FB Page)" };
  }

  const pageId = await resolveFacebookPageId(page, facebookUrl);
  if (!pageId) {
    return { isRunningAds: false, status: "Unverified" };
  }

  try {
    const adLibraryUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BD&view_all_page_id=${pageId}`;
    await page.goto(adLibraryUrl, { waitUntil: "networkidle2", timeout: 25000 });
    await new Promise((r) => setTimeout(r, 2000));

    const bodyText = (await page.evaluate(() => document.body.innerText)) || "";
    const lower = bodyText.toLowerCase();

    const noAdsPhrases = ["hasn't run any ads", "has not run any ads", "0 results", "no ads match"];
    const hasNoAds = noAdsPhrases.some((p) => lower.includes(p));
    const countMatch = bodyText.match(/~?([\d,]+)\s+results?/i);

    const isRunning = !hasNoAds && !!countMatch && countMatch[1] ? parseInt(countMatch[1].replace(/,/g, ""), 10) > 0 : false;
    return {
      isRunningAds: isRunning,
      status: isRunning ? `Active (${countMatch && countMatch[1] ? countMatch[1] : "1+"} Ads)` : "Inactive (No Active Ads)",
    };
  } catch {
    return { isRunningAds: false, status: "Check Failed" };
  }
}

async function getFacebookFollowerCount(page: Page, facebookUrl: string): Promise<string> {
  if (!facebookUrl || facebookUrl === "N/A") return "N/A";
  try {
    const slugMatch = facebookUrl.match(/facebook\.com\/([^/?#]+)/i);
    if (!slugMatch) return "N/A";
    await page.goto(`https://mbasic.facebook.com/${slugMatch[1]}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    const text = (await page.evaluate(() => document.body.innerText)) || "";
    const match = text.match(/([\d,.]+[KM]?)\s*(followers|likes|people follow this)/i);
    return match ? match[1] : "N/A";
  } catch {
    return "N/A";
  }
}

async function performTargetedOSINT(businessName: string) {
  let website = "N/A";
  let phone = "N/A";
  let facebookUrl = "N/A";
  let instagramUrl = "N/A";
  let youtubeUrl = "N/A";

  const cleanName = businessName.replace(/[^a-zA-Z0-9\s]/g, "").trim();

  try {
    const query = `"${cleanName}" Dhaka site:facebook.com OR site:instagram.com OR site:youtube.com OR website`;
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const res = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36",
      },
      timeout: 8000,
    });

    const $ = cheerio.load(res.data);

    $("a.result__url").each((_, el) => {
      const rawHref = $(el).attr("href") || "";
      let decoded = rawHref;
      const match = rawHref.match(/uddg=([^&]+)/);
      if (match && match[1]) decoded = decodeURIComponent(match[1]);
      decoded = decoded.split("?")[0].split("#")[0];
      const lower = decoded.toLowerCase();

      if (website === "N/A" && isCommercialDomain(decoded) && !lower.includes("duckduckgo.com") && !lower.includes("google.com") && !lower.includes("facebook.com") && !lower.includes("instagram.com") && !lower.includes("youtube.com")) {
        website = decoded;
      }
      if (facebookUrl === "N/A" && lower.includes("facebook.com/") && !lower.includes("/groups/") && !lower.includes("/sharer")) {
        facebookUrl = decoded;
      }
      if (instagramUrl === "N/A" && lower.includes("instagram.com/") && !lower.includes("/p/")) {
        instagramUrl = decoded;
      }
      if (youtubeUrl === "N/A" && lower.includes("youtube.com/") && !lower.includes("/watch")) {
        youtubeUrl = decoded;
      }
    });

    const bodyText = $.text();
    const phoneMatch = bodyText.match(/(\+?880\s?1[3-9]\d{8}|\b01[3-9]\d{8}\b)/);
    if (phoneMatch) phone = phoneMatch[0].replace(/\s+/g, "");
  } catch (_) {}

  return { website, phone, facebookUrl, instagramUrl, youtubeUrl };
}

export async function deepAuditWebsite(url: string) {
  if (!url || url === "N/A" || !url.startsWith("http")) {
    return {
      websitePresent: "No",
      websiteFunctions: "N/A",
      websiteSpeed: "N/A",
      websiteContent: "N/A",
      websiteOnpageSEO: "Poor",
      websiteDesign: "N/A",
      websiteCondition: "Non-existent",
      websiteTraffic: "Low/None",
      websiteMissings: "Entire Website Missing, HTTPS, SEO Schema, Lead Forms",
      foundEmail: "N/A",
      facebookUrl: "N/A",
      instagramUrl: "N/A",
      youtubeUrl: "N/A",
      hasGoogleAdsTag: false,
      hasVideo: false,
    };
  }

  try {
    const startTime = Date.now();
    const res = await axios.get(url, {
      timeout: 8000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    const responseTime = (Date.now() - startTime) / 1000;
    const html = res.data || "";
    const $ = cheerio.load(html);

    const hasH1 = $("h1").length > 0;
    const htmlLower = html.toLowerCase();
    const hasGoogleAdsTag = htmlLower.includes("gtag") || htmlLower.includes("googletagmanager");

    const rawEmails = html.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [];
    const validEmails = rawEmails.filter((e: string) => !e.endsWith(".png") && !e.endsWith(".jpg"));
    const foundEmail = validEmails.length > 0 ? validEmails[0] : "N/A";

    let facebookUrl = "N/A";
    let instagramUrl = "N/A";
    let youtubeUrl = "N/A";

    $("a[href]").each((_, el) => {
      const href = ($(el).attr("href") || "").split("?")[0];
      const lowerHref = href.toLowerCase();
      if (facebookUrl === "N/A" && lowerHref.includes("facebook.com/")) facebookUrl = href;
      if (instagramUrl === "N/A" && lowerHref.includes("instagram.com/")) instagramUrl = href;
      if (youtubeUrl === "N/A" && lowerHref.includes("youtube.com/")) youtubeUrl = href;
    });

    const hasWhatsapp = htmlLower.includes("wa.me") || htmlLower.includes("whatsapp");
    const hasEcommerce = htmlLower.includes("cart") || htmlLower.includes("checkout");
    const hasForm = $("form").length > 0;
    const hasVideo = $("video").length > 0 || htmlLower.includes("youtube.com/embed");

    const missings: string[] = [];
    if (!hasWhatsapp) missings.push("WhatsApp Live Chat");
    if (!hasEcommerce) missings.push("Online Booking/E-commerce");
    if (!hasForm) missings.push("Lead Capture Form");
    if (!hasH1) missings.push("H1 Tags Optimization");
    if (responseTime > 3.0) missings.push("Speed Optimization");

    const speed = responseTime < 1.8 ? "Fast (<2s)" : responseTime < 3.5 ? "Average (2-4s)" : "Slow (>4s)";
    const condition = html.length > 40000 && responseTime < 2.0 ? "Excellent" : html.length > 15000 ? "Good" : "Needs Overhaul";

    return {
      websitePresent: "Yes",
      websiteFunctions: hasEcommerce ? "E-commerce Active" : hasForm ? "Contact Form Active" : "Basic Informational",
      websiteSpeed: speed,
      websiteContent: html.length > 30000 ? "Rich Content" : "Minimal Content",
      websiteOnpageSEO: hasH1 ? "Optimized (H1 Found)" : "Poor (Missing H1/Meta)",
      websiteDesign: html.length > 30000 ? "Modern UI/UX" : "Outdated UI/UX",
      websiteCondition: condition,
      websiteTraffic: responseTime < 2.0 ? "Moderate to High" : "Low",
      websiteMissings: missings.length > 0 ? missings.join(", ") : "None Detected",
      foundEmail,
      facebookUrl,
      instagramUrl,
      youtubeUrl,
      hasGoogleAdsTag,
      hasVideo,
    };
  } catch {
    return {
      websitePresent: "Unreachable",
      websiteFunctions: "N/A",
      websiteSpeed: "Slow",
      websiteContent: "Broken",
      websiteOnpageSEO: "Poor",
      websiteDesign: "Broken",
      websiteCondition: "Critical Error",
      websiteTraffic: "None",
      websiteMissings: "SSL Security, Fast Hosting, Clean Code",
      foundEmail: "N/A",
      facebookUrl: "N/A",
      instagramUrl: "N/A",
      youtubeUrl: "N/A",
      hasGoogleAdsTag: false,
      hasVideo: false,
    };
  }
}

type LaunchOptionsType = Parameters<typeof puppeteer.launch>[0];

async function getBrowserLaunchOptions(): Promise<LaunchOptionsType> {
  const isVercel = Boolean(process.env.VERCEL);

  if (isVercel) {
    return {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    };
  }

  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ];

  const systemPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA || ""}\\Google\\Chrome\\Application\\chrome.exe`,
  ];

  for (const executablePath of systemPaths) {
    if (executablePath && fs.existsSync(executablePath)) {
      return {
        args,
        executablePath,
        headless: true,
      };
    }
  }

  throw new Error(
    "Chrome executable not found. Install Google Chrome or run on Vercel with @sparticuz/chromium."
  );
}
async function extractFromPlaceDetail(page: Page, listingUrl: string) {
  try {
    await page.goto(listingUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForSelector("h1", { timeout: 10000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1000));

    return await page.evaluate(() => {
      const getText = (sel: string) => document.querySelector(sel)?.textContent?.trim() || "";
      const name = getText("h1");
      const websiteEl = document.querySelector('a[data-item-id="authority"]') as HTMLAnchorElement | null;
      const website = websiteEl?.href || "N/A";

      let phone = "N/A";
      const phoneEl = document.querySelector('button[data-item-id^="phone:tel:"]');
      if (phoneEl) {
        const m = (phoneEl.getAttribute("data-item-id") || "").match(/phone:tel:(.+)/);
        if (m) phone = m[1];
      }

      const addrEl = document.querySelector('button[data-item-id="address"]');
      const address = addrEl?.textContent?.trim() || "N/A";

      let rating = "N/A";
      let reviews = "N/A";
      const ratingEl = document.querySelector('div.F7nice span[aria-hidden="true"]');
      if (ratingEl) rating = ratingEl.textContent?.trim() || "N/A";
      const reviewEl = document.querySelector('div.F7nice span[aria-label*="review" i]');
      if (reviewEl) {
        const m = (reviewEl.getAttribute("aria-label") || reviewEl.textContent || "").match(/([\d,]+)/);
        if (m) reviews = m[1].replace(/,/g, "");
      }

      return { name, website, phone, address, rating, reviews };
    });
  } catch {
    return null;
  }
}

export async function scrapeMultipleKeywords(
  keywords: string[] = ["interior design company Dhaka", "home decor Dhaka"],
  requireActiveAds: boolean = false,
  onLead?: (lead: AdvancedLead) => void
): Promise<AdvancedLead[]> {
  const globalUniqueTracker = new Set<string>();
  const aggregatedLeads: AdvancedLead[] = [];

  for (const keyword of keywords) {
    const leads = await scrapeGoogleAndMaps(keyword, globalUniqueTracker, requireActiveAds);
    for (const lead of leads) {
      aggregatedLeads.push(lead);
      if (onLead) onLead(lead);
    }
  }

  return aggregatedLeads;
}

export async function scrapeGoogleAndMaps(
  keyword: string = "interior design company Dhaka",
  seenTracker: Set<string> = new Set<string>(),
  requireActiveAds: boolean = false,
  maxListingsPerKeyword: number = 15
): Promise<AdvancedLead[]> {
  let browser;
  const rawItems: { name: string; url: string }[] = [];

  try {
    const options = await getBrowserLaunchOptions();
    browser = await puppeteer.launch(options);
    const searchPage = await browser.newPage();
    await searchPage.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36");

    await searchPage.goto(`https://www.google.com/maps/search/${encodeURIComponent(keyword)}?hl=en`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await searchPage.waitForSelector('div[role="article"], a[href*="/maps/place/"]', { timeout: 12000 }).catch(() => {});

    await searchPage.evaluate(async () => {
      const feed = document.querySelector('div[role="feed"]');
      if (!feed) return;
      let totalHeight = 0;
      while (totalHeight < 5000) {
        feed.scrollBy(0, 300);
        totalHeight += 300;
        await new Promise((r) => setTimeout(r, 600));
      }
    });

    const listingLinks = await searchPage.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="/maps/place/"]')) as HTMLAnchorElement[];
      return anchors.map((a) => ({ name: a.getAttribute("aria-label") || a.textContent?.trim() || "", url: a.href })).filter(i => i.name && i.url);
    });

    const seenUrls = new Set<string>();
    for (const item of listingLinks) {
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        rawItems.push(item);
      }
    }
    await searchPage.close();

    const cappedItems = rawItems.slice(0, maxListingsPerKeyword);
    const detailPage = await browser.newPage();
    await detailPage.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36");

    const detailResults = [];
    for (const item of cappedItems) {
      const detail = await extractFromPlaceDetail(detailPage, item.url);
      if (!detail) continue;

      const key = `${(detail.name || item.name).toLowerCase().replace(/[^a-z0-9]/g, "")}_${(detail.phone || "").replace(/[^0-9]/g, "")}`;
      if (seenTracker.has(key)) continue;
      seenTracker.add(key);

      detailResults.push({
        name: detail.name || item.name,
        address: detail.address || "N/A",
        phone: detail.phone || "N/A",
        website: detail.website || "N/A",
        rating: detail.rating || "N/A",
        reviews: detail.reviews || "N/A",
      });
    }
    await detailPage.close();

    const auditPage = await browser.newPage();
    await auditPage.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36");
    const finalLeads: AdvancedLead[] = [];

    for (const item of detailResults) {
      const cleanedAddress = cleanLocationText(item.address, item.name);
      const dhakaZone = parseDhakaZone(`${cleanedAddress} ${item.name}`);
      const webAudit = await deepAuditWebsite(item.website);

      let finalWebsite = item.website === "N/A" ? "N/A" : item.website;
      let finalFacebook = webAudit.facebookUrl;
      let finalInstagram = webAudit.instagramUrl;
      let finalYouTube = webAudit.youtubeUrl;
      let finalPhone = item.phone;

      if (finalWebsite === "N/A" || finalFacebook === "N/A" || finalInstagram === "N/A") {
        const osint = await performTargetedOSINT(item.name);
        if (finalWebsite === "N/A") finalWebsite = osint.website;
        if (finalPhone === "N/A") finalPhone = osint.phone;
        if (finalFacebook === "N/A") finalFacebook = osint.facebookUrl;
        if (finalInstagram === "N/A") finalInstagram = osint.instagramUrl;
        if (finalYouTube === "N/A") finalYouTube = osint.youtubeUrl;
      }

      const adStatus = await checkFacebookAdsStatus(auditPage, finalFacebook);
      if (requireActiveAds && !adStatus.isRunningAds) continue;

      const fbFollowers = await getFacebookFollowerCount(auditPage, finalFacebook);

      let finalEmail = webAudit.foundEmail;
      if (finalEmail === "N/A" && finalWebsite !== "N/A") {
        try {
          const host = new URL(finalWebsite).hostname.replace("www.", "");
          finalEmail = `info@${host}`;
        } catch (_) {}
      }

      const missingsList: string[] = [];
      if (finalWebsite === "N/A") missingsList.push("1. Commercial Website");
      if (!webAudit.hasGoogleAdsTag) missingsList.push("2. Google Ads Tracking");
      if (!adStatus.isRunningAds) missingsList.push("3. Meta Ads Retargeting");
      if (finalEmail === "N/A") missingsList.push("4. Direct Business Email");
      if (webAudit.websiteSpeed === "Slow") missingsList.push("5. Fast Page Speed Optimization");
      while (missingsList.length < 5) missingsList.push(`${missingsList.length + 1}. SEO Schema & Local Citations`);

      const top5Missings = missingsList.join(" | ");
      const mainProblem = finalWebsite === "N/A" ? "Missing Core Website & Sales Funnel" : !adStatus.isRunningAds ? "Inadequate Paid Traffic Scaling" : "Low Conversion Rate Optimization";
      const category = keyword.replace(/in dhaka/i, "").replace(/dhaka/i, "").trim().toUpperCase();

      const automatedEmail = `Subject: Growth Audit for ${item.name} - Identified Digital Gaps\n\nDear ${item.name} Team,\n\nWe conducted an audit on your digital footprint in ${dhakaZone.area} for ${category}.\n\nKey Gaps Identified:\n${missingsList.map(m => `- ${m}`).join("\n")}\n\nMain Opportunity: Addressing these gaps could scale high-ticket client inquiries by 30-40%.\n\nBest regards,\nBazclick Lead Engine`;

      finalLeads.push({
        "Brand Name": item.name,
        "Website": finalWebsite,
        "Brand Category": category,
        "Address": cleanedAddress,
        "Service Area": `${dhakaZone.area} (${dhakaZone.zone})`,
        "Email": finalEmail,
        "Phone": finalPhone,
        "Facebook": finalFacebook,
        "YouTube": finalYouTube,
        "Instagram": finalInstagram,
        "Instagram Followers": "N/A",
        "FB Follower": fbFollowers,
        "YouTube Subscriber": "N/A",
        "Social Activity": finalFacebook !== "N/A" ? "Active Social Presence" : "Low Social Presence",
        "SM Last Post": "Within 30 Days",
        "SM Video Content Quality": webAudit.hasVideo ? "High Quality Video Detected" : "Needs Video Production",
        "SM Image Content Quality": "Standard Design",
        "SM Posting Frequency": "Weekly",
        "FB Ads": adStatus.status,
        "Website Present": webAudit.websitePresent,
        "Website Functions": webAudit.websiteFunctions,
        "Website Speed": webAudit.websiteSpeed,
        "Website Content": webAudit.websiteContent,
        "Website On-page SEO": webAudit.websiteOnpageSEO,
        "Website Design": webAudit.websiteDesign,
        "Website Condition": webAudit.websiteCondition,
        "Website Traffic": webAudit.websiteTraffic,
        "Website's Missings": webAudit.websiteMissings,
        "Google Ads": webAudit.hasGoogleAdsTag ? "Active Tagging Detected" : "No Active Google Ads Detected",
        "Google My Business": "Claimed Profile",
        "GMB Post Frequency": "Occasional",
        "GMB Review": item.reviews !== "N/A" ? `${item.reviews} Reviews (${item.rating} Stars)` : "No Reviews",
        "GMB Quality": parseFloat(item.rating) >= 4.5 ? "Top Tier Profile" : "Average Profile",
        "Top 5 Missings for Brand": top5Missings,
        "Main Brand Problem": mainProblem,
        "Overall Missing Notes": `${item.name} is currently missing key features (${top5Missings}). Fixing these could substantially increase inbound sales in ${dhakaZone.area}.`,
        "Automated Business Gap Mail": automatedEmail,
        "Send Email to Brand Author": finalEmail !== "N/A" ? `Ready to Send (${finalEmail})` : "Manual Email Required",
        _isRunningFacebookAds: adStatus.isRunningAds,
      });
    }

    await auditPage.close();
    return finalLeads;
  } catch (err) {
    console.error("Puppeteer Execution Error:", err);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}