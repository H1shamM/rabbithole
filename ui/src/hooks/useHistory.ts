// ui/src/hooks/useHistory.ts
import { useState, useEffect, useCallback } from 'react';

interface RatedItem {
  id: string;
  url: string;
  title?: string;
  rating_val: 'like' | 'dislike';
  timestamp: Date;
}

const safeJson = async (res: Response) => {
  const text = await res.text();
  if (!text || text.trim() === '') return null;
  try {
    return JSON.parse(text);
  } catch {
    console.warn('Invalid JSON in history:', text.slice(0, 200));
    return null;
  }
};

export function useHistory(authenticatedFetch: any) {
  const [history, setHistory] = useState<RatedItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const res = await authenticatedFetch('/history?limit=20');
      if (res.ok) {
        const data = await safeJson(res);
        setHistory(Array.isArray(data) ? data : []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to load history', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { history, showHistory, setShowHistory, loadHistory, loading };
}