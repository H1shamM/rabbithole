import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders initial empty state with Stumble button', () => {
    render(<App />);
    expect(screen.getByText(/Click/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🎲 Stumble/i })).toBeInTheDocument();
  });

  it('liking updates history and localStorage', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 123, url: 'https://example.com', title: 'Test' })
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /🎲 Stumble/i }));
    
    const main = screen.getByRole('main');
    await waitFor(() => expect(within(main).getByRole('button', { name: 'Like' })).toBeInTheDocument());
    fireEvent.click(within(main).getByRole('button', { name: 'Like' }));
    
    await waitFor(() => {
        const history = localStorage.getItem('stumbleclone_ratings_history');
        expect(history).not.toBeNull();
        expect(JSON.parse(history!)).toHaveLength(1);
    });
    
    // Toggle history
    fireEvent.click(screen.getByRole('button', { name: /History/i }));
    const panel = screen.getByTestId('history-panel');
    expect(within(panel).getByText('👍')).toBeInTheDocument();
  });

  it('favorites toggle works', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 123, url: 'https://example.com', title: 'Test' })
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /🎲 Stumble/i }));
    
    const main = screen.getByRole('main');
    await waitFor(() => expect(within(main).getByRole('button', { name: 'Save to favorites' })).toBeInTheDocument());
    const favBtn = within(main).getByRole('button', { name: 'Save to favorites' });
    
    fireEvent.click(favBtn);
    expect(favBtn.textContent).toBe('⭐');
    
    const favs = localStorage.getItem('stumbleclone_favorites');
    expect(favs).not.toBeNull();
    expect(JSON.parse(favs!)).toHaveLength(1);
  });

  it('dark mode toggles theme and persists', () => {
    render(<App />);
    const header = screen.getByRole('banner');
    const toggle = within(header).getByRole('button', { name: 'Toggle theme' });
    
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
