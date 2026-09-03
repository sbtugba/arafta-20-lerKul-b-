import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { discover, type } from '../../lib/theme';
import { formatCount } from '../../lib/types';
import { useTrendingTopics, useTodayTopics } from '../../hooks/useTrendingTopics';
import { usePersonalizedTopics } from '../../hooks/usePersonalizedTopics';
import { useTopicFollows } from '../../hooks/useTopicFollows';
import { useSession } from '../../hooks/useSession';
import { useWeeklyPodcast } from '../../hooks/useWeeklyPodcast';
import { TopBar } from '../../components/TopBar';
import { DiscoverSearchBar } from '../../components/DiscoverSearchBar';
import { TagChip } from '../../components/TagChip';
import { TodayTopicRow } from '../../components/TodayTopicRow';
import { PodcastCard } from '../../components/PodcastCard';

function openTopic(tag: string) {
  router.push(`/topic/${encodeURIComponent(tag)}`);
}

function SectionHeading({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function DiscoverScreen() {
  const { userId } = useSession();
  const [query, setQuery] = useState('');

  const { data: allTopics } = useTrendingTopics();
  const { data: today, isLoading: topicsLoading } = useTodayTopics(5);
  const { data: personalized } = usePersonalizedTopics();
  const { data: followed } = useTopicFollows();
  const { data: podcast } = useWeeklyPodcast();

  // useTodayTopics zaten son 24 saatteki paylaşım sayısına göre çoktan aza sıralı.
  const todayTopics = today ?? [];

  const searching = query.trim().length > 0;
  const suggestions = useMemo(() => {
    if (!searching || !allTopics) return [];
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return allTopics.filter((t) => t.tag.toLocaleLowerCase('tr-TR').includes(q)).slice(0, 20);
  }, [searching, query, allTopics]);

  const followedList = followed ? Array.from(followed) : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Şu anda 20&apos;li yaşlarda neler konuşuluyor?</Text>

        <DiscoverSearchBar value={query} onChangeText={setQuery} />

        {searching ? (
          <View style={styles.searchArea}>
            {suggestions.length > 0 ? (
              suggestions.map((s) => (
                <Pressable key={s.tag} style={styles.suggestionRow} onPress={() => openTopic(s.tag)}>
                  <Text style={styles.suggestionTag}>#{s.tag}</Text>
                  <Text style={styles.suggestionCount}>{formatCount(s.count)} paylaşım</Text>
                </Pressable>
              ))
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Bu konu hakkında henüz kimse konuşmamış.</Text>
                <Text style={styles.emptySub}>Belki ilk sen söylersin.</Text>
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/share',
                      params: { tag: query.trim().toLocaleLowerCase('tr-TR').replace(/^#/, '') },
                    })
                  }
                >
                  <Text style={styles.emptyBtnLabel}>Paylaş</Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <SectionHeading title="Bugünün Nabzı" />
              {topicsLoading ? (
                <Text style={styles.loading}>Yükleniyor…</Text>
              ) : todayTopics.length === 0 ? (
                <Text style={styles.loading}>Son 24 saatte henüz paylaşım yok.</Text>
              ) : (
                <View style={styles.risingCard}>
                  {todayTopics.map((t, i) => (
                    <TodayTopicRow
                      key={t.tag}
                      tag={t.tag}
                      count={t.count24h}
                      rank={i + 1}
                      onPress={() => openTopic(t.tag)}
                    />
                  ))}
                </View>
              )}
            </View>

            {userId && personalized && personalized.length > 0 ? (
              <View style={styles.section}>
                <SectionHeading title="Sana göre" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {personalized.map((t) => (
                    <TagChip key={t.tag} tag={t.tag} count={t.count} variant="outline" onPress={() => openTopic(t.tag)} />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {podcast ? (
              <View style={styles.section}>
                <PodcastCard weeklyTopicQuote={podcast.quote} episodeTitle={podcast.episodeTitle} spotifyUrl={podcast.spotifyUrl} />
              </View>
            ) : null}

            {followedList.length > 0 ? (
              <View style={styles.section}>
                <SectionHeading title="Takip ettiklerin" />
                <View style={styles.followedRow}>
                  {followedList.map((tag) => (
                    <Pressable key={tag} style={styles.followedChip} onPress={() => openTopic(tag)}>
                      <Text style={styles.followedLabel}>#{tag}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: discover.cream,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 130,
  },
  heading: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 22,
    lineHeight: 29,
    color: discover.ink,
    marginTop: 6,
    marginBottom: 16,
    maxWidth: '92%',
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontFamily: type.bodyBold,
    fontSize: 16.5,
    color: discover.ink,
    marginBottom: 14,
  },
  loading: {
    fontFamily: type.body,
    fontSize: 13.5,
    color: discover.inkSoft,
  },
  chipRow: {
    gap: 10,
    paddingRight: 4,
  },
  risingCard: {
    backgroundColor: discover.creamSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  followedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  followedChip: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: discover.bordoLight,
  },
  followedLabel: {
    fontFamily: type.bodySemibold,
    fontSize: 13,
    color: discover.bordo,
  },
  searchArea: {
    marginTop: 18,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,37,64,0.1)',
  },
  suggestionTag: {
    fontFamily: type.bodyBold,
    fontSize: 15.5,
    color: discover.bordo,
  },
  suggestionCount: {
    fontFamily: type.body,
    fontSize: 13,
    color: discover.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 18,
    color: discover.ink,
    textAlign: 'center',
    maxWidth: '85%',
  },
  emptySub: {
    fontFamily: type.body,
    fontSize: 14,
    color: discover.inkSoft,
    marginBottom: 14,
  },
  emptyBtn: {
    backgroundColor: discover.bordo,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 26,
  },
  emptyBtnLabel: {
    fontFamily: type.bodyBold,
    fontSize: 14,
    color: discover.cream,
  },
});
