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
  targetCount = 100
): Promise<RawListing[]> {
  const isUrl = keywordOrUrl.startsWith("http");
  const targetUrl = isUrl
    ? keywordOrUrl
    : `https://www.google.com/maps/search/${encodeURIComponent(keywordOrUrl)}`;

  try {
    // Set realistic viewport & user-agent
    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9",
    });

    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for either feed container or search result links
    try {
      await page.waitForSelector('a[href*="/maps/place/"]', { timeout: 15000 });
    } catch {
      // If direct place links didn't load immediately, check if consent modal exists and pass
      try {
        const consentBtn = await page.$('form[action*="consent"] button');
        if (consentBtn) await consentBtn.click();
      } catch {}
    }

    const linksSet = new Set<string>();
    let previousSize = 0;
    let sameCountTicks = 0;

    while (linksSet.size < targetCount && sameCountTicks < 6) {
      const urls: string[] = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href*="/maps/place/"]'))
          .map((a) => (a as HTMLAnchorElement).href)
          .filter((h) => !h.includes("/search/"));
      });

      urls.forEach((u) => linksSet.add(u));

      if (linksSet.size === previousSize) {
        sameCountTicks++;
      } else {
        sameCountTicks = 0;
        previousSize = linksSet.size;
      }

      // Scroll inside feed or window
      await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        if (feed) {
          feed.scrollTop += 3000;
        } else {
          window.scrollBy(0, 1000);
        }
      });

      await new Promise((r) => setTimeout(r, 1500));
    }

    const listings: RawListing[] = [];
    const links = Array.from(linksSet).slice(0, targetCount);

    for (const url of links) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 12000 });

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
          };
        }, url);

        if (item.name) listings.push({ ...item, source: "Google Maps" });
      } catch {
        continue;
      }
    }

    return listings;
  } catch (error) {
    console.error("Google Maps scraping error:", error);
    return [];
  }
}

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