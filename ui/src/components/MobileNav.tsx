import { Menu, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CATEGORIES, type Category } from "./categories";
import { useState } from "react";

interface MobileNavProps {
  category: Category;
  onCategoryChange: (cat: Category) => void;
  /** Secondary surfaces (Library: history/favorites/recommended/submit) live
   *  in the menu rather than cluttering the discovery screen. */
  children?: ReactNode;
  /** Optional search — surfaced in the menu so it's reachable from within the
   *  Reels feed (which covers the header). */
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
}

export function MobileNav({
  category,
  onCategoryChange,
  children,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open menu">
          <Menu className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Menu</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {onSearchSubmit && (
            <form
              onSubmit={(e) => {
                onSearchSubmit(e);
                setOpen(false);
              }}
              className="relative"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery ?? ""}
                onChange={(e) => onSearchQueryChange?.(e.target.value)}
                placeholder="Search the web…"
                aria-label="Search"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </form>
          )}
          <div>
            <p className="px-1 pb-2 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
              Browse
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={category === cat.value ? "secondary" : "ghost"}
                  onClick={() => {
                    onCategoryChange(cat.value);
                    setOpen(false);
                  }}
                  className="justify-start"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {children && (
            <div>
              <p className="px-1 pb-2 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                Library
              </p>
              <div className="space-y-3">{children}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
