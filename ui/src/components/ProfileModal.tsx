// ui/src/components/ProfileModal.tsx
import React from "react";

interface ProfileModalProps {
  isOpen: boolean;
  user: {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
  } | null;
  historyCount: number;
  favoritesCount: number;
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileModal({
  isOpen,
  user,
  historyCount,
  favoritesCount,
  onClose,
  onLogout,
}: ProfileModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="profile-modal">
      <div className="profile-content">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <div className="profile-header">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="avatar-large" />
          ) : (
            <div className="avatar-placeholder">
              {user.email[0].toUpperCase()}
            </div>
          )}
          <h2>{user.display_name || "Stumbler"}</h2>
          <p className="profile-email">{user.email}</p>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{historyCount}</span>
            <span className="stat-label">Stumbles</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{favoritesCount}</span>
            <span className="stat-label">Favorites</span>
          </div>
        </div>
        <button className="btn secondary logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
