import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock IntersectionObserver
class IntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor() {}
}

vi.stubGlobal("IntersectionObserver", IntersectionObserver);

// Mock matchMedia
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
