import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';

export type TrendingTopic = {
  tag: string;
  count: number;
  sampleQuote: string;
};

// MVP: son paylaşımlar üstünden istemci tarafında sayım. Ölçek büyüdüğünde
// bunun yerini bir Postgres view/RPC (ör. tags üstünde unnest + count) alabilir.
async function fetchTrendingTopics(): Promise<TrendingTopic[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('tags, body, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  const byTag = new Map<string, { count: number; sampleQuote: string }>();
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      const existing = byTag.get(tag);
      if (existing) {
        existing.count += 1;
      } else {
        byTag.set(tag, { count: 1, sampleQuote: row.body });
      }
    }
  }

  return Array.from(byTag.entries())
    .map(([tag, v]) => ({ tag, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

export function useTrendingTopics() {
  return useQuery({ queryKey: ['trending-topics'], queryFn: fetchTrendingTopics });
}
