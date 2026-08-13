import puppeteer, { Browser, Page } from "puppeteer";

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browserInstance) {
    return browserInstance;
  }

  browserInstance = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 900,
    },
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  return browserInstance;
}

export async function createPage(): Promise<Page> {
  const browser = await getBrowser();

  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
  );

  return page;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}