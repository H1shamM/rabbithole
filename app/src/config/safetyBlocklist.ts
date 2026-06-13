/**
 * @fileoverview Known-unsafe signals for the zero-cost heuristic safety
 * pre-filter (#334). Deliberately *high-precision*: only flag what's
 * unambiguously bad here — anything uncertain is left for the LLM classifier
 * (#335). A false flag hides good content, which is worse than a miss (the LLM
 * is the safety net). Extend these lists over time.
 */

/** Apex domains (and any subdomain) that are unambiguously adult. */
export const ADULT_DOMAINS: readonly string[] = [
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "xhamster.com",
  "redtube.com",
  "youporn.com",
  "onlyfans.com",
  "chaturbate.com",
  "brazzers.com",
  "spankbang.com",
  "rule34.xxx",
  "e-hentai.org",
];

/** TLDs reserved for / dominated by adult content. */
export const ADULT_TLDS: readonly string[] = [
  ".xxx",
  ".adult",
  ".porn",
  ".sex",
];

/**
 * High-precision, word-boundaried keyword patterns matched against the full
 * URL. Boundaries avoid substring false positives (e.g. "Scunthorpe", or
 * "expornography" never matches `\bporn\b`).
 */
export const ADULT_URL_PATTERNS: readonly RegExp[] = [
  /\bporn\b/i,
  /\bxxx\b/i,
  /\bhentai\b/i,
  /\brule34\b/i,
  /\bsexcam/i,
  /\bcamgirl/i,
];
