/**
 * One-off (re-runnable) safety backfill (#336). Classifies every asset in
 * `stumble.db` and writes a real `safety_status` verdict — verifying the
 * curated seed library and flagging anything bad (flagged assets drop out of
 * every serve query). Uses the LLM when ANTHROPIC_API_KEY is set, otherwise
 * heuristics-only.
 *
 *   cd app && npm run backfill:safety
 *
 * Run before launch and after large content changes.
 */
import { SqliteAdapter } from "../src/db/sqliteAdapter.js";
import {
  createSafetyClassifier,
  backfillSafety,
} from "../src/services/safetyService.js";
import { ClaudeSafety } from "../src/adapters/claudeSafety.js";

async function main() {
  const storage = new SqliteAdapter("stumble.db");
  const classifier = createSafetyClassifier(
    process.env.ANTHROPIC_API_KEY ? new ClaudeSafety() : undefined,
  );
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(
      "[backfill-safety] ANTHROPIC_API_KEY not set — heuristics-only pass.",
    );
  }
  const tally = await backfillSafety(storage, classifier);
  console.log(
    `[backfill-safety] done: ${tally.pass} pass, ${tally.flag} flag, ${tally.pending} pending`,
  );
}

main().catch((err) => {
  console.error("[backfill-safety] failed:", err);
  process.exit(1);
});
