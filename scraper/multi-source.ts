export interface RawListing {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  google_maps_url?: string;
  source: string;
}

// Splits a combined search string like "Real Estate in Washington DC" into
// a "what" (Real Estate) and a "where" (Washington DC). Yelp and Yellow
// Pages both require these as SEPARATE URL parameters — unlike Google
// Maps, which accepts one combined free-text string just fine.
//
// If no "in"/"near" is found (e.g. "Real Estate California" with no
// connector word), we fall back to treating the whole string as "what"
// with no location — Yelp/Yellow Pages will likely return few or no
// results in that case. For reliable Yelp/Yellow Pages results, encourage
// users to search in the form "<keyword> in <location>".
function parseWhatWhere(query: string): { what: string; where: string } {
  const match = query.match(/^(.*?)\s+(?:in|near)\s+(.+)$/i);
  if (match) {
    return { what: match[1].trim(), where: match[2].trim() };
  }
  return { what: query.trim(), where: "" };
}

// Scrapes Google Maps from a keyword, shortened link, or full search/place URL
// --- UNCHANGED from your existing version ---
export async function scrapeGoogleMapsDetailed(
  page: any,
  keywordOrUrl: string,
  targetCount = 100
): Promise<RawListing[]> {
  const isUrl = keywordOrUrl.startsWith("http");
  let targetUrl = keywordOrUrl;

  if (!isUrl) {
    targetUrl = `https://www.google.com/maps/search/${encodeURIComponent(keywordOrUrl)}`;
  }

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    try {
      const consentBtn = await page.$('form[action*="consent"] button');
      if (consentBtn) await consentBtn.click();
    } catch {}

    await new Promise((r) => setTimeout(r, 2000));
    const currentUrl = page.url();

    if (currentUrl.includes("/maps/place/")) {
      await page.waitForSelector("h1", { timeout: 10000 });

      const item = await page.evaluate((placeUrl: string) => {
        const name = document.querySelector("h1")?.textContent?.trim() || "";
        const address =
          document.querySelector('button[data-item-id="address"]')?.textContent?.trim() || "N/A";

        let phone = "N/A";
        const phoneBtn = document.querySelector('button[data-item-id*="phone"]');
        if (phoneBtn) phone = phoneBtn.textContent?.trim() || "N/A";

        const websiteEl = document.querySelector('a[data-item-id="authority"]') as HTMLAnchorElement;

        return {
          name,
          address,
          phone,
          website: websiteEl ? websiteEl.href : "N/A",
          google_maps_url: placeUrl,
          source: "Google Maps",
        };
      }, currentUrl);

      return item.name ? [item] : [];
    }

    try {
      await page.waitForSelector('div[role="feed"], a[href*="/maps/place/"]', { timeout: 12000 });
    } catch {
      return [];
    }

    let previousCount = 0;
    let sameCountTicks = 0;

    while (sameCountTicks < 5) {
      const currentCount = await page.evaluate(() => {
        return document.querySelectorAll('a[href*="/maps/place/"]').length;
      });

      if (currentCount >= targetCount) break;

      if (currentCount === previousCount) {
        sameCountTicks++;
      } else {
        sameCountTicks = 0;
        previousCount = currentCount;
      }

      await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        if (feed) {
          feed.scrollTop += 5000;
        } else {
          window.scrollBy(0, 1500);
        }
      });

      await new Promise((r) => setTimeout(r, 1500));
    }

    const extractedListings: RawListing[] = await page.evaluate(() => {
      function extractAddressFromCard(card: Element): string {
        const infoEl =
          card.querySelector(".W4Efsd, .UaQhfb, .fontBodyMedium") || card;
        const rawText = infoEl.textContent || "";

        const parts = rawText
          .split("·")
          .map((p) => p.trim())
          .filter(Boolean);

        const ignorePattern =
          /^(open|closed|closes|opens)\b|am\)?$|pm\)?$|^\$+$|^\d(\.\d)?\s?(star|stars)?$|^\d+\s?(review|reviews)/i;

        const candidate = parts.find(
          (p) => !ignorePattern.test(p) && /\d/.test(p) && p.length > 4
        );

        return candidate || "N/A";
      }

      const items: RawListing[] = [];
      const seenNames = new Set<string>();
      const placeLinks = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'));

      placeLinks.forEach((link) => {
        const href = (link as HTMLAnchorElement).href;
        if (!href || href.includes("/search/")) return;

        const card = link.closest('div[role="article"]') || link.parentElement?.parentElement;
        if (!card) return;

        const nameEl = card.querySelector("div.fontHeadlineSmall, .qBF1Pd, h1");
        const name = nameEl?.textContent?.trim() || "";

        if (!name || seenNames.has(name.toLowerCase())) return;
        seenNames.add(name.toLowerCase());

        let phone = "N/A";
        const phoneBtn = card.querySelector(
          'button[data-item-id*="phone"], button[aria-label*="Phone"], button[data-tooltip*="phone"]'
        );

        if (phoneBtn) {
          phone = phoneBtn.textContent?.trim() || "N/A";
        } else {
          const allText = (card as HTMLElement).innerText || "";
          const match = allText.match(/(\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}/);
          if (match) phone = match[0].trim();
        }

        const websiteEl = card.querySelector(
          'a[data-value="Website"], a[href*="http"]:not([href*="google"])'
        ) as HTMLAnchorElement;

        const address = extractAddressFromCard(card);

        items.push({
          name,
          phone: phone !== "N/A" ? phone : "N/A",
          address,
          website: websiteEl ? websiteEl.href : "N/A",
          google_maps_url: href,
          source: "Google Maps",
        });
      });

      return items;
    });

    return extractedListings;
  } catch (error) {
    console.error("Google Maps extraction error:", error);
    return [];
  }
}

