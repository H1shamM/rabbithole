import { describe, it, expect, vi } from "vitest";
import {
  createSafetyClassifier,
  type SafetyLLM,
} from "../../../app/src/services/safetyService";

const ASSET = {
  url: "https://example.com/cats",
  title: "Cats",
  description: "about cats",
};

describe("createSafetyClassifier (#335)", () => {
  it("flags via heuristics without calling the LLM", async () => {
    const llm: SafetyLLM = { classify: vi.fn() };
    const c = createSafetyClassifier(llm);
    const v = await c.classify({ url: "https://www.pornhub.com/x" });
    expect(v.status).toBe("flag");
    if (v.status === "flag") expect(v.category).toBe("sexual");
    expect(llm.classify).not.toHaveBeenCalled();
  });

  it("passes an unknown asset when no LLM is configured (heuristics-only)", async () => {
    const c = createSafetyClassifier();
    expect((await c.classify(ASSET)).status).toBe("pass");
  });

  it("passes when the LLM says pass", async () => {
    const llm: SafetyLLM = {
      classify: vi.fn().mockResolvedValue({ verdict: "pass" }),
    };
    expect((await createSafetyClassifier(llm).classify(ASSET)).status).toBe(
      "pass",
    );
  });

  it("flags when the LLM says flag (carrying category/reason)", async () => {
    const llm: SafetyLLM = {
      classify: vi.fn().mockResolvedValue({
        verdict: "flag",
        category: "spam",
        reason: "phishing",
      }),
    };
    const v = await createSafetyClassifier(llm).classify(ASSET);
    expect(v).toEqual({ status: "flag", category: "spam", reason: "phishing" });
  });

  it("is fail-closed: an LLM error yields 'pending', never a false pass", async () => {
    const llm: SafetyLLM = {
      classify: vi.fn().mockRejectedValue(new Error("boom")),
    };
    expect((await createSafetyClassifier(llm).classify(ASSET)).status).toBe(
      "pending",
    );
  });
});
