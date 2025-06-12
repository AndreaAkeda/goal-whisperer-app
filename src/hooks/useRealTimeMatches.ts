
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MatchWithAnalysis } from './useMatches';

export const useRealTimeMatches = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch live matches from our edge function
  const fetchRealTimeMatches = async (): Promise<MatchWithAnalysis[]> => {
    console.log('🔄 Buscando jogos ao vivo...');
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-live-matches');
      
      console.log('📡 Resposta da função:', data);
      
      if (error) {
        console.error('❌ Erro ao chamar fetch-live-matches:', error);
        throw error;
      }

      // Log da metadata para debug
      if (data?.meta) {
        console.log('📊 Meta dados:', data.meta);
        console.log('🔑 API key configurada:', data.meta.api_key_configured);
        console.log('⚽ Jogos da API:', data.meta.api_matches);
        console.log('🎯 Jogos demo:', data.meta.demo_matches);
        
        if (data.meta.api_error) {
          console.error('❌ Erro da API:', data.meta.api_error);
        }
      }

      return data?.matches || [];
    } catch (error) {
      console.error('❌ Falha ao buscar jogos em tempo real:', error);
      
      // Fallback to local data if API fails
      console.log('🔄 Usando dados locais como fallback...');
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
    console.log('🔄 Atualizando jogos manualmente...');
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
