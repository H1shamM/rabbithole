/**
 * @fileoverview Test setup file for Vitest and Testing Library.
 */

import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

/**
 * Extend Vitest's expect with jest-dom matchers.
 */
expect.extend(matchers);
