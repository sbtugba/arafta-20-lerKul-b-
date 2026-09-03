import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { WEEKLY_PODCAST } from '../lib/podcast';

export type WeeklyPodcast = {
  quote: string;
  episodeTitle: string;
  spotifyUrl: string;
};

// weekly_podcast tablosuna yazmak, kod deploy etmeden yeni bölümü yayınlamanın
// yolu — Supabase Table Editor'den bir satır eklenir, uygulama en son satırı
// çeker. Tablo henüz boşsa (ör. ilk kurulum) lib/podcast.ts'teki sabit
// içeriğe düşer, kart hiç boş görünmez.
async function fetchWeeklyPodcast(): Promise<WeeklyPodcast> {
  const { data, error } = await supabase
    .from('weekly_podcast')
    .select('quote, episode_title, spotify_url')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return WEEKLY_PODCAST;

  return {
    quote: data.quote,
    episodeTitle: data.episode_title,
    spotifyUrl: data.spotify_url,
  };
}

export function useWeeklyPodcast() {
  return useQuery({ queryKey: ['weekly-podcast'], queryFn: fetchWeeklyPodcast });
}
