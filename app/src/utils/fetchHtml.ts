import fetch from "node-fetch";

export async function fetchHtml(
  url: string,
  timeoutMs = 10000,
): Promise<{ html: string; headers: Record<string, string> }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Rabbithole/1.0)",
      },
    });
    clearTimeout(timeoutId);

    const html = await response.text();
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return { html, headers };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
