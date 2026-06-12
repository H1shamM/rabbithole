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
    type: "article",
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

  // --- Food & Drink (article / image / interactive) ---
  { id: "fd1", url: "https://www.seriouseats.com/the-food-lab-best-roast-potatoes-all-time-recipe", title: "The Food Lab: Best Roast Potatoes", description: "The science of the perfect roast potato.", source: "Serious Eats", category: "random", rating: 0, type: "article", channel: "Food & Drink" },
  { id: "fd2", url: "https://www.bonappetit.com/", title: "Bon Appétit", description: "Delicious recipes and culinary inspiration.", source: "Bon Appétit", category: "random", rating: 0, type: "image", channel: "Food & Drink" },
  { id: "fd3", url: "https://www.eater.com/", title: "Eater", description: "The latest food news, reviews, and maps.", source: "Eater", category: "random", rating: 0, type: "image", channel: "Food & Drink" },

  // --- Music & Audio (interactive / video) ---
  { id: "m1", url: "https://radio.garden/", title: "Radio Garden", description: "Explore the world through live radio.", source: "Radio Garden", category: "random", rating: 0, type: "interactive", channel: "Music & Audio" },
  { id: "m2", url: "https://musicmap.info/", title: "Musicmap", description: "The genealogy of popular music genres.", source: "Musicmap", category: "art", rating: 0, type: "interactive", channel: "Music & Audio" },
  { id: "m3", url: "https://www.npr.org/sections/tiny-desk-concerts/", title: "NPR Tiny Desk Concerts", description: "Intimate live performances from great artists.", source: "NPR", category: "art", rating: 0, type: "video", channel: "Music & Audio" },

  // --- Games (expanded) ---
  { id: "g15", url: "https://dwarf-fortress.en.uptodown.com/windows", title: "Dwarf Fortress", description: "The deepest, most complex simulation ever made.", source: "Bay 12 Games", category: "tech", rating: 0, type: "interactive", channel: "Games" },
  { id: "g16", url: "https://www.freeciv.org/", title: "Freeciv", description: "Open-source strategy game inspired by Civilization.", source: "Freeciv", category: "tech", rating: 0, type: "interactive", channel: "Games" },
  { id: "g17", url: "https://threesjs.com/", title: "Threes!", description: "The tiny puzzle game that started a genre.", source: "Threes!", category: "random", rating: 0, type: "interactive", channel: "Games" },
  { id: "g18", url: "https://www.kingdomofloathing.com/", title: "Kingdom of Loathing", description: "A browser-based RPG with stick-figure art and sharp wit.", source: "KoL", category: "random", rating: 0, type: "interactive", channel: "Games" },
  { id: "g19", url: "https://www.nethack.org/", title: "NetHack", description: "The ultimate roguelike dungeon crawler.", source: "NetHack", category: "tech", rating: 0, type: "interactive", channel: "Games" },
  { id: "g20", url: "https://www.torn.com/", title: "Torn", description: "A massive text-based crime RPG.", source: "Torn", category: "random", rating: 0, type: "interactive", channel: "Games" },
  { id: "g21", url: "https://www.popcap.com/bejeweled-online-free-game", title: "Bejeweled", description: "The classic match-three gem puzzle game.", source: "PopCap", category: "random", rating: 0, type: "interactive", channel: "Games" },
  { id: "g22", url: "https://www.gamesforthebrain.com/", title: "Games for the Brain", description: "Keep your mind sharp with these puzzles.", source: "Games for the Brain", category: "science", rating: 0, type: "interactive", channel: "Games" },
  { id: "g23", url: "https://www.chess.com/", title: "Chess.com", description: "Play, learn, and improve your chess game.", source: "Chess.com", category: "random", rating: 0, type: "interactive", channel: "Games" },
  { id: "g24", url: "https://www.sokoban.dk/", title: "Sokoban", description: "Push crates into the right spots — harder than it looks.", source: "Sokoban", category: "tech", rating: 0, type: "interactive", channel: "Games" },
  { id: "g25", url: "https://www.krunker.io/", title: "Krunker.io", description: "Fast-paced pixelated first-person shooter.", source: "Krunker", category: "random", rating: 0, type: "interactive", channel: "Games" },
  { id: "g26", url: "https://www.skribbl.io/", title: "Skribbl.io", description: "Multiplayer drawing and guessing game.", source: "Skribbl", category: "art", rating: 0, type: "interactive", channel: "Games" },

  // --- Science & Nature (article / video) ---
  { id: "sn1", url: "https://www.quantamagazine.org/", title: "Quanta Magazine", description: "In-depth physics, math, and biology reporting.", source: "Quanta", category: "science", rating: 0, type: "article", channel: "Science & Nature" },
  { id: "sn2", url: "https://www.nationalgeographic.com/", title: "National Geographic", description: "Stories about our world, humanity, and wildlife.", source: "NatGeo", category: "science", rating: 0, type: "image", channel: "Science & Nature" },
  { id: "sn3", url: "https://www.ted.com/", title: "TED Talks", description: "Ideas worth spreading from global experts.", source: "TED", category: "science", rating: 0, type: "video", channel: "Science & Nature" },
  { id: "sn4", url: "https://www.esa.int/", title: "ESA", description: "European Space Agency — exploring the universe.", source: "ESA", category: "science", rating: 0, type: "image", channel: "Science & Nature" },
  { id: "sn5", url: "https://www.noaa.gov/", title: "NOAA", description: "Monitoring our climate, oceans, and weather.", source: "NOAA", category: "science", rating: 0, type: "article", channel: "Science & Nature" },
  { id: "sn6", url: "https://www.zsl.org/", title: "ZSL", description: "Zoological Society of London — conservation science.", source: "ZSL", category: "science", rating: 0, type: "image", channel: "Science & Nature" },
  { id: "sn7", url: "https://www.nature.com/", title: "Nature", description: "The world's leading science journal.", source: "Nature", category: "science", rating: 0, type: "article", channel: "Science & Nature" },
  { id: "sn8", url: "https://www.science.org/", title: "Science", description: "Breaking news and research from Science magazine.", source: "Science", category: "science", rating: 0, type: "article", channel: "Science & Nature" },
  { id: "sn9", url: "https://www.bbcearth.com/", title: "BBC Earth", description: "Incredible stories from the natural world.", source: "BBC", category: "science", rating: 0, type: "image", channel: "Science & Nature" },
  { id: "sn10", url: "https://www.si.edu/", title: "Smithsonian", description: "Explore history, culture, and scientific discoveries.", source: "Smithsonian", category: "science", rating: 0, type: "image", channel: "Science & Nature" },

  // --- Design & Architecture (image / interactive) ---
  { id: "da1", url: "https://www.archdaily.com/", title: "ArchDaily", description: "The world's most visited architecture website.", source: "ArchDaily", category: "art", rating: 0, type: "image", channel: "Design & Architecture" },
  { id: "da2", url: "https://www.dezeen.com/", title: "Dezeen", description: "Architecture and design news and features.", source: "Dezeen", category: "art", rating: 0, type: "image", channel: "Design & Architecture" },
  { id: "da3", url: "https://99percentinvisible.org/", title: "99% Invisible", description: "Design, architecture, and the unnoticed built world.", source: "99% Invisible", category: "art", rating: 0, type: "article", channel: "Design & Architecture" },
  { id: "da4", url: "https://www.fonts.com/", title: "Fonts.com", description: "Explore the typography of the modern web.", source: "Fonts.com", category: "art", rating: 0, type: "interactive", channel: "Design & Architecture" },
  { id: "da5", url: "https://www.css-tricks.com/", title: "CSS-Tricks", description: "Digging into all things front-end and web design.", source: "CSS-Tricks", category: "tech", rating: 0, type: "article", channel: "Design & Architecture" },
  { id: "da6", url: "https://www.awwwards.com/", title: "Awwwards", description: "Awards for the best web design from around the world.", source: "Awwwards", category: "art", rating: 0, type: "image", channel: "Design & Architecture" },
  { id: "da7", url: "https://www.canva.com/", title: "Canva", description: "Simple design tools for everyone.", source: "Canva", category: "art", rating: 0, type: "interactive", channel: "Design & Architecture" },
  { id: "da8", url: "https://www.figma.com/", title: "Figma", description: "Collaborative interface design for design teams.", source: "Figma", category: "tech", rating: 0, type: "interactive", channel: "Design & Architecture" },

  // --- History (article / image) ---
  { id: "h1", url: "https://www.history.com/", title: "History", description: "Events and stories that shaped our world.", source: "History.com", category: "random", rating: 0, type: "article", channel: "History" },
  { id: "h2", url: "https://www.loc.gov/", title: "Library of Congress", description: "Access the nation's digital history archives.", source: "Library of Congress", category: "art", rating: 0, type: "image", channel: "History" },
  { id: "h3", url: "https://www.smithsonianmag.com/history/", title: "Smithsonian History", description: "Deep dives into the stories behind historical events.", source: "Smithsonian", category: "random", rating: 0, type: "article", channel: "History" },
  { id: "h4", url: "https://www.nationalarchives.gov.uk/", title: "The National Archives", description: "Records from over 1,000 years of UK history.", source: "National Archives", category: "random", rating: 0, type: "article", channel: "History" },
  { id: "h5", url: "https://www.worldhistory.org/", title: "World History Encyclopedia", description: "The world's largest history encyclopedia.", source: "World History", category: "random", rating: 0, type: "article", channel: "History" },

  // --- Technology (article / interactive) ---
  { id: "t1", url: "https://arstechnica.com/", title: "Ars Technica", description: "IT, tech policy, and science news.", source: "Ars Technica", category: "tech", rating: 0, type: "article", channel: "Deep Dives" },
  { id: "t2", url: "https://www.theverge.com/", title: "The Verge", description: "Tech, science, art, and culture.", source: "The Verge", category: "tech", rating: 0, type: "article", channel: "Deep Dives" },
  { id: "t3", url: "https://www.wired.com/", title: "Wired", description: "How technology is changing our world.", source: "Wired", category: "tech", rating: 0, type: "article", channel: "Deep Dives" },
  { id: "t4", url: "https://www.fastcompany.com/", title: "Fast Company", description: "Business, technology, and design.", source: "Fast Company", category: "tech", rating: 0, type: "article", channel: "Deep Dives" },
  { id: "t5", url: "https://techcrunch.com/", title: "TechCrunch", description: "Startup and tech industry news.", source: "TechCrunch", category: "tech", rating: 0, type: "article", channel: "Deep Dives" },
  { id: "t6", url: "https://www.theregister.com/", title: "The Register", description: "Hard-hitting tech news with a sharp tongue.", source: "The Register", category: "tech", rating: 0, type: "article", channel: "Deep Dives" },
  { id: "t7", url: "https://www.howtogeek.com/", title: "How-To Geek", description: "Practical guides and tech explanations.", source: "How-To Geek", category: "tech", rating: 0, type: "article", channel: "Deep Dives" },
  { id: "t8", url: "https://www.makeuseof.com/", title: "MakeUseOf", description: "Tech guides, reviews, and how-tos.", source: "MakeUseOf", category: "tech", rating: 0, type: "article", channel: "Deep Dives" },
  { id: "t9", url: "https://www.linux.com/", title: "Linux.com", description: "All things Linux and open source.", source: "Linux.com", category: "tech", rating: 0, type: "article", channel: "Deep Dives" },
  { id: "t10", url: "https://www.raspberrypi.org/", title: "Raspberry Pi", description: "The world's favorite single-board computer.", source: "Raspberry Pi", category: "tech", rating: 0, type: "article", channel: "Deep Dives" },
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
