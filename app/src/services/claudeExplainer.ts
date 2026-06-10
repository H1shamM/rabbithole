/**
 * @fileoverview Claude-backed implementation of the `ExplainerLLM` port. Kept
 * separate from `enrichmentService` so the service stays pure and testable and
 * the model is swappable here in one place. Uses Haiku 4.5 (cheap, plenty good
 * for summarization) + structured outputs, so one cached call per article yields
 * a schema-valid explainer reel ("scenes") plus a summary/key-points fallback.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { EnrichmentDraft, ExplainerLLM } from "./enrichmentService.js";

// Haiku 4.5: ~5x cheaper than Opus on input/output, and summarization is exactly
// the task where it's plenty capable — the right call for a cost-bounded feature.
const MODEL = "claude-haiku-4-5";
/** Cap the article we send so token cost stays bounded on long pages. */
const MAX_INPUT_CHARS = 12_000;

const SYSTEM_PROMPT =
  "You turn dense reference articles into a fun, vivid explainer — the " +
  "'simplify it so people enjoy learning it' style of a Kurzgesagt video. You " +
  "produce both a short text summary and a SCENE REEL: 4–6 slides that walk a " +
  "curious reader through the idea, each with a punchy heading, one or two vivid " +
  "sentences, and a single emoji that best illustrates that beat. Keep it " +
  "concrete and lively; use a plain everyday analogy where it earns its place. " +
  "Never invent facts beyond what the article supports.";

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    keyPoints: { type: "array", items: { type: "string" } },
    scenes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          heading: { type: "string" },
          body: { type: "string" },
          emoji: { type: "string" },
        },
        required: ["heading", "body", "emoji"],
      },
    },
  },
  required: ["summary", "keyPoints", "scenes"],
} as const;

export class ClaudeExplainer implements ExplainerLLM {
  private readonly client: Anthropic;

  constructor(apiKey: string | undefined = process.env.ANTHROPIC_API_KEY) {
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    this.client = new Anthropic({ apiKey });
  }

  async summarize(input: {
    title: string;
    text: string;
  }): Promise<EnrichmentDraft> {
    const text = input.text.slice(0, MAX_INPUT_CHARS);

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            `Title: ${input.title}\n\nArticle:\n${text}\n\n` +
            "Write a 2–4 sentence lively summary, 3–5 short punchy takeaways, and " +
            "a 4–6 scene explainer reel (heading + 1–2 sentences + one emoji each).",
        },
      ],
      output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
    });

    const block = response.content.find((b) => b.type === "text");
    const raw = block && block.type === "text" ? block.text : "{}";
    return JSON.parse(raw) as EnrichmentDraft;
  }
}
