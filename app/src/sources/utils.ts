/**
 * @fileoverview Utility for fetching content with a timeout.
 */

/**
 * Fetches content with a timeout.
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} options - The fetch options.
 * @param {number} timeout - The timeout in milliseconds.
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}
