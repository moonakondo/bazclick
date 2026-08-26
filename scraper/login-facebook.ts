/**
 * RUN THIS ONCE (and again any time Facebook logs you out / flags the session):
 *
 *   npx ts-node scraper/login-facebook.ts
 *
 * It opens a REAL visible Chrome window using the same profile folder the
 * scraper uses. Log into Facebook by hand in that window (solve any
 * checkpoint/2FA it asks for), then come back to this terminal and press
 * ENTER. The session cookies get saved to .puppeteer-fb-session/ and every
 * future scraper run (even headless) will reuse that logged-in session.
 *
 * Do NOT delete the .puppeteer-fb-session folder, and don't commit it to
 * git — it contains your live login cookies. Add it to .gitignore.
 */
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import readline from "readline";
import fs from "fs";

puppeteer.use(StealthPlugin());

const FB_SESSION_DIR = path.join(process.cwd(), ".puppeteer-fb-session");

async function waitForEnter(message: string) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<void>((resolve) => {
    rl.question(message, () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  const systemPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
  ];
  const executablePath = systemPaths.find((p) => p && fs.existsSync(p));

  const browser = await puppeteer.launch({
    headless: false, // MUST be visible so you can log in by hand
    userDataDir: FB_SESSION_DIR,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });

  const page = await browser.newPage();
  await page.goto("https://www.facebook.com/login", { waitUntil: "domcontentloaded" });

  console.log("\n👉 Log into Facebook in the browser window that just opened.");
  console.log("   Solve any checkpoint / 2FA prompts it gives you.");
  console.log("   Once you see your Facebook feed/home page, come back here.\n");

  await waitForEnter("Press ENTER once you're logged in and see your Facebook feed... ");

  // Quick sanity check
  await page.goto("https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BD", {
    waitUntil: "networkidle2",
  });
  await new Promise((r) => setTimeout(r, 3000)); // let the SPA actually finish rendering

  const bodyText = await page.evaluate(() => document.body.innerText);
  const lower = bodyText.toLowerCase();
  const looksLoggedOut =
    (lower.includes("log in to see") || (lower.includes("log in") && lower.includes("password") && bodyText.length < 1500)) &&
    !lower.includes("ad library");

  console.log(`(diagnostic: page text length was ${bodyText.length} chars)`);

  if (looksLoggedOut) {
    console.log("⚠️  Ad Library page still looks blocked/logged-out. Try logging in again and re-run this script.");
  } else {
    console.log("✅ Session looks good. Ad Library loaded real content.");
  }

  await browser.close();
  console.log("Session saved to:", FB_SESSION_DIR);
  console.log("You can now run `npm run dev` and use the scraper normally.");
}

main();