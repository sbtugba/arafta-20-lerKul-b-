import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { discover, type } from '../../lib/theme';
import { formatCount } from '../../lib/types';
import { usePosts, useToggleReaction, useTopicPostCount } from '../../hooks/usePosts';
import { useTopicFollows, useToggleTopicFollow } from '../../hooks/useTopicFollows';
import { PostCard } from '../../components/PostCard';
import { ArrowLeftIcon, CheckIcon, PlusIcon } from '../../components/icons';

type SortMode = 'newest' | 'top';

export default function TopicDetailScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const [sort, setSort] = useState<SortMode>('newest');

  const { data: posts, isLoading } = usePosts(tag);
  const { data: count } = useTopicPostCount(tag);
  const { data: followed } = useTopicFollows();
  const toggleFollow = useToggleTopicFollow();
  const toggleReaction = useToggleReaction();

  const isFollowing = followed?.has(tag) ?? false;

  const sorted = useMemo(() => {
    if (!posts) return [];
    return sort === 'top' ? [...posts].sort((a, b) => b.reactionCount - a.reactionCount) : posts;
  }, [posts, sort]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <ArrowLeftIcon size={18} color={discover.bordo} />
        </Pressable>
      </View>

      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tag}>#{tag}</Text>
            <Text style={styles.count}>{formatCount(count ?? 0)} paylaşım</Text>
          </View>
          <Pressable
            style={[styles.followBtn, isFollowing && styles.followBtnActive]}
            onPress={() => toggleFollow.mutate({ topic: tag, following: isFollowing })}
            disabled={toggleFollow.isPending}
          >
            {isFollowing ? <CheckIcon size={11} color={discover.bordo} /> : <PlusIcon size={12} color={discover.cream} />}
            <Text style={[styles.followLabel, isFollowing && styles.followLabelActive]}>
              {isFollowing ? 'Takip ediliyor' : 'Takip et'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sortRow}>
          <Pressable onPress={() => setSort('newest')} style={styles.sortBtn}>
            <Text style={[styles.sortLabel, sort === 'newest' && styles.sortLabelActive]}>En yeni</Text>
          </Pressable>
          <Pressable onPress={() => setSort('top')} style={styles.sortBtn}>
            <Text style={[styles.sortLabel, sort === 'top' && styles.sortLabelActive]}>En çok konuşulan</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Bu konu hakkında henüz kimse konuşmamış.</Text>
              <Text style={styles.emptySub}>Belki ilk sen söylersin.</Text>
              <Pressable style={styles.emptyBtn} onPress={() => router.push({ pathname: '/share', params: { tag } })}>
                <Text style={styles.emptyBtnLabel}>Paylaş</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <PostCard post={item} onToggleReaction={() => toggleReaction.mutate({ postId: item.id, hasReacted: item.hasReacted })} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: discover.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,37,64,0.1)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  tag: {
    fontFamily: 'Fraunces_600SemiBold_Italic',
    fontSize: 26,
    color: discover.bordo,
  },
  count: {
    fontFamily: type.body,
    fontSize: 13.5,
    color: discover.inkSoft,
    marginTop: 4,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: discover.bordo,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 15,
    marginTop: 4,
  },
  followBtnActive: {
    backgroundColor: discover.creamSecondary,
    borderWidth: 1,
    borderColor: discover.bordo,
  },
  followLabel: {
    fontFamily: type.bodyBold,
    fontSize: 12.5,
    color: discover.cream,
  },
  followLabelActive: {
    color: discover.bordo,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 20,
  },
  sortBtn: {
    paddingVertical: 4,
  },
  sortLabel: {
    fontFamily: type.bodySemibold,
    fontSize: 13.5,
    color: discover.inkSoft,
  },
  sortLabelActive: {
    color: discover.bordo,
    textDecorationLine: 'underline',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 56,
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
