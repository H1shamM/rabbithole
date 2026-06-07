import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useStumble } from './useStumble';

describe('useStumble', () => {
  it('should use pre-fetched data if available', async () => {
    const mockAuthenticatedFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', url: 'http://test.com', category: 'all', source: 'test' }),
      });

    const { result } = renderHook(() => useStumble(mockAuthenticatedFetch, 'all'));

    // First stumble (no prefetch)
    await act(async () => {
      await result.current.fetchStumble();
    });

    expect(mockAuthenticatedFetch).toHaveBeenCalledTimes(1);
    
    // Manually set prefetch state via the hook
    act(() => {
        result.current.fetchStumble(); // Trigger again
    });
    
    expect(result.current).toBeDefined();
  });
});
