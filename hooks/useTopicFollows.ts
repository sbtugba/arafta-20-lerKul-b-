import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useSession } from './useSession';

export function useTopicFollows() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ['topic-follows', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('topic_follows').select('topic').eq('user_id', userId as string);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.topic));
    },
  });
}

export function useToggleTopicFollow() {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topic, following }: { topic: string; following: boolean }) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      if (following) {
        const { error } = await supabase.from('topic_follows').delete().eq('user_id', userId).eq('topic', topic);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('topic_follows').insert({ user_id: userId, topic });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-follows', userId] });
    },
  });
}
