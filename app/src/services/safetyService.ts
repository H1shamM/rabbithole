/**
 * @fileoverview Content-safety classification (#332). The cheapest-first
 * pipeline: `screenHeuristics` (this file, #334 — zero cost, no network) runs
 * first; whatever it can't decide ("unknown") is deferred to the LLM classifier
 * (#335). Only assets that ultimately `pass` are ever served (the serve filter
 * lives in the storage adapter, #333).
 */

import {
  ADULT_DOMAINS,
  ADULT_TLDS,
  ADULT_URL_PATTERNS,
} from "../config/safetyBlocklist.js";
import type { StumbleAsset } from "../models/asset.js";

/** The categories the gate blocks on (decided for #332). */
export type SafetyCategory = "sexual" | "violence" | "spam" | "hate";

/**
 * A heuristic either flags an asset (with a category + reason) or returns
 * `unknown`, meaning "not obviously bad — let the LLM decide."
 */
export type HeuristicResult =
  | { verdict: "flag"; category: SafetyCategory; reason: string }
  | { verdict: "unknown" };

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** True if `host` is exactly `domain` or a subdomain of it (not a substring). */
function isDomainOrSubdomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

/**
 * Zero-cost first pass: flag the unambiguously unsafe (known adult domains,
 * adult TLDs, high-precision adult URL keywords). Everything else is `unknown`
 * and deferred to the LLM classifier. No network calls.
 */
export function screenHeuristics(
  asset: Pick<StumbleAsset, "url">,
): HeuristicResult {
  const host = getHostname(asset.url);
  if (!host) return { verdict: "unknown" };

  if (ADULT_DOMAINS.some((d) => isDomainOrSubdomain(host, d))) {
    return {
      verdict: "flag",
      category: "sexual",
      reason: `adult domain: ${host}`,
    };
  }

  if (ADULT_TLDS.some((tld) => host.endsWith(tld))) {
    return {
      verdict: "flag",
      category: "sexual",
      reason: `adult TLD: ${host}`,
    };
  }

  const url = asset.url.toLowerCase();
  if (ADULT_URL_PATTERNS.some((re) => re.test(url))) {
    return {
      verdict: "flag",
      category: "sexual",
      reason: "adult keyword in URL",
    };
  }

  return { verdict: "unknown" };
}

/** What the asset's `safety_status` should become (#333 schema). */
export type SafetyVerdict =
  | { status: "pass" }
  | { status: "flag"; category: SafetyCategory; reason: string }
  | { status: "pending"; reason: string };

/** The asset fields the safety pipeline reads. */
export type SafetyInput = Pick<StumbleAsset, "url" | "title" | "description">;

/**
 * Port for the LLM safety classifier (#335). Implemented by an adapter in
 * `adapters/` (hexagonal). Returns a pass/flag judgement for a single asset.
 */
export interface SafetyLLM {
  classify(asset: SafetyInput): Promise<{
    verdict: "pass" | "flag";
    category?: SafetyCategory;
    reason?: string;
  }>;
}

/** Runs the full cheapest-first safety pipeline for one asset. */
export interface SafetyClassifier {
  classify(asset: SafetyInput): Promise<SafetyVerdict>;
}

/**
 * Build the classifier: heuristics first (free), then the LLM for whatever the
 * heuristics can't decide. Fail-closed — an LLM error yields `pending` (not
 * served), never a false `pass`. With no LLM configured it degrades to
 * heuristics-only (flags the blatant, passes the rest) — fine for dev/CI, but
 * production must set `ANTHROPIC_API_KEY` for real coverage.
 */
export function createSafetyClassifier(llm?: SafetyLLM): SafetyClassifier {
  return {
    async classify(asset) {
      const h = screenHeuristics(asset);
      if (h.verdict === "flag") {
        return { status: "flag", category: h.category, reason: h.reason };
      }
      if (!llm) return { status: "pass" };
      try {
        const r = await llm.classify(asset);
        if (r.verdict === "flag") {
          return {
            status: "flag",
            category: r.category ?? "spam",
            reason: r.reason ?? "flagged by classifier",
          };
        }
        return { status: "pass" };
      } catch {
        return { status: "pending", reason: "safety classifier unavailable" };
      }
    },
  };
}
