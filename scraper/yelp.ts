// scraper/yelp.ts
//
// Coverage reality (fact-checked): Yelp pulled back from most international
// markets in 2016 — usable listing density is really only strong in the
// USA and Canada, with thin/patchy coverage in UK, Ireland, and a few other
// countries. Searching a location outside USA/Canada will often return 0
// or near-0 results — that's expected, not a scraper bug.

import { getBrowser } from "./browser";
import { sleep } from "./utils";

/**
 * Yelp listing shape.
 *
 * This matches the data structure already returned by this scraper.
 * We define it locally because RawListing is not exported from
 * ./google-maps.ts.
 */
interface YelpListing {
  business_name: string;
  address: string;
  phone: string;
  website: string;
  rating: string;
  google_maps_url: string;
  source: string;
}

export async function scrapeYelp(
  keyword: string,
  location: string,
  target: number = 100,
  onProgress?: (done: number, total: number) => void
): Promise<YelpListing[]> {
  const browser = await getBrowser();

  // Let TypeScript infer the correct Page type from the browser instance.
  // puppeteer-extra does not export Page directly.
  const page = await browser.newPage();

  await page.setViewport({
    width: 1366,
    height: 900,
  });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
  );

  const results: YelpListing[] = [];

  let start = 0;

  const PAGE_SIZE = 10; // Yelp paginates ~10 results per page via the "start" query param

  while (results.length < target) {
    const url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(
      keyword
    )}&find_loc=${encodeURIComponent(location)}&start=${start}`;

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await sleep(2500);
    } catch {
      break;
    }

    const cardLinks: string[] = await page.evaluate(() => {
      const anchors = Array.from(
        document.querySelectorAll('a[href^="/biz/"]')
      ) as HTMLAnchorElement[];

      const seen = new Set<string>();
      const out: string[] = [];

      for (const a of anchors) {
        const href = a.href.split("?")[0];

        if (seen.has(href) || href.includes("/biz/redirect")) {
          continue;
        }

        seen.add(href);
        out.push(href);
      }

      return out;
    });

    if (cardLinks.length === 0) {
      break; // no more results / blocked / unsupported location
    }

    for (const link of cardLinks) {
      if (results.length >= target) {
        break;
      }

      try {
        await page.goto(link, {
          waitUntil: "domcontentloaded",
          timeout: 25000,
        });

        await sleep(1500);

        const data = await page.evaluate(() => {
          const getText = (sel: string): string | null => {
            const el = document.querySelector(sel);

            return el
              ? (el.textContent || "").trim()
              : null;
          };

          const name = getText("h1");

          // Yelp's business website link is usually under a
          // "Business website" label.
          let website: string | null = null;

          document
            .querySelectorAll('a[href*="/biz_redir?"]')
            .forEach((el) => {
              if (!website) {
                website = (el as HTMLAnchorElement).href;
              }
            });

          let phone: string | null = null;

          document.querySelectorAll("p, span").forEach((el) => {
            const t = (el.textContent || "").trim();

            if (
              !phone &&
              /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(t)
            ) {
              phone = t;
            }
          });

          const addressBlock = document.querySelector("address");

          const address = addressBlock
            ? (addressBlock.textContent || "").trim()
            : null;

          const ratingEl = document.querySelector(
            'div[aria-label*="star rating"]'
          );

          const rating = ratingEl
            ? ratingEl.getAttribute("aria-label")
            : null;

          return {
            name,
            website,
            phone,
            address,
            rating,
          };
        });

        // Yelp wraps the real website in a redirect URL
        // (biz_redir?url=<encoded>) — unwrap it.
        let realWebsite = "N/A";

        if (data.website) {
          try {
            const u = new URL(data.website);
            const targetUrl = u.searchParams.get("url");

            realWebsite = targetUrl
              ? decodeURIComponent(targetUrl)
              : "N/A";
          } catch {
            realWebsite = "N/A";
          }
        }

        results.push({
          business_name: data.name || "N/A",
          address: data.address || "N/A",
          phone: data.phone || "N/A",
          website: realWebsite,
          rating: data.rating || "N/A",
          google_maps_url: "N/A",
          source: "Yelp",
        });

        if (onProgress) {
          onProgress(results.length, target);
        }
      } catch {
        continue;
      }
    }

    start += PAGE_SIZE;

    if (start > 240) {
      break; // Yelp caps pagination around here regardless of target
    }
  }

  await page.close();

  return results;
}