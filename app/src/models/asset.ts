import { z } from "zod";

/**
 * The format of a stumble's content, used by the gate to decide what's servable
 * and by the UI to pick the right renderer (reader for prose, live/visual for
 * the rest).
 */
export const ContentTypeSchema = z.enum([
  "article",
  "image",
  "video",
  "interactive",
]);
export type ContentType = z.infer<typeof ContentTypeSchema>;

/**
 * Content-safety verdict (#332). Only `pass` assets are ever served. `pending`
 * = not yet classified (never served — fail-closed); `flag` = blocked.
 */
export const SafetyStatusSchema = z.enum(["pending", "pass", "flag"]);
export type SafetyStatus = z.infer<typeof SafetyStatusSchema>;

/**
 * Curated channels organize the library by format & vibe (the Cloudhiker model).
 * Kept as a free string (not an enum) so the library can grow new channels
 * without a schema change.
 */
export const CHANNELS = [
  "Fun & Interactive",
  "Games",
  "Funny",
  "Videos",
  "Gadgets & Tools",
  "Indie & Classic Web",
  "Art",
  "Deep Dives",
] as const;

export const StumbleAssetSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  title: z.string().min(1),
  description: z.string().optional(),
  source: z.string().min(1),
  category: z.string().min(1),
  rating: z.number().default(0),
  type: ContentTypeSchema.optional(),
  channel: z.string().optional(),
  proxyUrl: z.string().url().optional(),
  safetyStatus: SafetyStatusSchema.optional(),
  created_at: z.date(),
  last_visited_at: z.date().optional(),
});

export type StumbleAsset = z.infer<typeof StumbleAssetSchema>;
