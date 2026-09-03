import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useSession } from './useSession';
import { useTopicFollows } from './useTopicFollows';

export type PersonalizedTopic = { tag: string; count: number };

// "Sana göre": takip ettiği konular + "bende de öyle" dediği paylaşımların
// etiketleri. reactions.post_id -> posts FK'si var ama codebase'in geri
// kalanı (bkz. usePosts.ts, useComments.ts) auth.users'a değen embed'lerden
// kaçınıp iki adımlı sorgu kullanıyor — burada da aynı tutarlılığı koruyoruz.
async function fetchPersonalizedTopics(userId: string, followed: Set<string>): Promise<PersonalizedTopic[]> {
  const counts = new Map<string, number>();
  for (const tag of followed) counts.set(tag, (counts.get(tag) ?? 0) + 25);

  const { data: myReactions, error: reactErr } = await supabase
    .from('reactions')
    .select('post_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(60);
  if (reactErr) throw reactErr;

  const postIds = (myReactions ?? []).map((r) => r.post_id);
  if (postIds.length > 0) {
    const { data: posts, error: postsErr } = await supabase.from('posts').select('tags').in('id', postIds);
    if (postsErr) throw postsErr;
    for (const row of posts ?? []) {
      for (const tag of row.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function usePersonalizedTopics() {
  const { userId } = useSession();
  const { data: followed } = useTopicFollows();

  return useQuery({
    queryKey: ['personalized-topics', userId, followed ? Array.from(followed).sort().join(',') : ''],
    enabled: !!userId && !!followed,
    queryFn: () => fetchPersonalizedTopics(userId as string, followed ?? new Set()),
  });
}
