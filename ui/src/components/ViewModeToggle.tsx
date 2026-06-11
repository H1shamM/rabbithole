import { BookOpen, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "reader" | "live" | "explainer";

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  /** Explainer is article-only — the third button shows only when true. */
  showExplainer?: boolean;
}

export function ViewModeToggle({
  mode,
  onChange,
  showExplainer = false,
}: ViewModeToggleProps) {
  return (
    <div className="flex rounded-md border p-1 bg-background">
      <Button
        variant={mode === "reader" ? "secondary" : "ghost"}
        size="sm"
        className="flex-1"
        onClick={() => onChange("reader")}
        aria-pressed={mode === "reader"}
      >
        <BookOpen className="mr-2 h-4 w-4" />
        Reader
      </Button>
      <Button
        variant={mode === "live" ? "secondary" : "ghost"}
        size="sm"
        className="flex-1"
        onClick={() => onChange("live")}
        aria-pressed={mode === "live"}
      >
        <Globe className="mr-2 h-4 w-4" />
        Live
      </Button>
      {showExplainer && (
        <Button
          variant={mode === "explainer" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => onChange("explainer")}
          aria-pressed={mode === "explainer"}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Explainer
        </Button>
      )}
    </div>
  );
}
