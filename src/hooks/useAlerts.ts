
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Alert = Tables<'alerts'>;

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useUnreadAlerts = () => {
  return useQuery({
    queryKey: ['alerts', 'unread'],
    queryFn: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertData: TablesInsert<'alerts'>) => {
      const { data, error } = await supabase
        .from('alerts')
        .insert(alertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};
