/**
 * @fileoverview Helper utilities for bootstrapping and initial data seeding.
 */

import type { IStoragePort } from "./db/storagePort.js";
import type { StumbleAsset } from "./models/asset.js";
import type { User } from "./models/user.js";
import bcrypt from "bcrypt";
import { settings } from "./config/settings.js";

export type SeedAsset = Omit<StumbleAsset, "created_at" | "last_visited_at">;

// Seeds are deep links to specific, render-friendly content — never site homepages
// (those blank out in reader; eval session 1). They are deliberately balanced two ways
// after eval sessions 2–3: (1) **no single source appears more than twice** — a
// 55%-Wikipedia pool made session 3 feel monotonous and the user churned by stumble #7;
// (2) **format-diverse** — ~half are non-article (video / image / interactive) so the
// stream isn't a reading list. This is a stopgap until the curated channel library (#173).
export const DEFAULT_SEED_ASSETS: SeedAsset[] = [
  // --- Articles (reader-friendly, varied sources) ---
  {
    id: "t1",
    url: "https://blog.codinghorror.com/the-best-code-is-no-code-at-all/",
    title: "The Best Code is No Code At All",
    description: "A classic essay on why less code is better code.",
    source: "Coding Horror",
    category: "tech",
    rating: 0,
    type: "article",
  },
  {
    id: "t2",
    url: "https://paulgraham.com/greatwork.html",
    title: "How to Do Great Work",
    description: "Paul Graham on doing work that matters.",
    source: "Paul Graham",
    category: "tech",
    rating: 0,
    type: "article",
  },
  {
    id: "t3",
    url: "https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/",
    title: "Things You Should Never Do, Part I",
    description: "Joel Spolsky on why you should never rewrite from scratch.",
    source: "Joel on Software",
    category: "tech",
    rating: 0,
    type: "article",
  },
  {
    id: "a1",
    url: "https://en.wikipedia.org/wiki/The_Starry_Night",
    title: "The Starry Night",
    description: "Van Gogh's most famous painting and its story.",
    source: "Wikipedia",
    category: "art",
    rating: 0,
    type: "article",
  },
  {
    id: "r1",
    url: "https://en.wikipedia.org/wiki/Voynich_manuscript",
    title: "The Voynich Manuscript",
    description: "A 600-year-old book no one has ever been able to read.",
    source: "Wikipedia",
    category: "random",
    rating: 0,
    type: "article",
  },
  // --- Video (embeddable /embed/ form so it's recognized as video on reload) ---
  {
    id: "v1",
    url: "https://www.youtube.com/embed/h6fcK_fRYaI",
    title: "The Egg — A Short Story",
    description: "Kurzgesagt's animated take on an Andy Weir short story.",
    source: "YouTube",
    category: "science",
    rating: 0,
    type: "video",
  },
  {
    id: "v2",
    url: "https://www.youtube.com/embed/jNQXAC9IVRw",
    title: "Me at the Zoo",
    description: "The very first video ever uploaded to YouTube.",
    source: "YouTube",
    category: "random",
    rating: 0,
    type: "video",
  },
  // --- Image ---
  {
    id: "i1",
    url: "https://apod.nasa.gov/apod/ap991227.html",
    title: "NASA Astronomy Picture of the Day",
    description: "A daily dose of the cosmos — astronomy imagery from NASA.",
    source: "NASA APOD",
    category: "science",
    rating: 0,
    type: "image",
  },
  {
    id: "i2",
    url: "https://xkcd.com/1133/",
    title: "xkcd: Up Goer Five",
    description: "The Saturn V rocket explained using only the 1,000 most common words.",
    source: "xkcd",
    category: "art",
    rating: 0,
    type: "image",
  },
  // --- Interactive ---
  {
    id: "x1",
    url: "https://pointerpointer.com/",
    title: "Pointer Pointer",
    description: "A delightfully useless interactive toy. Move your mouse.",
    source: "Pointer Pointer",
    category: "random",
    rating: 0,
    type: "interactive",
  },
  {
    id: "x2",
    url: "https://neal.fun/",
    title: "Neal.fun",
    description: "A playground of weird, wonderful interactive experiments.",
    source: "neal.fun",
    category: "random",
    rating: 0,
    type: "interactive",
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
