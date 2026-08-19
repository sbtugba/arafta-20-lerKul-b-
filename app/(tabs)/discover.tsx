import { FlatList, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, type } from '../../lib/theme';
import { useTrendingTopics } from '../../hooks/useTrendingTopics';
import { TopBar } from '../../components/TopBar';
import { TopicRow } from '../../components/TopicRow';

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export default function DiscoverScreen() {
  const { data: topics, isLoading } = useTrendingTopics();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar />
      <FlatList
        data={topics ?? []}
        keyExtractor={(item) => item.tag}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.heading}>Şu sıralar herkes neyi düşünüyor?</Text>}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>Henüz yeterince paylaşım yok — konular burada birikince görünecek.</Text> : null
        }
        renderItem={({ item }) => (
          <TopicRow
            tag={item.tag}
            count={formatCount(item.count)}
            quote={item.sampleQuote}
            onPress={() => router.push({ pathname: '/', params: { topic: item.tag } })}
          />
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
  heading: {
    fontFamily: type.bodyBold,
    fontSize: 21,
    lineHeight: 28,
    color: colors.bordoInk,
    marginTop: 8,
    marginBottom: 18,
  },
  empty: {
    fontFamily: type.body,
    fontSize: 14,
    color: colors.bordoMuted,
    paddingVertical: 20,
  },
});
