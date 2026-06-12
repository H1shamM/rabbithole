// ui/src/components/Header.tsx
import type { ReactNode } from "react";
import { Search, Sun, Moon, User, LogOut, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  user: {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
  } | null;
  onUserClick: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  /** Leading slot for mobile (e.g. the menu trigger); hidden at lg and up. */
  leftSlot?: ReactNode;
}

/**
 * Sticky top bar: global search on the left, theme toggle and the user menu
 * (avatar dropdown when signed in, otherwise a login button) on the right.
 */
export function Header({
  darkMode,
  setDarkMode,
  user,
  onUserClick,
  onLogout,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  leftSlot,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
      {/* Mobile-only leading cluster: menu trigger + brand mark. The sidebar
          carries the brand at lg and up, so this is hidden there. */}
      <div className="flex items-center gap-2 lg:hidden">
        {leftSlot}
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Compass className="size-4" />
        </div>
      </div>

      {/* Search */}
      <form onSubmit={onSearchSubmit} className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search the web…"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          aria-label="Search"
          className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="User menu"
              >
                <Avatar className="size-8">
                  <AvatarImage
                    src={user.avatar_url}
                    alt={user.display_name || "User"}
                  />
                  <AvatarFallback>
                    {(user.display_name || user.email || "?")[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onUserClick}>
                <User className="mr-2 size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 size-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" onClick={onUserClick} className="gap-2">
            <User className="size-4" />
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
