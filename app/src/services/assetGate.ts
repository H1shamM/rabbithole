/**
 * @fileoverview Quality gate deciding whether an asset is fit to serve as a
 * reader-first stumble. Homepages / feeds / embed-hostile pages that the reader
 * can't extract are rejected before they ever enter rotation (product eval
 * session 1: ~80% disaster rate, dominated by un-renderable pages).
 */

import { fetchHtml } from "../utils/fetchHtml.js";
import { extractReadable } from "./readerService.js";
import type { StumbleAsset } from "../models/asset.js";

/**
 * Video stumbles render in the live embedded player (e.g. a YouTube `/embed/`
 * URL), so they bypass the reader gate — they're never expected to be article-like.
 */
export function isVideoAsset(
  asset: Pick<StumbleAsset, "url" | "proxyUrl">,
): boolean {
  const candidate = asset.proxyUrl ?? asset.url;
  return candidate.includes("/embed/");
}

/**
 * An asset is servable when it's a video (live player) or its page yields
 * extractable article content. Any network/parse failure → not servable, so a
 * dead or embed-hostile page never gets served as a blank reader card.
 */
export async function isServableAsset(asset: StumbleAsset): Promise<boolean> {
  if (isVideoAsset(asset)) return true;
  try {
    const { html } = await fetchHtml(asset.url);
    return extractReadable(html, asset.url) !== null;
  } catch {
    return false;
  }
}
