import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExplainerScene } from "../hooks/useEnrichment";

interface ExplainerReelProps {
  scenes: ExplainerScene[];
  /** Article hero image, shown on the first slide when present. */
  heroImage: string | null;
  provenance: string;
  sourceUrl: string;
}

const AUTO_ADVANCE_MS = 5000;

/**
 * A "Kurzgesagt-lite" explainer: the AI scene script rendered as an animated,
 * navigable slide reel (emoji visuals, motion transitions, optional autoplay).
 * Pure presentational — all content comes from the single cached enrichment call,
 * so there's no extra API cost over the text summary.
 */
export function ExplainerReel({
  scenes,
  heroImage,
  provenance,
  sourceUrl,
}: ExplainerReelProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const count = scenes.length;

  const go = useCallback(
    (next: number) => setIndex(Math.max(0, Math.min(count - 1, next))),
    [count],
  );

  // Auto-advance while playing; stop once the last slide is reached.
  useEffect(() => {
    if (!playing) return;
    if (index >= count - 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIndex((i) => Math.min(count - 1, i + 1)), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [playing, index, count]);

  // Arrow-key navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(count - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  if (count === 0) return null;

  const scene = scenes[index];
  const showHero = index === 0 && !!heroImage;

  return (
    <Card className="overflow-hidden">
      {/* Stage */}
      <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-primary/5 to-muted">
        {/* Keyed on index: each slide re-mounts and plays its enter animation. */}
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
        >
          {showHero ? (
            <img
              src={heroImage!}
              alt={scene.heading}
              className="max-h-32 rounded-lg object-contain"
              loading="lazy"
            />
          ) : (
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="text-7xl"
              aria-hidden
            >
              {scene.emoji}
            </motion.div>
          )}
          <h2 className="text-2xl font-semibold tracking-tight">
            {scene.heading}
          </h2>
          <p className="max-w-prose text-muted-foreground">{scene.body}</p>
        </motion.div>

        <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-xs text-muted-foreground">
          {`${index + 1} / ${count}`}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 border-t p-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous slide"
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          <ChevronLeft />
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
          <div className="flex gap-1.5" role="tablist" aria-label="Slides">
            {scenes.map((s, i) => (
              <button
                key={`${i}-${s.heading}`}
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => go(i)}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  i === index ? "bg-primary" : "bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Next slide"
          disabled={index === count - 1}
          onClick={() => go(index + 1)}
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Footer: provenance + original */}
      <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
        <span className="text-xs italic text-muted-foreground">{provenance}</span>
        <Button asChild variant="link" size="sm" className="h-auto gap-1 p-0">
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            Read the original
          </a>
        </Button>
      </div>
    </Card>
  );
}
