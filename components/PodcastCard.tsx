import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radii, type } from '../lib/theme';
import { HeadphoneIcon } from './icons';

export function PodcastCard({
  weeklyTopicQuote,
  episodeTitle,
  spotifyUrl,
}: {
  weeklyTopicQuote: string;
  episodeTitle: string;
  spotifyUrl: string;
}) {
  return (
    <LinearGradient colors={[colors.bordo, colors.bordoDeep]} start={{ x: 0.1, y: 0 }} end={{ x: 0.7, y: 1 }} style={styles.card}>
      <Text style={styles.eyebrow}>Bu hafta Arafta&apos;da en çok konuşulan konu</Text>
      <Text style={styles.quote}>&quot;{weeklyTopicQuote}&quot;</Text>
      <View style={styles.epRow}>
        <View style={styles.epIcon}>
          <HeadphoneIcon size={16} color={colors.gold} />
        </View>
        <Text style={styles.epTitle}>Bu haftaki bölüm — &quot;{episodeTitle}&quot;</Text>
        <Pressable style={styles.link} onPress={() => Linking.openURL(spotifyUrl)}>
          <Text style={styles.linkLabel}>Dinle</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: 20,
    marginVertical: 6,
  },
  eyebrow: {
    fontFamily: type.bodyBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.goldPale,
    marginBottom: 10,
  },
  quote: {
    fontFamily: type.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.cream,
    marginBottom: 16,
  },
  epRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(231,206,156,0.22)',
    paddingTop: 14,
  },
  epIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(203,154,78,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  epTitle: {
    flex: 1,
    fontFamily: type.bodySemibold,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.cream,
  },
  link: {
    backgroundColor: colors.gold,
    borderRadius: radii.chip,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  linkLabel: {
    fontFamily: type.bodyBold,
    fontSize: 12.5,
    color: colors.bordoDeep,
  },
});
