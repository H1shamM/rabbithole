/**
 * @fileoverview Test setup file for Vitest and Testing Library.
 */

import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

/**
 * Extend Vitest's expect with jest-dom matchers.
 */
expect.extend(matchers);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
