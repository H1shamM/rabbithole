/**
 * @fileoverview Helper utilities for bootstrapping and initial data seeding.
 */

import type { IStoragePort } from "./db/storagePort.js";
import type { StumbleAsset } from "./models/asset.js";
import type { User } from "./models/user.js";
import bcrypt from "bcrypt";
import { settings } from "./config/settings.js";

export type SeedAsset = Omit<StumbleAsset, "created_at" | "last_visited_at">;

// Seeds are deliberately *deep links to specific, reader-friendly articles*, not
// site homepages. Homepage seeds (HN/Reddit/Colossal roots) can't be extracted by
// reader-first mode and render as blank cards — the #1 quality-floor failure found
// in product eval session 1. Wikipedia/essay permalinks render reliably in reader.
export const DEFAULT_SEED_ASSETS: SeedAsset[] = [
  {
    id: "t1",
    url: "https://en.wikipedia.org/wiki/Unix_philosophy",
    title: "The Unix Philosophy",
    description: "Do one thing well — the design ethos behind Unix.",
    source: "Wikipedia",
    category: "tech",
    rating: 0,
  },
  {
    id: "t2",
    url: "https://blog.codinghorror.com/the-best-code-is-no-code-at-all/",
    title: "The Best Code is No Code At All",
    description: "A classic essay on why less code is better code.",
    source: "Coding Horror",
    category: "tech",
    rating: 0,
  },
  {
    id: "s1",
    url: "https://en.wikipedia.org/wiki/Tardigrade",
    title: "Tardigrade",
    description: "The near-indestructible micro-animal that survives space.",
    source: "Wikipedia",
    category: "science",
    rating: 0,
  },
  {
    id: "s2",
    url: "https://en.wikipedia.org/wiki/Cosmic_microwave_background",
    title: "Cosmic Microwave Background",
    description: "The faint afterglow of the Big Bang, explained.",
    source: "Wikipedia",
    category: "science",
    rating: 0,
  },
  {
    id: "a1",
    url: "https://en.wikipedia.org/wiki/The_Starry_Night",
    title: "The Starry Night",
    description: "Van Gogh's most famous painting and its story.",
    source: "Wikipedia",
    category: "art",
    rating: 0,
  },
  {
    id: "a2",
    url: "https://en.wikipedia.org/wiki/Bauhaus",
    title: "Bauhaus",
    description: "The art school that shaped modern design.",
    source: "Wikipedia",
    category: "art",
    rating: 0,
  },
  {
    id: "r1",
    url: "https://en.wikipedia.org/wiki/Dancing_plague_of_1518",
    title: "The Dancing Plague of 1518",
    description: "When dozens danced themselves to death in Strasbourg.",
    source: "Wikipedia",
    category: "random",
    rating: 0,
  },
  {
    id: "r2",
    url: "https://en.wikipedia.org/wiki/Voynich_manuscript",
    title: "The Voynich Manuscript",
    description: "A 600-year-old book no one has ever been able to read.",
    source: "Wikipedia",
    category: "random",
    rating: 0,
  },
];

export async function ensureDevUser(storage: IStoragePort): Promise<void> {
  const devUserId = settings.devUserId;
  const existingUser = await storage.getUserById(devUserId);
  if (!existingUser) {
    const devUser: User = {
      id: devUserId,
      email: "dev@stumble.local",
      password_hash: await bcrypt.hash("devpass", 10),
      display_name: "Dev User",
      provider: "local",
      created_at: new Date(),
    };
    await storage.saveUser(devUser);
    // User created successfully
  }
}

export async function seedDefaultAssets(storage: IStoragePort): Promise<void> {
  for (const asset of DEFAULT_SEED_ASSETS) {
    await storage.saveAsset({
      ...asset,
      created_at: new Date(),
    });
  }
  await ensureDevUser(storage);
}
