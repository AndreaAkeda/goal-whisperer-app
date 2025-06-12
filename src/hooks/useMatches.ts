
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Match = Tables<'matches'>;
export type MatchWithAnalysis = Match & {
  match_analysis: Tables<'match_analysis'>[];
  match_metrics: Tables<'match_metrics'>[];
};

export const useMatches = () => {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async (): Promise<MatchWithAnalysis[]> => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_analysis(*),
          match_metrics(*)
        `)
        .order('kickoff_time', { ascending: true });

      if (error) throw error;
      return data as MatchWithAnalysis[];
    },
  });
};

export const useLiveMatches = () => {
  return useQuery({
    queryKey: ['matches', 'live'],
    queryFn: async (): Promise<MatchWithAnalysis[]> => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_analysis(*),
          match_metrics(*)
        `)
        .eq('status', 'live')
        .order('minute', { ascending: false });

      if (error) throw error;
      return data as MatchWithAnalysis[];
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};

export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchData: TablesInsert<'matches'>) => {
      const { data, error } = await supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useUpdateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'matches'> & { id: string }) => {
      const { data, error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};
