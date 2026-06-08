import crypto from "crypto";
import type { ContentFetcher } from "./ContentFetcher.js";
import type { StumbleAsset } from "../models/asset.js";
import { fetchWithTimeout } from "./utils.js";

export class XkcdSource implements ContentFetcher {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchStumble(category: string): Promise<StumbleAsset | null> {
    try {
      const latestRes = await fetchWithTimeout("https://xkcd.com/info.0.json", {}, 5000);
      if (!latestRes.ok) return null;
      const latest = await latestRes.json();

      const n = Math.floor(Math.random() * latest.num) + 1;
      const res = await fetchWithTimeout(`https://xkcd.com/${n}/info.0.json`, {}, 5000);
      if (!res.ok) return null;
      const comic = await res.json();

      return {
        id: crypto.randomUUID(),
        url: `https://xkcd.com/${comic.num}/`,
        title: `xkcd: ${comic.title}`,
        description: comic.alt ?? "",
        source: "xkcd",
        category: "random",
        rating: 0,
        created_at: new Date(),
      };
    } catch (e) {
      console.error("Error fetching from xkcd:", e);
      return null;
    }
  }
}
