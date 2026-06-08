import { Star, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FavoriteItem {
  id: string;
  url: string;
  title?: string;
}

interface FavoritesPanelProps {
  favorites: FavoriteItem[];
  showFavorites: boolean;
  setShowFavorites: (val: boolean) => void;
  onRemove: (id: string) => void;
  onStumble?: () => void;
}

/**
 * Collapsible list of the user's saved (favorited) stumbles.
 */
export function FavoritesPanel({
  favorites,
  showFavorites,
  setShowFavorites,
  onRemove,
  onStumble,
}: FavoritesPanelProps) {
  return (
    <div>
      <Button
        variant="outline"
        onClick={() => setShowFavorites(!showFavorites)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Star className="size-4" />
          {showFavorites ? "Hide Favorites" : "Favorites"}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          {favorites.length}
          {showFavorites ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </span>
      </Button>
      {showFavorites && (
        <Card className="mt-3">
          <CardContent className="pt-6">
            {favorites.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <p>Your treasure chest is empty.</p>
                <Button onClick={onStumble} className="mt-3">
                  Explore now
                </Button>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {favorites.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:border-primary/40"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 truncate text-sm font-medium hover:text-primary"
                    >
                      {item.title || item.url}
                    </a>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemove(item.id)}
                      aria-label="Remove from favorites"
                    >
                      <Trash2 />
                    </Button>
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
