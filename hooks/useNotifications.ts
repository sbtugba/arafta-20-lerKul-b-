import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useSession } from './useSession';

export type NotificationType = 'post_like' | 'post_comment' | 'comment_like' | 'podcast';

export type AppNotification = {
  id: string;
  type: NotificationType;
  body: string;
  postId: string | null;
  createdAt: string;
  isRead: boolean;
};

type NotificationRow = {
  id: string;
  user_id: string | null;
  type: NotificationType;
  body: string;
  post_id: string | null;
  read_at: string | null;
  created_at: string;
};

// user_id = null olan satırlar herkese yayın (ör. yeni podcast) — RLS zaten
// yalnız "kendi satırların + tüm yayınlar"ı döndürüyor, burada ek filtre yok.
async function fetchNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, type, body, post_id, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50)
    .returns<NotificationRow[]>();
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    body: row.body,
    postId: row.post_id,
    createdAt: row.created_at,
    isRead: row.user_id === null ? true : row.read_at !== null,
  }));
}

export function useNotifications() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: fetchNotifications,
    enabled: !!userId,
  });
}

// Yayın bildirimleri (podcast) rozette sayılmıyor — kişiye özel bildirimler
// gibi "okundu" durumu takip etmiyoruz, herkese sürekli görünür kalmaları
// daha doğru (bkz. schema.sql notifications tablosu notu).
export function useUnreadNotificationCount() {
  const { data } = useNotifications();
  return data?.filter((n) => !n.isRead).length ?? 0;
}

export function useMarkNotificationsRead() {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
}
