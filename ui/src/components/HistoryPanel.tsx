import { History, ChevronDown, ChevronUp } from "lucide-react";
import type { HistoryItem } from "../hooks/useHistory";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HistoryPanelProps {
  history: HistoryItem[];
  showHistory: boolean;
  setShowHistory: (val: boolean) => void;
  onStumble?: () => void;
}

/**
 * Collapsible list of recently visited stumbles.
 */
export function HistoryPanel({
  history,
  showHistory,
  setShowHistory,
  onStumble,
}: HistoryPanelProps) {
  return (
    <div>
      <Button
        variant="outline"
        onClick={() => setShowHistory(!showHistory)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <History className="size-4" />
          {showHistory ? "Hide History" : "View History"}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          {history.length}
          {showHistory ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </span>
      </Button>
      {showHistory && (
        <Card className="mt-3">
          <CardContent className="pt-6">
            {history.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <p>Your journey has just begun.</p>
                <Button onClick={onStumble} className="mt-3">
                  Explore now
                </Button>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {history.slice(0, 10).map((item) => (
                  <li key={item.timestamp.toString()}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate rounded-lg border border-border px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent"
                    >
                      {item.title || item.url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
