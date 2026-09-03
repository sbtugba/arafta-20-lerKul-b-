import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Post } from '../lib/types';
import { fetchBlockedIds } from './useBlockedUsers';
import { useSession } from './useSession';

type PostRow = {
  id: string;
  author_id: string;
  is_anonymous: boolean;
  body: string;
  tags: string[];
  reaction_count: number;
  comment_count: number;
  created_at: string;
};

async function fetchPosts(userId: string | null, topic?: string): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select('id, author_id, is_anonymous, body, tags, reaction_count, comment_count, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (topic) query = query.contains('tags', [topic]);

  const { data: rawData, error } = await query.returns<PostRow[]>();
  if (error) throw error;
  if (!rawData || rawData.length === 0) return [];

  // Engellenen kullanıcıların isimli paylaşımlarını süz (anonimde kimlik yok, süzülemez).
  const blockedIds = await fetchBlockedIds(userId);
  const data = blockedIds.size
    ? rawData.filter((p) => p.is_anonymous || !blockedIds.has(p.author_id))
    : rawData;
  if (data.length === 0) return [];

  // posts.author_id -> auth.users FK'si üzerinden geliyor, PostgREST embed
  // profiles'a doğrudan bağlanamıyor; isimleri ve avatarları ayrı adımda çekiyoruz (bkz. useBlockedUsers.ts).
  const namedAuthorIds = [...new Set(data.filter((p) => !p.is_anonymous).map((p) => p.author_id))];
  let namesById = new Map<string, string | null>();
  let usernamesById = new Map<string, string | null>();
  let avatarsById = new Map<string, string | null>();
  if (namedAuthorIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', namedAuthorIds);
    if (profilesError) throw profilesError;
    namesById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
    usernamesById = new Map((profiles ?? []).map((p) => [p.id, p.username]));
    avatarsById = new Map((profiles ?? []).map((p) => [p.id, p.avatar_url]));
  }

  let reactedIds = new Set<string>();
  if (userId) {
    const { data: myReactions, error: reactErr } = await supabase
      .from('reactions')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', data.map((p) => p.id));
    if (reactErr) throw reactErr;
    reactedIds = new Set((myReactions ?? []).map((r) => r.post_id));
  }

  return data.map((row) => ({
    id: row.id,
    authorId: row.author_id,
    isAnonymous: row.is_anonymous,
    authorDisplayName: row.is_anonymous ? null : (namesById.get(row.author_id) ?? null),
    authorUsername: row.is_anonymous ? null : (usernamesById.get(row.author_id) ?? null),
    authorAvatarUrl: row.is_anonymous ? null : (avatarsById.get(row.author_id) ?? null),
    body: row.body,
    tags: row.tags ?? [],
    reactionCount: row.reaction_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    hasReacted: reactedIds.has(row.id),
  }));
}

export function usePosts(topic?: string) {
  const { userId } = useSession();
  return useQuery({
    queryKey: ['posts', topic ?? null, userId],
    queryFn: () => fetchPosts(userId, topic),
  });
}

async function fetchPost(postId: string, userId: string | null): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, author_id, is_anonymous, body, tags, reaction_count, comment_count, created_at')
    .eq('id', postId)
    .maybeSingle<PostRow>();
  if (error) throw error;
  if (!data) return null;

  // Yazar profili ve beğeni durumu birbirinden bağımsız — art arda değil,
  // paralel çekiyoruz (art arda çekmek gönderi metninin ~1sn geç görünmesine sebep oluyordu).
  const [profileResult, reactionResult] = await Promise.all([
    data.is_anonymous
      ? Promise.resolve(null)
      : supabase
          .from('profiles')
          .select('display_name, username, avatar_url')
          .eq('id', data.author_id)
          .maybeSingle<{ display_name: string | null; username: string | null; avatar_url: string | null }>(),
    userId
      ? supabase.from('reactions').select('post_id').eq('post_id', postId).eq('user_id', userId).maybeSingle()
      : Promise.resolve(null),
  ]);

  if (profileResult?.error) throw profileResult.error;
  if (reactionResult?.error) throw reactionResult.error;

  const authorDisplayName = profileResult?.data?.display_name ?? null;
  const authorUsername = profileResult?.data?.username ?? null;
  const authorAvatarUrl = profileResult?.data?.avatar_url ?? null;
  const hasReacted = !!reactionResult?.data;

  return {
    id: data.id,
    authorId: data.author_id,
    isAnonymous: data.is_anonymous,
    authorDisplayName,
    authorUsername,
    authorAvatarUrl,
    body: data.body,
    tags: data.tags ?? [],
    reactionCount: data.reaction_count,
    commentCount: data.comment_count,
    createdAt: data.created_at,
    hasReacted,
  };
}

// Trend hesaplarındaki 300 paylaşımlık örneklemden farklı olarak, hashtag detay
// başlığındaki sayı ("12.4K paylaşım") o etikete sahip TÜM paylaşımları sayar.
export function useTopicPostCount(topic: string) {
  return useQuery({
    queryKey: ['topic-post-count', topic],
    enabled: !!topic,
    queryFn: async () => {
      const { count, error } = await supabase.from('posts').select('id', { count: 'exact', head: true }).contains('tags', [topic]);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function usePost(postId: string) {
  const { userId } = useSession();
  return useQuery({
    queryKey: ['post', postId, userId],
    queryFn: () => fetchPost(postId, userId),
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ body, tags, isAnonymous }: { body: string; tags: string[]; isAnonymous: boolean }) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      const { error } = await supabase.from('posts').insert({
        author_id: userId,
        is_anonymous: isAnonymous,
        body,
        tags,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useToggleReaction() {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, hasReacted }: { postId: string; hasReacted: boolean }) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      if (hasReacted) {
        const { error } = await supabase.from('reactions').delete().eq('post_id', postId).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('reactions').insert({ post_id: postId, user_id: userId });
        if (error) throw error;
      }
    },
    onMutate: async ({ postId, hasReacted }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      const previousList = queryClient.getQueriesData<Post[]>({ queryKey: ['posts'] });
      const previousSingle = queryClient.getQueriesData<Post | null>({ queryKey: ['post', postId] });

      const applyToggle = (post: Post): Post => ({
        ...post,
        hasReacted: !hasReacted,
        reactionCount: post.reactionCount + (hasReacted ? -1 : 1),
      });

      queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (old) =>
        old?.map((post) => (post.id === postId ? applyToggle(post) : post))
      );
      queryClient.setQueriesData<Post | null>({ queryKey: ['post', postId] }, (old) => (old ? applyToggle(old) : old));

      return { previous: [...previousList, ...previousSingle] };
    },
    onError: (_err, _vars, context) => {
      // optimistic güncelleme yanlış çıktıysa tam olarak eski haline dönüyoruz —
      // bu yüzden başarı durumunda sunucudan tekrar çekmeye gerek yok (bkz. aşağıdaki not).
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    // Kasıtlı olarak burada invalidateQueries YOK: optimistic update zaten doğru
    // sonucu veriyor, hemen ağdan tekrar çekmek Akış'ta gereksiz bir "yeniden
    // yükleniyor" (RefreshControl döngüsü) hissi yaratıyordu. Veri bir sonraki
    // doğal yenilemede (ekrana odaklanma, pull-to-refresh) zaten tazelenir.
  });
}