export async function scrapeYelpPublic(
  page: any,
  keyword: string,
  maxPages = 3
): Promise<RawListing[]> {
  const listings: RawListing[] = [];
  const { what, where } = parseWhatWhere(keyword);

  for (let pageNum = 0; pageNum < maxPages; pageNum++) {
    const startParam = pageNum * 10;
    const searchUrl =
      `https://www.yelp.com/search?find_desc=${encodeURIComponent(what)}` +
      (where ? `&find_loc=${encodeURIComponent(where)}` : "") +
      `&start=${startParam}`;

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      );
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15000 });

      // Phase 1: collect just the name + link to each business's own Yelp page
      // from the search results (this part is unchanged in spirit from before).
      const cards: { name: string; bizUrl: string }[] = await page.evaluate(() => {
        const seen = new Set<string>();
        const out: { name: string; bizUrl: string }[] = [];
        document.querySelectorAll('a[href*="/biz/"]').forEach((el) => {
          const name = el.textContent?.trim();
          const href = (el as HTMLAnchorElement).href.split("?")[0];
          if (name && href && name.length > 3 && !name.includes("Yelp") && !seen.has(href)) {
            seen.add(href);
            out.push({ name, bizUrl: href });
          }
        });
        return out;
      });

      if (!cards.length) break;

      // Phase 2: visit each business's OWN Yelp page — this is where Yelp
      // actually exposes the real outbound website link (wrapped in a
      // /biz_redir?url=... redirect) and a proper address, neither of
      // which are present on the search results card itself.
      for (const card of cards) {
        try {
          await page.goto(card.bizUrl, { waitUntil: "domcontentloaded", timeout: 15000 });

          const detail = await page.evaluate(() => {
            let realWebsite: string | null = null;
            const redirLink = document.querySelector(
              'a[href*="/biz_redir?"]'
            ) as HTMLAnchorElement | null;
            if (redirLink) {
              try {
                const u = new URL(redirLink.href);
                const target = u.searchParams.get("url");
                realWebsite = target ? decodeURIComponent(target) : null;
              } catch {
                realWebsite = null;
              }
            }

            const addressEl = document.querySelector("address");
            const address = addressEl
              ? (addressEl.textContent || "").replace(/\s+/g, " ").trim()
              : null;

            const phoneMatch = (document.body.innerText || "").match(
              /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
            );

            return {
              website: realWebsite,
              address,
              phone: phoneMatch ? phoneMatch[0] : null,
            };
          });

          listings.push({
            name: card.name,
            website: detail.website || "N/A",
            address: detail.address || "N/A",
            phone: detail.phone || "N/A",
            source: "Yelp",
          });
        } catch {
          // one bad detail page shouldn't drop the lead entirely — keep the name
          listings.push({
            name: card.name,
            website: "N/A",
            address: "N/A",
            phone: "N/A",
            source: "Yelp",
          });
        }
      }
    } catch {
      break;
    }
  }

  return listings;
}

export async function scrapeYellowPagesPublic(
  page: any,
  keyword: string,
  maxPages = 3
): Promise<RawListing[]> {
  const listings: RawListing[] = [];
  const { what, where } = parseWhatWhere(keyword);

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const searchUrl =
      `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(what)}` +
      (where ? `&geo_location_terms=${encodeURIComponent(where)}` : "") +
      `&page=${pageNum}`;

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      );
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15000 });

      const items = await page.evaluate(() => {
        const results: any[] = [];
        document.querySelectorAll(".result .info").forEach((el) => {
          const name = el.querySelector(".business-name")?.textContent?.trim() || "";
          const phone = el.querySelector(".phones")?.textContent?.trim() || "N/A";
          const website =
            (el.querySelector("a.track-visit-website") as HTMLAnchorElement)?.href || "N/A";

          // Pull each address piece separately and join with explicit
          // spacing — grabbing the parent block's textContent in one shot
          // glues adjacent spans together with no separator at all
          // (e.g. "...Ave" + "Ripon..." becomes "AveRipon").
          const street = el.querySelector(".street-address")?.textContent?.trim() || "";
          const locality = el.querySelector(".locality")?.textContent?.trim() || "";
          const region = el.querySelector(".region")?.textContent?.trim() || "";
          const postal = el.querySelector(".postal-code")?.textContent?.trim() || "";

          let address = [street, [locality, region].filter(Boolean).join(", "), postal]
            .filter(Boolean)
            .join(" ")
            .trim();

          if (!address) {
            // fallback: whole adr block, still space-normalized, better than nothing
            const adrEl = el.querySelector(".adr, .street-address");
            address = adrEl ? (adrEl.textContent || "").replace(/\s+/g, " ").trim() : "";
          }
          if (!address) address = "N/A";

          if (name) {
            results.push({ name, phone, website, address, source: "Yellow Pages" });
          }
        });
        return results;
      });

      if (!items.length) break;

      // Resolve any website that's still a yellowpages.com tracking link
      // (rather than the business's real external domain) by following it
      // and reading where it actually lands.
      for (const item of items) {
        if (item.website && item.website !== "N/A" && item.website.includes("yellowpages.com")) {
          try {
            await page.goto(item.website, { waitUntil: "domcontentloaded", timeout: 12000 });
            const finalUrl = page.url();
            if (finalUrl && !finalUrl.includes("yellowpages.com")) {
              item.website = finalUrl;
            }
          } catch {
            // leave as-is if the redirect can't be followed
          }
        }
      }

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