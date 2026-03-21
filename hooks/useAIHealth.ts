import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  const fetchAIHealth = useCallback(async () => {
    if (!user || !isRealPet || !dataReady || !session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('pet-health-ai', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) {
        console.error('AI health error:', fnError);
        setError(fnError.message);
        return;
      }

      if (fnData?.error) {
        setError(fnData.error);
        return;
      }

      setData(fnData as AIHealthData);
    } catch (err: any) {
      console.error('AI health fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isRealPet, dataReady]);

  useEffect(() => {
    fetchAIHealth();
  }, [fetchAIHealth]);

  return { data, loading, error, refetch: fetchAIHealth };
}
