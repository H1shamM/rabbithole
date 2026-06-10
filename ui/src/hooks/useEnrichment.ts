import { useState, useEffect } from "react";

export interface EnrichmentResult {
  summary: string;
  keyPoints: string[];
  image: string | null;
  provenance: string;
  sourceUrl: string;
}

export function useEnrichment(
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
  url: string | null
) {
  const [data, setData] = useState<EnrichmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    authenticatedFetch(`/reader/enrich?url=${encodeURIComponent(url)}`)
      .then(async (res) => {
        if (!active) return;
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError("Enrichment unavailable");
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Network error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authenticatedFetch, url]);

  return { data, loading, error };
}
