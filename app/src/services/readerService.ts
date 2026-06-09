/**
 * @fileoverview Reader-mode extraction: turn a page's HTML into clean, sanitized
 * article content suitable for rendering inside the app.
 */

import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import sanitizeHtml from "sanitize-html";

/**
 * The extracted, sanitized article returned to the client.
 */
export interface ReaderResult {
  title: string;
  byline: string | null;
  siteName: string | null;
  excerpt: string | null;
  /** Sanitized HTML — safe to render with dangerouslySetInnerHTML. */
  content: string;
  textContent: string;
  length: number;
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "figure",
    "figcaption",
    "picture",
    "source",
    "h1",
    "h2",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    a: ["href", "name", "target", "rel"],
    source: ["src", "srcset", "type", "media", "sizes"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // Force external links to open safely in a new tab.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
  },
};

const MIN_ARTICLE_CHARS = 400;

const cache = new Map<string, ReaderResult>();
const CACHE_LIMIT = 100;

/**
 * Extract readable article content from raw HTML, with caching.
 */
export function extractReadable(
  html: string,
  url: string,
): ReaderResult | null {
  if (cache.has(url)) return cache.get(url)!;

  try {
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (!article || !article.content) return null;

    const content = sanitizeHtml(article.content, SANITIZE_OPTIONS);
    if (!content.trim()) return null;

    if (article.textContent && article.textContent.length < MIN_ARTICLE_CHARS)
      return null;

    const result: ReaderResult = {
      title: article.title ?? "",
      byline: article.byline ?? null,
      siteName: article.siteName ?? null,
      excerpt: article.excerpt ?? null,
      content,
      textContent: article.textContent ?? "",
      length: article.length ?? 0,
    };

    // Note: Cache is keyed by URL only; same URL with different HTML returns the first extracted result.
    if (cache.size >= CACHE_LIMIT) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(url, result);
    return result;
  } catch {
    return null;
  }
}
