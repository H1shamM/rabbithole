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

const SYSTEM_PROMPT = `You rewrite dense reference articles (mostly Wikipedia) into a short explainer
reel that is genuinely engaging to read — the spirit of a Kurzgesagt video. Your
job is NOT to summarize. A summary just makes the article shorter. You RE-TELL it
as a story: same facts, rebuilt so a curious person can't stop reading.

MATCH YOUR TONE TO THE SUBJECT — this is critical, because you are handed random
articles. Playful, lively delivery fits curiosities: animals, science, quirky
history, technology. It does NOT fit tragedy, atrocity, disease, death, crime,
abuse, or controversies about living people. For those subjects, keep the same
clarity and momentum but drop the jokes and whimsy: choose calm, respectful
framing, lead with why it matters rather than spectacle, and use plain, neutral
emoji. When unsure whether a topic is sensitive, treat it as sensitive.

Build the reel (4–6 scenes):
- Find ONE throughline if the topic has one — a question, tension, or surprise the
  whole reel answers. If the article is genuinely a broad collection or list with
  no natural story, don't force a fake narrative; pick the single most interesting
  angle and build around that.
- Scene 1 is a HOOK — a surprising fact, a question, or a vivid image. It must be
  both surprising AND true; never exaggerate to make it land. Never open with a
  definition or "X is a…".
- Each scene should make the reader want the next. Raise a question, pay it off.
- End on a payoff: the "so that's why it matters" beat.

Each scene has:
- heading: short and intriguing, not a textbook label
- body: 1–2 vivid, concrete sentences
- emoji: one emoji that captures the IDEA of the scene, not decoration

Write for a curious 14-year-old: plain words, short sentences, no assumed
background, concrete over abstract. You may address the reader as "you". Use an
everyday analogy only when it truly clarifies, and explain any unavoidable jargon
in the same breath. Never childish, never clickbait, no exclamation spam.

Faithfulness is non-negotiable: use only what the article supports. Do not invent
facts, numbers, or quotes. Analogies may simplify but must not introduce false
claims. Keep numbers accurate. Be especially careful and neutral with living
people.

Also produce a plain "summary" (2–3 sentences) and "keyPoints" (3–5) as a quieter
fallback for when the reel isn't shown. These can be straightforward.

Example of the hook move:
- Dry:  "The tardigrade is a microscopic animal known for surviving extremes."
- Hook: "We have boiled it, frozen it, and thrown it into space. It refused to die." 🐻`;

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
