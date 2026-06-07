import { describe, it, expect } from "vitest";
import { WikipediaImageSource } from "../../../app/src/sources/wikipedia_image";

describe("WikipediaImageSource", () => {
  it("should return a random wikimedia image", async () => {
    const source = new WikipediaImageSource();
    const asset = await source.fetchStumble("art");

    expect(asset).not.toBeNull();
    expect(asset?.url).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Random_example.jpg/800px-Random_example.jpg",
    );
    expect(asset?.title).toBe("Random Wikimedia Image");
    expect(asset?.source).toBe("Wikipedia Image");
  });
});
