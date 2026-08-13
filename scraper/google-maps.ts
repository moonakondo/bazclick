import { Page } from "puppeteer";

export async function findGoogleBusinessUrls(
  page: Page,
  searchUrl: string,
  targetCount = 50
): Promise<string[]> {
  await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });

  const linksSet = new Set<string>();

  try {
    // Wait for feed container
    await page.waitForSelector('div[role="feed"]', { timeout: 10000 });

    let previousHeight = 0;
    let attempts = 0;

    // Scroll loop to load up to targetCount listings
    while (linksSet.size < targetCount && attempts < 15) {
      const urls: string[] = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'));
        return anchors.map((a) => (a as HTMLAnchorElement).href);
      });

      urls.forEach((url) => linksSet.add(url));

      if (linksSet.size >= targetCount) break;

      // Scroll down feed container
      const currentHeight = await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        if (feed) {
          feed.scrollTop = feed.scrollHeight;
          return feed.scrollHeight;
        }
        return 0;
      });

      if (currentHeight === previousHeight) {
        attempts++;
      } else {
        attempts = 0;
      }

      previousHeight = currentHeight;
      await new Promise((r) => setTimeout(r, 1500));
    }
  } catch (err) {
    console.warn("Feed selector not found or scroll failed:", err);
  }

  return Array.from(linksSet).slice(0, targetCount);
}

export async function scrapeGoogleBusiness(
  page: Page,
  url: string,
  keyword: string
): Promise<any> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

  return await page.evaluate((placeUrl, kw) => {
    const getText = (selector: string) =>
      document.querySelector(selector)?.textContent?.trim() || "N/A";

    const name = getText("h1");
    const address = getText('button[data-item-id="address"]');
    const phone = getText('button[data-item-id*="phone"]');

    const websiteEl = document.querySelector('a[data-item-id="authority"]') as HTMLAnchorElement;
    const website = websiteEl ? websiteEl.href : "N/A";

    return {
      name,
      address,
      phone,
      website,
      google_maps_url: placeUrl,
      keyword: kw,
    };
  }, url, keyword);
}