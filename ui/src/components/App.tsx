import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

declare global { interface Window { __fetchStumble?: () => void; } }

interface StumbleResult {
  id: number;
  url: string;
  title?: string;
}

const API_BASE = 'http://localhost:3000';
const MOCK_MODE = true; // keep mock mode enabled for testing

const MOCK_URLS = [
  'https://www.producthunt.com',   // blocked by X-Frame-Options
  'https://en.wikipedia.org/wiki/Special:Random',
  'https://www.boredpanda.com',
  'https://www.thisiscolossal.com',
  'https://www.atlasobscura.com',
];

export default function App() {
  const [current, setCurrent] = useState<StumbleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [rating, setRating] = useState<'like' | 'dislike' | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const iframeLoadedRef = useRef(false);
  const iframeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIframeTimeout = useCallback(() => {
    if (iframeTimeoutRef.current) {
      clearTimeout(iframeTimeoutRef.current);
      iframeTimeoutRef.current = null;
    }
  }, []);

  const startIframeTimeout = useCallback(() => {
    clearIframeTimeout();
    iframeTimeoutRef.current = setTimeout(() => {
      if (!iframeLoadedRef.current) {
        setIframeError(true);
      }
    }, 5000);
  }, [clearIframeTimeout]);
const fetchStumble = useCallback(async () => {
  setLoading(true);
  setError(null);
  setShowIframe(false);
  setIframeError(false);
  setIframeLoading(true);
  setRating(null);
  iframeLoadedRef.current = false;
  clearIframeTimeout();

  try {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const randomUrl = MOCK_URLS[Math.floor(Math.random() * MOCK_URLS.length)];
      setCurrent({ id: Date.now(), url: randomUrl });
    } else {
      const res = await fetch(`${API_BASE}/api/v1/stumble`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: StumbleResult = await res.json();
      setCurrent(data);
    }
    setShowIframe(true);
    startIframeTimeout(); // start timeout only after showing iframe
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Something went wrong');
  } finally {
    setLoading(false);
  }
}, [clearIframeTimeout, startIframeTimeout]);

// Expose fetchStumble for testing
useEffect(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__fetchStumble = fetchStumble;
}, [fetchStumble]);


  const handleClose = () => {
    setShowIframe(false);
    setIframeError(false);
    clearIframeTimeout();
    iframeLoadedRef.current = false;
  };

  const handleRate = async (type: 'like' | 'dislike') => {
    if (!current) return;
    setRateLoading(true);
    try {
      if (!MOCK_MODE) {
        await fetch(`${API_BASE}/api/v1/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: current.id, rating: type }),
        });
      }
      setRating(type);
    } catch (err) {
      console.error('Rating failed', err);
    } finally {
      setRateLoading(false);
    }
  };

  const handleNext = () => {
    fetchStumble();
  };

  const handleIframeLoad = () => {
    iframeLoadedRef.current = true;
    clearIframeTimeout();
    setIframeError(false);
  };

  const handleIframeError = () => {
    // This only catches network errors, but we'll still set iframeError
    setIframeError(true);
    clearIframeTimeout();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearIframeTimeout();
  }, [clearIframeTimeout]);

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">StumbleClone</h1>
        <p className="tagline">Discover the web, one page at a time</p>
      </header>

      <main className="main-content">
        {!showIframe && !loading && (
          <div className="empty-state">
            <p>Click <strong>Stumble</strong> to discover something new</p>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Finding something interesting...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button onClick={fetchStumble}>Try Again</button>
          </div>
        )}

        {showIframe && current && !iframeError && (
          <div className="iframe-container">
            <div className="iframe-header">
              <span className="iframe-title">{current.title || current.url}</span>
              <button className="close-btn" onClick={handleClose} aria-label="Close iframe">
                ✖
              </button>
            </div>
            <iframe
              src={current.url}
              title="Stumbled page"
              className="iframe"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        )}

        {showIframe && iframeError && (
          <div className="iframe-fallback">
            <p>This page can't be embedded.</p>
            <a href={current?.url} target="_blank" rel="noopener noreferrer">
              Open in new tab ↗
            </a>
            <button className="close-btn" onClick={handleClose}>Close</button>
          </div>
        )}

        <div className="controls">
          {!current || !showIframe ? (
            <button
              className="btn primary stumble-btn"
              onClick={fetchStumble}
              disabled={loading}
            >
              {loading ? 'Stumbling...' : '🎲 Stumble'}
            </button>
          ) : (
            <div className="action-bar">
              <div className="rating-group">
                <button
                  className={`btn rate-btn ${rating === 'like' ? 'active' : ''}`}
                  onClick={() => handleRate('like')}
                  disabled={rateLoading || rating !== null}
                  aria-label="Like"
                >
                  👍
                </button>
                <button
                  className={`btn rate-btn ${rating === 'dislike' ? 'active' : ''}`}
                  onClick={() => handleRate('dislike')}
                  disabled={rateLoading || rating !== null}
                  aria-label="Dislike"
                >
                  👎
                </button>
              </div>
              <button
                className="btn secondary next-btn"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? '...' : '➡️ Next Stumble'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
