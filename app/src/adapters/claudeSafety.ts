/**
 * @fileoverview Claude-backed adapter for the `SafetyLLM` port (#335). Mirrors
 * `claudeExplainer.ts`: Haiku 4.5 + structured outputs, client injectable for
 * tests. Classifies a single asset (from its url/title/description) into
 * pass/flag for the blocked categories. Cheap, classify-once-and-cache (the
 * verdict is persisted in `assets.safety_status`).
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  SafetyLLM,
  SafetyCategory,
  SafetyInput,
} from "../services/safetyService.js";

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 200;

const SYSTEM_PROMPT = `You are a content-safety classifier for a serendipitous web-discovery app shown to a general audience.
Given a web page's URL, title, and description, decide whether it must be BLOCKED.

Flag (verdict "flag") ONLY if the page clearly falls into one of these categories:
- "sexual": pornography or explicit sexual content
- "violence": graphic violence, gore, or shock content
- "spam": scams, phishing, malware, or low-effort spam / parked domains
- "hate": hate speech or harassment targeting protected groups

Otherwise return verdict "pass". When genuinely unsure, prefer "pass" — this is curated, generally-interesting content and over-blocking hurts the experience. Always include a short reason.`;

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string", enum: ["pass", "flag"] },
    category: { type: "string", enum: ["sexual", "violence", "spam", "hate"] },
    reason: { type: "string" },
  },
  required: ["verdict", "reason"],
} as const;

/** The upstream safety LLM call failed (network, API, or malformed output). */
export class SafetyUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SafetyUnavailableError";
  }
}

export class ClaudeSafety implements SafetyLLM {
  private readonly client: Anthropic;

  constructor(
    apiKey: string | undefined = process.env.ANTHROPIC_API_KEY,
    client?: Anthropic,
  ) {
    if (client) {
      this.client = client;
      return;
    }
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    this.client = new Anthropic({ apiKey });
  }

  async classify(asset: SafetyInput): Promise<{
    verdict: "pass" | "flag";
    category?: SafetyCategory;
    reason?: string;
  }> {
    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content:
              `URL: ${asset.url}\n` +
              `Title: ${asset.title ?? ""}\n` +
              `Description: ${asset.description ?? ""}`,
          },
        ],
        output_config: {
          format: { type: "json_schema", schema: OUTPUT_SCHEMA },
        },
      });
    } catch (err) {
      throw new SafetyUnavailableError("Safety API call failed", {
        cause: err,
      });
    }

    if (response.stop_reason === "max_tokens") {
      throw new SafetyUnavailableError("Safety response was truncated");
    }

    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new SafetyUnavailableError("Safety returned no text block");
    }

    try {
      return JSON.parse(block.text) as {
        verdict: "pass" | "flag";
        category?: SafetyCategory;
        reason?: string;
      };
    } catch (err) {
      throw new SafetyUnavailableError("Safety returned invalid JSON", {
        cause: err,
      });
    }
  }
}
