import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Post } from '../lib/types';
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

  const { data, error } = await query.returns<PostRow[]>();
  if (error) throw error;
  if (!data || data.length === 0) return [];

  // posts.author_id -> auth.users FK'si üzerinden geliyor, PostgREST embed
  // profiles'a doğrudan bağlanamıyor; isimleri ayrı adımda çekiyoruz (bkz. useBlockedUsers.ts).
  const namedAuthorIds = [...new Set(data.filter((p) => !p.is_anonymous).map((p) => p.author_id))];
  let namesById = new Map<string, string | null>();
  if (namedAuthorIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', namedAuthorIds);
    if (profilesError) throw profilesError;
    namesById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
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

  let authorDisplayName: string | null = null;
  if (!data.is_anonymous) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', data.author_id)
      .maybeSingle<{ display_name: string | null }>();
    if (profileError) throw profileError;
    authorDisplayName = profile?.display_name ?? null;
  }

  let hasReacted = false;
  if (userId) {
    const { data: reaction, error: reactErr } = await supabase
      .from('reactions')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    if (reactErr) throw reactErr;
    hasReacted = !!reaction;
  }

  return {
    id: data.id,
    authorId: data.author_id,
    isAnonymous: data.is_anonymous,
    authorDisplayName,
    body: data.body,
    tags: data.tags ?? [],
    reactionCount: data.reaction_count,
    commentCount: data.comment_count,
    createdAt: data.created_at,
    hasReacted,
  };
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
      const previous = queryClient.getQueriesData<Post[]>({ queryKey: ['posts'] });

      queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (old) =>
        old?.map((post) =>
          post.id === postId
            ? {
                ...post,
                hasReacted: !hasReacted,
                reactionCount: post.reactionCount + (hasReacted ? -1 : 1),
              }
            : post
        )
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
}
