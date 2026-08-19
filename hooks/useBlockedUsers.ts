import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { BlockedUser } from '../lib/types';
import { useSession } from './useSession';

export function useBlockedUsers() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ['blocked-users', userId],
    enabled: !!userId,
    queryFn: async (): Promise<BlockedUser[]> => {
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', userId as string)
        .order('created_at', { ascending: false });
      if (blocksError) throw blocksError;
      if (!blocks || blocks.length === 0) return [];

      // blocks -> auth.users FK'si üzerinden geliyor, profiles lazily oluşturulduğu için
      // PostgREST embed yerine iki adımda çekiyoruz (engellenen kişinin profili hiç
      // açılmamış olabilir).
      const ids = blocks.map((b) => b.blocked_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .in('id', ids);
      if (profilesError) throw profilesError;

      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
      return ids.map((id) => {
        const p = byId.get(id);
        return { id, displayName: p?.display_name ?? null, username: p?.username ?? null, avatarUrl: p?.avatar_url ?? null };
      });
    },
  });
}

export function useBlockUser() {
  const { userId } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockedId: string) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      const { error } = await supabase.from('blocks').insert({ blocker_id: userId, blocked_id: blockedId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-users', userId] }),
  });
}

export function useUnblockUser() {
  const { userId } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockedId: string) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      const { error } = await supabase.from('blocks').delete().eq('blocker_id', userId).eq('blocked_id', blockedId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-users', userId] }),
  });
}
