import { Sparkles, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Recommendation {
  id: string;
  url: string;
  title?: string;
}

/**
 * Grid of personalized recommendations based on the user's ratings.
 */
export function RecommendationsPanel({
  recommendations = [],
}: {
  recommendations?: Recommendation[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          Recommended for you
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Array.isArray(recommendations) && recommendations.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {recommendations.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <span className="truncate">{item.title || item.url}</span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recommendations yet. Keep rating content!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
