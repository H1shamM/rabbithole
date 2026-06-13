import { describe, it, expect } from "vitest";
import { screenHeuristics } from "../../../app/src/services/safetyService";

const flag = (url: string) => screenHeuristics({ url });

describe("screenHeuristics (#334)", () => {
  it("flags a known adult domain", () => {
    const r = flag("https://www.pornhub.com/view");
    expect(r.verdict).toBe("flag");
    if (r.verdict === "flag") expect(r.category).toBe("sexual");
  });

  it("flags subdomains of a blocked domain", () => {
    expect(flag("https://cdn.xvideos.com/x").verdict).toBe("flag");
  });

  it("flags an adult TLD", () => {
    expect(flag("https://anything.xxx/").verdict).toBe("flag");
  });

  it("flags an adult keyword in the URL", () => {
    expect(flag("https://example.com/free-porn-list").verdict).toBe("flag");
  });

  it("returns unknown for ordinary sites", () => {
    expect(flag("https://en.wikipedia.org/wiki/Cat").verdict).toBe("unknown");
    expect(flag("https://blog.codinghorror.com/").verdict).toBe("unknown");
  });

  it("does not false-positive on substrings (boundary-safe)", () => {
    // "expornography" must not trip \bporn\b; "notpornhub.com" is not pornhub.com
    expect(flag("https://expornography-research.edu/").verdict).toBe("unknown");
    expect(flag("https://notpornhub.com.example.org/").verdict).toBe("unknown");
  });

  it("returns unknown for an unparseable URL", () => {
    expect(flag("not a url").verdict).toBe("unknown");
  });
});
