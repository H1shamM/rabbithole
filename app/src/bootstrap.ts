/**
 * @fileoverview Helper utilities for bootstrapping and initial data seeding.
 */

import type { IStoragePort } from "./db/storagePort.js";
import type { StumbleAsset } from "./models/asset.js";
import type { User } from "./models/user.js";
import bcrypt from "bcrypt";
import { settings } from "./config/settings.js";

export type SeedAsset = Omit<StumbleAsset, "created_at" | "last_visited_at">;

// The **curated content library** (#173) — the moat. Hand-picked, render-friendly,
// channel-organized content modeled on Cloudhiker. Two hard rules from the eval
// sessions: (1) **no single source appears more than twice** (a 55%-Wikipedia pool
// tanked session 3); (2) **format-diverse** — most entries are non-article so the
// stream isn't a reading list. Interactive/image entries can be site *homepages*
// here because they render as preview cards (#172), not blank iframes. Articles must
// still be deep, reader-extractable links. The recommender reorders this pool; it
// grows over time via live sources and (later) promoted community submissions.
export const DEFAULT_SEED_ASSETS: SeedAsset[] = [
  // === Deep Dives (article → reader) ===
  {
    id: "d1",
    url: "https://blog.codinghorror.com/the-best-code-is-no-code-at-all/",
    title: "The Best Code is No Code At All",
    description: "A classic essay on why less code is better code.",
    source: "Coding Horror",
    category: "tech",
    rating: 0,
    type: "article",
    channel: "Deep Dives",
  },
  {
    id: "d2",
    url: "https://paulgraham.com/greatwork.html",
    title: "How to Do Great Work",
    description: "Paul Graham on doing work that matters.",
    source: "Paul Graham",
    category: "tech",
    rating: 0,
    type: "article",
    channel: "Deep Dives",
  },
  {
    id: "d3",
    url: "https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/",
    title: "Things You Should Never Do, Part I",
    description: "Joel Spolsky on why you should never rewrite from scratch.",
    source: "Joel on Software",
    category: "tech",
    rating: 0,
    type: "article",
    channel: "Deep Dives",
  },
  {
    id: "d4",
    url: "https://waitbutwhy.com/2014/05/fermi-paradox.html",
    title: "The Fermi Paradox",
    description: "Where is everybody? Tim Urban on the deafening cosmic silence.",
    source: "Wait But Why",
    category: "science",
    rating: 0,
    type: "article",
    channel: "Deep Dives",
  },
  {
    id: "d5",
    url: "https://en.wikipedia.org/wiki/Tardigrade",
    title: "Tardigrade",
    description: "The near-indestructible micro-animal that survives space.",
    source: "Wikipedia",
    category: "science",
    rating: 0,
    type: "article",
    channel: "Deep Dives",
  },
  {
    id: "d6",
    url: "https://en.wikipedia.org/wiki/Voynich_manuscript",
    title: "The Voynich Manuscript",
    description: "A 600-year-old book no one has ever been able to read.",
    source: "Wikipedia",
    category: "random",
    rating: 0,
    type: "article",
    channel: "Deep Dives",
  },
  // === Fun & Interactive (preview card) ===
  {
    id: "f1",
    url: "https://neal.fun/",
    title: "Neal.fun",
    description: "A playground of weird, wonderful interactive experiments.",
    source: "neal.fun",
    category: "random",
    rating: 0,
    type: "interactive",
    channel: "Fun & Interactive",
  },
  {
    id: "f2",
    url: "https://pointerpointer.com/",
    title: "Pointer Pointer",
    description: "A delightfully useless interactive toy. Move your mouse.",
    source: "Pointer Pointer",
    category: "random",
    rating: 0,
    type: "interactive",
    channel: "Fun & Interactive",
  },
  {
    id: "f3",
    url: "https://theuselessweb.com/",
    title: "The Useless Web",
    description: "One button, one random and gloriously pointless corner of the web.",
    source: "The Useless Web",
    category: "random",
    rating: 0,
    type: "interactive",
    channel: "Fun & Interactive",
  },
  {
    id: "f4",
    url: "https://www.windows93.net/",
    title: "Windows 93",
    description: "A surreal parody operating system you can actually play with.",
    source: "Windows93",
    category: "random",
    rating: 0,
    type: "interactive",
    channel: "Fun & Interactive",
  },
  // === Games (preview card) ===
  {
    id: "g1",
    url: "https://play2048.co/",
    title: "2048",
    description: "The addictive sliding-tile puzzle. Just one more go.",
    source: "2048",
    category: "random",
    rating: 0,
    type: "interactive",
    channel: "Games",
  },
  {
    id: "g2",
    url: "https://slither.io/",
    title: "Slither.io",
    description: "A massively-multiplayer take on the classic snake game.",
    source: "Slither.io",
    category: "random",
    rating: 0,
    type: "interactive",
    channel: "Games",
  },
  // === Gadgets & Tools (preview card) ===
  {
    id: "gt1",
    url: "https://excalidraw.com/",
    title: "Excalidraw",
    description: "A virtual whiteboard with a hand-drawn feel.",
    source: "Excalidraw",
    category: "tech",
    rating: 0,
    type: "interactive",
    channel: "Gadgets & Tools",
  },
  {
    id: "gt2",
    url: "https://www.photopea.com/",
    title: "Photopea",
    description: "A full-featured Photoshop-like image editor in the browser.",
    source: "Photopea",
    category: "tech",
    rating: 0,
    type: "interactive",
    channel: "Gadgets & Tools",
  },
  {
    id: "gt3",
    url: "https://www.wolframalpha.com/",
    title: "Wolfram Alpha",
    description: "A computational knowledge engine that answers, not just searches.",
    source: "WolframAlpha",
    category: "tech",
    rating: 0,
    type: "interactive",
    channel: "Gadgets & Tools",
  },
  // === Funny (preview card) ===
  {
    id: "fn1",
    url: "https://xkcd.com/1133/",
    title: "xkcd: Up Goer Five",
    description: "The Saturn V explained using only the 1,000 most common words.",
    source: "xkcd",
    category: "art",
    rating: 0,
    type: "image",
    channel: "Funny",
  },
  {
    id: "fn2",
    url: "https://xkcd.com/327/",
    title: "xkcd: Exploits of a Mom",
    description: "Little Bobby Tables — the most famous SQL-injection joke ever.",
    source: "xkcd",
    category: "tech",
    rating: 0,
    type: "image",
    channel: "Funny",
  },
  // === Art (preview card) ===
  {
    id: "a1",
    url: "https://www.thisiscolossal.com/",
    title: "Colossal",
    description: "A daily stream of art, design and visual wonder.",
    source: "Colossal",
    category: "art",
    rating: 0,
    type: "image",
    channel: "Art",
  },
  {
    id: "a2",
    url: "https://apod.nasa.gov/apod/ap991227.html",
    title: "NASA Astronomy Picture of the Day",
    description: "A daily dose of the cosmos — astronomy imagery from NASA.",
    source: "NASA APOD",
    category: "science",
    rating: 0,
    type: "image",
    channel: "Art",
  },
  {
    id: "a3",
    url: "https://unsplash.com/",
    title: "Unsplash",
    description: "A bottomless gallery of beautiful, free photography.",
    source: "Unsplash",
    category: "art",
    rating: 0,
    type: "image",
    channel: "Art",
  },
  // === Videos (player) ===
  {
    id: "v1",
    url: "https://www.youtube.com/embed/h6fcK_fRYaI",
    title: "The Egg — A Short Story",
    description: "Kurzgesagt's animated take on an Andy Weir short story.",
    source: "YouTube",
    category: "science",
    rating: 0,
    type: "video",
    channel: "Videos",
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
    channel: "Videos",
  },
  {
    id: "v3",
    url: "https://player.vimeo.com/video/148751763",
    title: "Sintel",
    description: "A visually stunning short fantasy film.",
    source: "Vimeo",
    category: "art",
    rating: 0,
    type: "video",
    channel: "Videos",
  },
  {
    id: "v4",
    url: "https://player.vimeo.com/video/56942699",
    title: "The Present",
    description: "A touching short animation about a boy and a gift.",
    source: "Vimeo",
    category: "art",
    rating: 0,
    type: "video",
    channel: "Videos",
  },
  // === Indie & Classic Web (preview card) ===
  {
    id: "ic1",
    url: "https://wiby.me/",
    title: "Wiby",
    description: "A search engine for the lightweight, personal, classic web.",
    source: "Wiby",
    category: "random",
    rating: 0,
    type: "interactive",
    channel: "Indie & Classic Web",
  },
  {
    id: "ic2",
    url: "https://publicdomainreview.org/",
    title: "The Public Domain Review",
    description: "Curated essays and images from the forgotten public domain.",
    source: "Public Domain Review",
    category: "art",
    rating: 0,
    type: "image",
    channel: "Indie & Classic Web",
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
