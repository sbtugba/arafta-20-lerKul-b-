import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence } from 'react-native-reanimated';

import { colors, type } from '../lib/theme';
import { springs } from '../lib/motion';
import type { Post } from '../lib/types';
import { REPORT_REASONS } from '../lib/types';
import { useSubmitReport } from '../hooks/useReports';
import { HeartIcon, TalkIcon, MoreIcon } from './icons';
import { Sheet } from './editorial/Sheet';

export function PostCard({
  post,
  onToggleReaction,
  disableCommentLink = false,
}: {
  post: Post;
  onToggleReaction: () => void;
  disableCommentLink?: boolean;
}) {
  const scale = useSharedValue(1);
  const toastOpacity = useSharedValue(0);
  const toastY = useSharedValue(4);
  const [reportOpen, setReportOpen] = useState(false);
  const submitReport = useSubmitReport();

  function handleReport(reason: string) {
    submitReport.mutate(
      { postId: post.id, reason },
      {
        onSuccess: () => {
          setReportOpen(false);
          Alert.alert('Bildirildi', 'Bu paylaşımı bildirdiğin için teşekkürler, ekibimiz inceleyecek.');
        },
        onError: () => {
          Alert.alert('Bir şeyler ters gitti', 'Bildirimi gönderemedik, lütfen tekrar dene.');
        },
      }
    );
  }

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: toastY.value }],
  }));

  // §1 — respond the instant the finger lands, not on release.
  function handlePressIn() {
    scale.value = withTiming(0.85, { duration: 90 });
  }

  // §1/§13 — a cancelled press (finger dragged away) still needs to settle back.
  function handlePressOut() {
    scale.value = withSpring(1, springs.move);
  }

  function handlePress() {
    const turningOn = !post.hasReacted;

    // small commit pulse, only meaningful because this tap just landed (§4 §13)
    scale.value = withSequence(withTiming(1.18, { duration: 90 }), withSpring(1, springs.tap));

    if (turningOn) {
      toastOpacity.value = 0;
      toastY.value = 4;
      // rise in, hold, fade out — opacity and position sequenced together
      toastOpacity.value = withSequence(withTiming(1, { duration: 180 }), withTiming(1, { duration: 650 }), withTiming(0, { duration: 260 }));
      toastY.value = withSequence(withTiming(-2, { duration: 180 }), withTiming(-2, { duration: 650 }), withTiming(-14, { duration: 260 }));
    }

    onToggleReaction();
  }

  return (
    <View style={styles.card}>
      <View style={styles.bylineRow}>
        <Text style={styles.byline}>
          {post.isAnonymous ? (
            `anonim · ${post.tags.map((t) => `#${t}`).join(' ')}`
          ) : (
            <>
              <Text style={styles.name}>{post.authorDisplayName ?? 'biri'}</Text>
              {` · #${post.tags[0] ?? 'arafta'}`}
            </>
          )}
        </Text>
        <Pressable onPress={() => setReportOpen(true)} hitSlop={10} style={styles.moreBtn} accessibilityLabel="Paylaşım seçenekleri">
          <MoreIcon size={16} color={colors.bordoMuted} />
        </Pressable>
      </View>

      <Text style={styles.quote}>&quot;{post.body}&quot;</Text>

      <View style={styles.actions}>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} style={styles.reactBtn} hitSlop={8}>
          <View style={{ position: 'relative' }}>
            <Animated.View style={heartStyle}>
              <HeartIcon size={17} color={post.hasReacted ? colors.gold : colors.bordoMuted} filled={post.hasReacted} />
            </Animated.View>
            <Animated.Text style={[styles.toast, toastStyle]}>Yalnız değilsin.</Animated.Text>
          </View>
          <Text style={[styles.reactLabel, post.hasReacted && { color: colors.bordo }]}>
            bende de öyle · <Text style={styles.count}>{post.reactionCount.toLocaleString('tr-TR')}</Text>
          </Text>
        </Pressable>

        <Pressable
          style={styles.talk}
          hitSlop={8}
          disabled={disableCommentLink}
          onPress={() => router.push(`/post/${post.id}`)}
        >
          <TalkIcon size={15} color={colors.bordoMuted} />
          <Text style={styles.talkLabel}>{post.commentCount} kişi konuştu</Text>
        </Pressable>
      </View>

      <Sheet visible={reportOpen} onClose={() => setReportOpen(false)} title="Bu paylaşımı bildir">
        {REPORT_REASONS.map((reason) => (
          <Pressable key={reason} style={styles.reasonRow} onPress={() => handleReport(reason)} disabled={submitReport.isPending}>
            <Text style={styles.reasonLabel}>{reason}</Text>
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 1,
    borderBottomColor: colors.creamLine,
    paddingVertical: 18,
  },
  bylineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  byline: {
    flex: 1,
    fontFamily: type.bodyMedium,
    fontSize: 13,
    color: colors.bordoMuted,
    marginBottom: 10,
  },
  moreBtn: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  reasonRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamLine,
  },
  reasonLabel: {
    fontFamily: type.bodyMedium,
    fontSize: 14.5,
    color: colors.bordoInk,
  },
  name: {
    fontFamily: type.bodyBold,
    color: colors.bordo,
  },
  quote: {
    fontFamily: type.body,
    fontSize: 16.5,
    lineHeight: 24,
    color: colors.bordoInk,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  reactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactLabel: {
    fontFamily: type.bodySemibold,
    fontSize: 13.5,
    color: colors.bordoMuted,
  },
  count: {
    fontVariant: ['tabular-nums'],
  },
  talk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  talkLabel: {
    fontFamily: type.bodyMedium,
    fontSize: 13.5,
    color: colors.bordoMuted,
  },
  toast: {
    position: 'absolute',
    left: -4,
    top: -22,
    fontFamily: type.bodyBold,
    fontSize: 11,
    color: colors.gold,
    width: 110,
  },
});
