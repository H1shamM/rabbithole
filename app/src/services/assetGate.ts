/**
 * @fileoverview Content gate: classify an asset's format and decide whether it's
 * fit to serve. Replaces the old article-only boolean gate — that gate filtered
 * everything down to readable prose, which made the stumble stream a monotonous
 * reading list (product eval session 2: user churned on "it's all articles").
 * Now videos, image galleries, and interactive sites pass too, each routed to
 * the right renderer downstream.
 */

import { fetchHtml } from "../utils/fetchHtml.js";
import { extractReadable } from "./readerService.js";
import type { ContentType, StumbleAsset } from "../models/asset.js";

/** Result of classifying an asset for the stumble pool. */
export interface AssetClassification {
  type: ContentType;
  /** Whether this asset is good enough to enter rotation. */
  servable: boolean;
}

/**
 * Known sources whose content is inherently visual or interactive and is NOT
 * meant to be read as prose. We trust the source rather than running article
 * extraction (which would either fail or strip the content's whole value).
 */
const SOURCE_TYPE_HINTS: Record<string, ContentType> = {
  BoredPanda: "image",
  Colossal: "image",
  AtlasObscura: "image",
  xkcd: "image",
  UselessWeb: "interactive",
  DesignGallery: "interactive",
  Wiby: "interactive",
};

/**
 * Video stumbles render in the live embedded player (e.g. a YouTube `/embed/`
 * URL), so they bypass article extraction entirely.
 */
export function isVideoAsset(
  asset: Pick<StumbleAsset, "url" | "proxyUrl">,
): boolean {
  const candidate = asset.proxyUrl ?? asset.url;
  return candidate.includes("/embed/");
}

/**
 * Classify an asset's content type and decide whether it's servable:
 * - video → always servable (live player).
 * - known image/interactive source → servable as that type, no extraction.
 * - otherwise → must yield extractable article content to be servable; a
 *   network/parse failure or a non-article page is rejected (keeps the floor).
 */
export async function classifyAsset(
  asset: StumbleAsset,
): Promise<AssetClassification> {
  if (isVideoAsset(asset)) return { type: "video", servable: true };

  const hint = SOURCE_TYPE_HINTS[asset.source];
  if (hint) return { type: hint, servable: true };

  try {
    const { html } = await fetchHtml(asset.url);
    const servable = extractReadable(html, asset.url) !== null;
    return { type: "article", servable };
  } catch {
    return { type: "article", servable: false };
  }
}
