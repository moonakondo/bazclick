export interface RawListing {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  google_maps_url?: string;
  source: string;
}

// Infinite scroll for Google Maps (fetches up to target limit)
export async function scrapeGoogleMapsDetailed(
  page: any,
  keywordOrUrl: string,
  targetCount = 20
): Promise<RawListing[]> {
  const isUrl = keywordOrUrl.startsWith("http");
  const targetUrl = isUrl
    ? keywordOrUrl
    : `https://www.google.com/maps/search/${encodeURIComponent(keywordOrUrl)}`;

  try {
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

    // Handle Google consent banner if presented
    try {
      const consentBtn = await page.$('form[action*="consent"] button');
      if (consentBtn) await consentBtn.click();
    } catch {}

    // CASE 1: User passed a single Google Maps Place URL directly
    if (isUrl && (targetUrl.includes("/maps/place/") || targetUrl.includes("goo.gl"))) {
      await page.waitForSelector("h1", { timeout: 10000 });
      
      const item = await page.evaluate((placeUrl: string) => {
        const name = document.querySelector("h1")?.textContent?.trim() || "";
        const address =
          document.querySelector('button[data-item-id="address"]')?.textContent?.trim() || "N/A";
        const phone =
          document.querySelector('button[data-item-id*="phone"]')?.textContent?.trim() || "N/A";
        const websiteEl = document.querySelector('a[data-item-id="authority"]') as HTMLAnchorElement;

        return {
          name,
          address,
          phone,
          website: websiteEl ? websiteEl.href : "N/A",
          google_maps_url: placeUrl,
          source: "Google Maps",
        };
      }, targetUrl);

      return item.name ? [item] : [];
    }

    // CASE 2: Search keyword or search result URL (feed list)
    try {
      await page.waitForSelector('div[role="feed"], a[href*="/maps/place/"]', { timeout: 10000 });
    } catch {
      return [];
    }

    // Scroll to load listings
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        if (feed) feed.scrollTop += 2000;
      });
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Extract all visible items
    const listings: RawListing[] = await page.evaluate(() => {
      const items: RawListing[] = [];
      const placeLinks = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'));

      placeLinks.forEach((link) => {
        const href = (link as HTMLAnchorElement).href;
        if (!href || href.includes("/search/")) return;

        const card = link.closest('div[role="article"]') || link.parentElement?.parentElement;
        if (!card) return;

        const nameEl = card.querySelector("div.fontHeadlineSmall, .qBF1Pd, h1");
        const name = nameEl?.textContent?.trim() || "";
        if (!name) return;

        const websiteEl = card.querySelector('a[data-value="Website"]') as HTMLAnchorElement;
        const phoneEl = card.querySelector('button[data-item-id*="phone"]');

        items.push({
          name,
          phone: phoneEl?.textContent?.trim() || "N/A",
          address: "N/A",
          website: websiteEl ? websiteEl.href : "N/A",
          google_maps_url: href,
          source: "Google Maps",
        });
      });

      return items;
    });

    return listings;
  } catch (error) {
    console.error("Google Maps Scraper Error:", error);
    return [];
  }
}

//Endeddd

// Multi-page pagination loop for Yelp (?start=0, ?start=10, ?start=20...)
export async function scrapeYelpPublic(
  page: any,
  keyword: string,
  maxPages = 3
): Promise<RawListing[]> {
  const listings: RawListing[] = [];

  for (let pageNum = 0; pageNum < maxPages; pageNum++) {
    const startParam = pageNum * 10;
    const searchUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(
      keyword
    )}&start=${startParam}`;

    try {
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

      const items = await page.evaluate(() => {
        const results: any[] = [];
        document.querySelectorAll('a[href*="/biz/"]').forEach((el) => {
          const name = el.textContent?.trim();
          const href = (el as HTMLAnchorElement).href;
          if (name && href && name.length > 3 && !name.includes("Yelp")) {
            results.push({ name, website: href, source: "Yelp" });
          }
        });
        return results;
      });

      if (!items.length) break;
      listings.push(...items);
    } catch {
      break;
    }
  }

  return listings;
}

// Multi-page pagination loop for Yellow Pages (?page=1, ?page=2, ?page=3...)
export async function scrapeYellowPagesPublic(
  page: any,
  keyword: string,
  maxPages = 3
): Promise<RawListing[]> {
  const listings: RawListing[] = [];

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const searchUrl = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(
      keyword
    )}&page=${pageNum}`;

    try {
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

      const items = await page.evaluate(() => {
        const results: any[] = [];
        document.querySelectorAll(".result .info").forEach((el) => {
          const name = el.querySelector(".business-name")?.textContent?.trim() || "";
          const phone = el.querySelector(".phones")?.textContent?.trim() || "N/A";
          const website =
            (el.querySelector("a.track-visit-website") as HTMLAnchorElement)?.href || "N/A";

          if (name) {
            results.push({ name, phone, website, source: "Yellow Pages" });
          }
        });
        return results;
      });

      if (!items.length) break;
      listings.push(...items);
    } catch {
      break;
    }
  }

  return listings;
}

export function deduplicateListings(listings: RawListing[]): RawListing[] {
  const map = new Map<string, RawListing>();

  for (const item of listings) {
    if (!item.name || item.name === "N/A") continue;
    const cleanKey = item.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (!map.has(cleanKey)) {
      map.set(cleanKey, item);
    } else {
      const existing = map.get(cleanKey)!;
      map.set(cleanKey, {
        ...existing,
        phone: existing.phone !== "N/A" ? existing.phone : item.phone,
        website: existing.website !== "N/A" ? existing.website : item.website,
        address: existing.address !== "N/A" ? existing.address : item.address,
      });
    }
  }

  return Array.from(map.values());
}