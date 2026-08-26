// scraper/yellowpages.ts
//
// Coverage reality (fact-checked): yellowpages.com is a USA-only directory.
// "Yellow Pages" as a brand is licensed separately per country — Canada has
// its own site (yellowpages.ca), the UK's equivalent is Yell.com (not
// "Yellow Pages" at all). This scraper hits yellowpages.com specifically,
// so results outside the USA will be empty or irrelevant — that's expected.

import { getBrowser } from './browser';
import { sleep } from './utils';

/**
 * Raw listing structure used by the Yellow Pages scraper.
 *
 * This is intentionally defined locally instead of importing RawListing
 * from google-maps.ts because google-maps.ts does not export RawListing.
 *
 * The fields match the objects returned by this scraper and the existing
 * scraper pipeline.
 */
interface YellowPagesListing {
  business_name: string;
  address: string;
  phone: string;
  website: string;
  rating: string;
  google_maps_url: string;
  source: string;
}

export async function scrapeYellowPages(
  keyword: string,
  location: string,
  target: number = 100,
  onProgress?: (done: number, total: number) => void
): Promise<YellowPagesListing[]> {
  const browser = await getBrowser();

  // Do not explicitly import Page from puppeteer-extra.
  // Puppeteer can infer the correct Page type from browser.newPage().
  const page = await browser.newPage();

  await page.setViewport({
    width: 1366,
    height: 900,
  });

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
  );

  const results: YellowPagesListing[] = [];
  let pageNum = 1;

  while (results.length < target) {
    const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(
      keyword
    )}&geo_location_terms=${encodeURIComponent(location)}&page=${pageNum}`;

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      await sleep(2000);
    } catch {
      break;
    }

    const cards = await page.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll('.result, .organic')
      );

      return items.map((item) => {
        const getText = (sel: string): string | null => {
          const el = item.querySelector(sel);

          return el
            ? (el.textContent || '').trim()
            : null;
        };

        const name = getText('.business-name');

        const phone = getText('.phones, .phone');

        const streetAddress = getText('.street-address');
        const locality = getText('.locality');

        const address = streetAddress
          ? `${streetAddress}, ${locality || ''}`.trim()
          : null;

        const websiteEl = item.querySelector(
          'a.track-visit-website'
        ) as HTMLAnchorElement | null;

        const website = websiteEl ? websiteEl.href : null;

        return {
          name,
          phone,
          address,
          website,
        };
      });
    });

    if (cards.length === 0) {
      break;
    }

    for (const card of cards) {
      if (results.length >= target) {
        break;
      }

      if (!card.name) {
        continue;
      }

      results.push({
        business_name: card.name,
        address: card.address || 'N/A',
        phone: card.phone || 'N/A',
        website: card.website || 'N/A',
        rating: 'N/A',
        google_maps_url: 'N/A',
        source: 'Yellow Pages',
      });

      if (onProgress) {
        onProgress(results.length, target);
      }
    }

    pageNum += 1;

    // Keep the existing sane upper bound.
    if (pageNum > 20) {
      break;
    }
  }

  await page.close();

  return results;
}