
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MatchWithAnalysis } from './useMatches';

export const useRealTimeMatches = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch live matches from our edge function
  const fetchRealTimeMatches = async (): Promise<MatchWithAnalysis[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-live-matches');
      
      if (error) {
        console.error('Error calling fetch-live-matches:', error);
        throw error;
      }

      return data?.matches || [];
    } catch (error) {
      console.error('Failed to fetch real-time matches:', error);
      // Fallback to local data if API fails
      const { data: localMatches } = await supabase
        .from('matches')
        .select(`
          *,
          match_analysis(*),
          match_metrics(*)
        `)
        .eq('status', 'live')
        .order('minute', { ascending: false });

      return localMatches as MatchWithAnalysis[] || [];
    }
  };

  const query = useQuery({
    queryKey: ['real-time-matches'],
    queryFn: fetchRealTimeMatches,
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  });

  const refreshMatches = async () => {
    setIsRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    ...query,
    refreshMatches,
    isRefreshing
  };
};
