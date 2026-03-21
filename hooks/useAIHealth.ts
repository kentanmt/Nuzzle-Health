import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface AIHealthBreakdownItem {
  score: number;
  label: string;
}

export interface AIHealthScore {
  overall: number;
  category: 'optimal' | 'watch' | 'elevated';
  change: number;
  summary: string;
  breakdown: {
    bloodwork: AIHealthBreakdownItem;
    weight: AIHealthBreakdownItem;
    preventive_care: AIHealthBreakdownItem;
    age_conditions: AIHealthBreakdownItem;
  };
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  action: string;
  category: 'bloodwork' | 'weight' | 'vaccines' | 'conditions' | 'preventive';
}

export interface AIHealthData {
  health_score: AIHealthScore;
  insights: AIInsight[];
}

export function useAIHealth(isRealPet: boolean, dataReady: boolean) {
  const { user, session } = useAuth();
  const [data, setData] = useState<AIHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetching = useRef(false);
  const hasFetched = useRef(false);

  const fetchAIHealth = useCallback(async () => {
    if (!user || !isRealPet || !dataReady || !session?.access_token) return;
    if (isFetching.current) return;
    if (hasFetched.current && data) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pet-health-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const fnData = await response.json();

      if (!response.ok) {
        const msg = fnData?.error || `HTTP ${response.status}`;
        console.error('AI health error:', msg);
        setError(msg);
        return;
      }

      if (fnData?.error) {
        setError(fnData.error);
        return;
      }

      setData(fnData as AIHealthData);
      hasFetched.current = true;
    } catch (err: any) {
      console.error('AI health fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [user, session, isRealPet, dataReady, data]);

  useEffect(() => {
    fetchAIHealth();
  }, [fetchAIHealth]);

  const refetch = useCallback(async () => {
    hasFetched.current = false;
    await fetchAIHealth();
  }, [fetchAIHealth]);

  return { data, loading, error, refetch };
}
