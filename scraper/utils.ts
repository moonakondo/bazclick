export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cleanUrl(url: string | null | undefined): string {
  if (!url || url === "N/A") {
    return "N/A";
  }

  try {
    return url.split("?")[0].replace(/\/$/, "");
  } catch {
    return url;
  }
}

export function normalizeWebsiteUrl(url: string): string {
  if (!url || url === "N/A") {
    return "N/A";
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }

  return url;
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    );
  } catch {
    return false;
  }
}

export function createGoogleMapsSearchUrl(input: string): string {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    input
  )}`;
}

export function cleanAddress(address: string): string {
  return address
    .replace(/[\uE000-\uF8FF]/g, "")
    .replace(/মার্কিন যুক্তরাষ্ট্র/g, "United States")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractPhone(text: string): string {
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/);

  return phoneMatch ? phoneMatch[0].trim() : "N/A";
}