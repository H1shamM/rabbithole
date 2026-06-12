import { Menu } from "lucide-react";
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
}

export function MobileNav({
  category,
  onCategoryChange,
  children,
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
