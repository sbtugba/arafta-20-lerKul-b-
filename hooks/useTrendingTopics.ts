import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';

export type TrendingTopic = {
  tag: string;
  count: number;
  count24h: number;
  sampleQuote: string;
  changePercent: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// MVP: son paylaşımlar üstünden istemci tarafında sayım. Ölçek büyüdüğünde
// bunun yerini bir Postgres view/RPC (ör. tags üstünde unnest + count) alabilir.
// changePercent: bu haftaki paylaşım sayısını bir önceki haftayla kıyaslıyor —
// gerçek yükseliş/düşüş sinyali, uydurma bir sayı değil.
async function fetchTrendingTopics(): Promise<TrendingTopic[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('tags, body, created_at')
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;

  const now = Date.now();
  const byTag = new Map<string, { count: number; count24h: number; sampleQuote: string; thisWeek: number; lastWeek: number }>();

  for (const row of data ?? []) {
    const age = now - new Date(row.created_at).getTime();
    for (const tag of row.tags ?? []) {
      const existing = byTag.get(tag) ?? { count: 0, count24h: 0, sampleQuote: row.body, thisWeek: 0, lastWeek: 0 };
      existing.count += 1;
      if (age <= DAY_MS) existing.count24h += 1;
      if (age <= WEEK_MS) existing.thisWeek += 1;
      else if (age <= WEEK_MS * 2) existing.lastWeek += 1;
      byTag.set(tag, existing);
    }
  }

  return Array.from(byTag.entries())
    .map(([tag, v]) => ({
      tag,
      count: v.count,
      count24h: v.count24h,
      sampleQuote: v.sampleQuote,
      changePercent: v.lastWeek > 0 ? Math.round(((v.thisWeek - v.lastWeek) / v.lastWeek) * 100) : v.thisWeek > 0 ? 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// Ekranın farklı bölümleri (Bugün neler konuşuluyor / arama) aynı 300 paylaşımlık
// örneklemden türüyor — tek sorgu, farklı filtre/sıralama.
export function useTrendingTopics() {
  return useQuery({ queryKey: ['trending-topics'], queryFn: fetchTrendingTopics });
}

// "Bugün neler konuşuluyor?" — yalnızca son 24 saatte en az bir paylaşım almış
// hashtag'ler, en çok paylaşımdan en aza doğru sıralı.
export function useTodayTopics(limit = 12) {
  const { data, ...rest } = useTrendingTopics();
  const today = data
    ?.filter((t) => t.count24h > 0)
    .sort((a, b) => b.count24h - a.count24h)
    .slice(0, limit);
  return { ...rest, data: today };
}
