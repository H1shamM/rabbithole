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
    expect(screen.getByText(/Click Stumble/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stumble/i })).toBeInTheDocument();
  });

  it('liking updates history and localStorage', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Stumble/i }));
    
    // Find like button by aria-label name directly
    const main = screen.getByRole('main');
    await waitFor(() => expect(within(main).getByRole('button', { name: 'Like' })).toBeInTheDocument());
    fireEvent.click(within(main).getByRole('button', { name: 'Like' }));
    
    expect(localStorage.getItem('stumbleclone_ratings_history')).toContain('like');
    
    fireEvent.click(screen.getByRole('button', { name: /View History/i }));
    const panel = screen.getByText(/View History/i).parentElement?.nextElementSibling;
    expect(within(panel!).getByText('👍')).toBeInTheDocument();
  });

  it('favorites toggle works', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Stumble/i }));
    
    const main = screen.getByRole('main');
    await waitFor(() => expect(within(main).getByRole('button', { name: 'Save to favorites' })).toBeInTheDocument());
    const favBtn = within(main).getByRole('button', { name: 'Save to favorites' });
    
    fireEvent.click(favBtn);
    expect(favBtn.textContent).toBe('⭐');
    expect(localStorage.getItem('stumbleclone_favorites')).not.toBeNull();
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
