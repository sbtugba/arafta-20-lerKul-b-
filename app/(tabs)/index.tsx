import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { colors, type } from '../../lib/theme';
import { usePosts, useToggleReaction } from '../../hooks/usePosts';
import { useWeeklyPodcast } from '../../hooks/useWeeklyPodcast';
import { PostCard } from '../../components/PostCard';
import { PodcastCard } from '../../components/PodcastCard';
import { TopBar } from '../../components/TopBar';
import { CloseIcon } from '../../components/icons';

export default function FeedScreen() {
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const { data: posts, isLoading, isFetching, refetch } = usePosts(topic);
  const toggleReaction = useToggleReaction();
  const { data: podcast } = useWeeklyPodcast();

  const listData = posts ?? [];

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar scrollY={scrollY} />
      <Animated.FlatList
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        data={listData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.bordo} />}
        ListHeaderComponent={
          <View>
            {topic ? (
              <Pressable style={styles.filterChip} onPress={() => router.setParams({ topic: undefined })}>
                <Text style={styles.filterLabel}>#{topic}</Text>
                <View style={styles.filterClose}>
                  <CloseIcon size={10} color={colors.cream} />
                </View>
              </Pressable>
            ) : null}
            <Text style={styles.eyebrow}>BUGÜN ARAFTA</Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty}>
              {topic ? 'Bu konuda henüz paylaşım yok.' : 'Henüz paylaşım yok — ilk "arafta anını" sen bırak.'}
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <>
            <PostCard post={item} onToggleReaction={() => toggleReaction.mutate({ postId: item.id, hasReacted: item.hasReacted })} />
            {index === 0 && !topic && podcast ? (
              <PodcastCard weeklyTopicQuote={podcast.quote} episodeTitle={podcast.episodeTitle} spotifyUrl={podcast.spotifyUrl} />
            ) : null}
          </>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },
  eyebrow: {
    fontFamily: type.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.gold,
    marginTop: 10,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.bordo,
    borderRadius: 999,
    paddingVertical: 8,
    paddingLeft: 15,
    paddingRight: 8,
    marginTop: 10,
  },
  filterLabel: {
    fontFamily: type.bodyBold,
    fontSize: 13,
    color: colors.cream,
  },
  filterClose: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontFamily: type.body,
    fontSize: 14,
    color: colors.bordoMuted,
    paddingVertical: 20,
  },
});
