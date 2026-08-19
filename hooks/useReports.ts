import { useMutation } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useSession } from './useSession';

export function useSubmitReport() {
  const { userId } = useSession();

  return useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      const { error } = await supabase.from('reports').insert({ reporter_id: userId, post_id: postId, reason });
      if (error) throw error;
    },
  });
}

export function useSubmitCommentReport() {
  const { userId } = useSession();

  return useMutation({
    mutationFn: async ({ commentId, reason }: { commentId: string; reason: string }) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      const { error } = await supabase.from('reports').insert({ reporter_id: userId, comment_id: commentId, reason });
      if (error) throw error;
    },
  });
}
