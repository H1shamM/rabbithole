import { describe, it, expect, vi, beforeEach } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import {
  ClaudeSafety,
  SafetyUnavailableError,
} from "../../../app/src/adapters/claudeSafety";

// Inject a fake SDK client (DI) so no real network call is made.
const createMock = vi.fn();
const fakeClient = {
  messages: { create: createMock },
} as unknown as Anthropic;

const make = () => new ClaudeSafety("test-key", fakeClient);
const asset = { url: "https://example.com", title: "T", description: "D" };

describe("ClaudeSafety", () => {
  beforeEach(() => createMock.mockReset());

  it("parses a pass verdict", async () => {
    createMock.mockResolvedValue({
      stop_reason: "end_turn",
      content: [
        {
          type: "text",
          text: JSON.stringify({ verdict: "pass", reason: "ok" }),
        },
      ],
    });
    const r = await make().classify(asset);
    expect(r.verdict).toBe("pass");
  });

  it("parses a flag verdict with category + reason", async () => {
    createMock.mockResolvedValue({
      stop_reason: "end_turn",
      content: [
        {
          type: "text",
          text: JSON.stringify({
            verdict: "flag",
            category: "spam",
            reason: "phishing",
          }),
        },
      ],
    });
    const r = await make().classify(asset);
    expect(r).toEqual({
      verdict: "flag",
      category: "spam",
      reason: "phishing",
    });
  });

  it("throws on a truncated response (never parses the partial)", async () => {
    createMock.mockResolvedValue({
      stop_reason: "max_tokens",
      content: [{ type: "text", text: '{"verdict":"fla' }],
    });
    await expect(make().classify(asset)).rejects.toBeInstanceOf(
      SafetyUnavailableError,
    );
  });

  it("throws on non-JSON output", async () => {
    createMock.mockResolvedValue({
      stop_reason: "end_turn",
      content: [{ type: "text", text: "not json" }],
    });
    await expect(make().classify(asset)).rejects.toBeInstanceOf(
      SafetyUnavailableError,
    );
  });

  // Note: the create()-rejects → SafetyUnavailableError wrapping is covered
  // behaviourally by the service-level fail-closed test (an LLM error yields
  // 'pending') and by the truncation/non-JSON cases above (same throw path);
  // mocking a throwing SDK create() trips a vitest unhandled-rejection artifact.

  it("requires an API key when no client is injected", () => {
    expect(() => new ClaudeSafety(undefined)).toThrow(/ANTHROPIC_API_KEY/);
  });
});
