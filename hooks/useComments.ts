import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Comment } from '../lib/types';
import { fetchBlockedIds } from './useBlockedUsers';
import { useSession } from './useSession';

type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  is_anonymous: boolean;
  body: string;
  created_at: string;
  like_count: number;
};

function nest(flat: Comment[]): Comment[] {
  const byId = new Map(flat.map((c) => [c.id, c]));
  const roots: Comment[] = [];
  for (const c of flat) {
    if (c.parentCommentId && byId.has(c.parentCommentId)) {
      byId.get(c.parentCommentId)!.replies.push(c);
    } else {
      roots.push(c);
    }
  }
  return roots;
}

async function fetchComments(postId: string, userId: string | null): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, author_id, parent_comment_id, is_anonymous, body, created_at, like_count')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .returns<CommentRow[]>();
  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Engellenen kullanıcıların isimli yorumlarını süz (anonimde kimlik yok, süzülemez).
  const blockedIds = await fetchBlockedIds(userId);
  const rows = blockedIds.size ? data.filter((c) => c.is_anonymous || !blockedIds.has(c.author_id)) : data;
  if (rows.length === 0) return [];

  // comments.author_id -> auth.users FK'si üzerinden geliyor, PostgREST embed
  // profiles'a doğrudan bağlanamıyor; isimleri ve avatarları ayrı adımda çekiyoruz (bkz. usePosts.ts).
  const namedAuthorIds = [...new Set(rows.filter((c) => !c.is_anonymous).map((c) => c.author_id))];
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

  let likedIds = new Set<string>();
  if (userId) {
    const { data: myLikes, error: likesError } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', userId)
      .in('comment_id', rows.map((c) => c.id));
    if (likesError) throw likesError;
    likedIds = new Set((myLikes ?? []).map((l) => l.comment_id));
  }

  const flat: Comment[] = rows.map((row) => ({
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    parentCommentId: row.parent_comment_id,
    isAnonymous: row.is_anonymous,
    authorDisplayName: row.is_anonymous ? null : (namesById.get(row.author_id) ?? null),
    authorUsername: row.is_anonymous ? null : (usernamesById.get(row.author_id) ?? null),
    authorAvatarUrl: row.is_anonymous ? null : (avatarsById.get(row.author_id) ?? null),
    body: row.body,
    createdAt: row.created_at,
    likeCount: row.like_count,
    hasLiked: likedIds.has(row.id),
    isMine: row.author_id === userId,
    replies: [],
  }));

  return nest(flat);
}

export function useComments(postId: string) {
  const { userId } = useSession();
  return useQuery({
    queryKey: ['comments', postId, userId],
    queryFn: () => fetchComments(postId, userId),
    enabled: !!postId,
  });
}

export function useCreateComment(postId: string) {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ body, parentCommentId }: { body: string; parentCommentId?: string | null }) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: userId,
        is_anonymous: false,
        body,
        parent_comment_id: parentCommentId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

export function useDeleteComment(postId: string) {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('author_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

export function useToggleCommentLike(postId: string) {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, hasLiked }: { commentId: string; hasLiked: boolean }) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      if (hasLiked) {
        const { error } = await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId });
        if (error) throw error;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}
