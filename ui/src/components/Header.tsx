// ui/src/components/Header.tsx
import React from "react";

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
  isInstallable: boolean;
  onInstall: () => void;
}

export function Header({
  darkMode,
  setDarkMode,
  user,
  onUserClick,
  isInstallable,
  onInstall,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-row">
        <h1 className="logo">StumbleClone</h1>
        <p className="tagline">Discover the web</p>
        <button
          className="btn theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle theme"
          style={{ transition: "transform 0.2s" }}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <button className="btn secondary" onClick={onUserClick}>
          {user ? (
            <div className="user-info">
              {user.avatar_url && (
                <img src={user.avatar_url} alt="" className="avatar-small" />
              )}
              <span>{user.display_name || user.email}</span>
            </div>
          ) : (
            "Login/Register"
          )}
        </button>
        {isInstallable && (
          <button
            className="btn secondary install-btn"
            onClick={onInstall}
            aria-label="Install App"
          >
            📲 Install
          </button>
        )}
      </div>
    </header>
  );
}
