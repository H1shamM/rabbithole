// ui/src/components/AuthModal.tsx
import React from "react";

interface AuthModalProps {
  isOpen: boolean;
  email: string;
  password: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogin: () => void;
  onRegister: () => void;
  onClose: () => void;
  apiBase: string;
}

export function AuthModal({
  isOpen,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onRegister,
  onClose,
  apiBase,
}: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="auth-modal">
      <div className="auth-content">
        <h2>Login / Register</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={onEmailChange}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={onPasswordChange}
        />
        <button className="btn primary" onClick={onLogin}>
          Login
        </button>
        <button className="btn secondary" onClick={onRegister}>
          Register
        </button>
        <div className="divider">
          <span>OR</span>
        </div>
        <a href={`${apiBase}/auth/google`} className="btn oauth-btn google-btn">
          Login with Google
        </a>
        <a href={`${apiBase}/auth/github`} className="btn oauth-btn github-btn">
          Login with GitHub
        </a>
        <button className="btn secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
