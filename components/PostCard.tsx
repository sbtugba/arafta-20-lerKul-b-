import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence } from 'react-native-reanimated';

import { colors, type } from '../lib/theme';
import { springs } from '../lib/motion';
import type { Post } from '../lib/types';
import { REPORT_REASONS, displayNameFor } from '../lib/types';
import { useSubmitReport } from '../hooks/useReports';
import { useBlockUser } from '../hooks/useBlockedUsers';
import { useSession } from '../hooks/useSession';
import { HeartIcon, TalkIcon, MoreIcon } from './icons';
import { Avatar } from './Avatar';
import { AuthorName } from './AuthorName';
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
  const [menu, setMenu] = useState<'closed' | 'actions' | 'report'>('closed');
  const submitReport = useSubmitReport();
  const blockUser = useBlockUser();
  const { userId } = useSession();

  const canBlock = !post.isAnonymous && !!post.authorId && post.authorId !== userId;

  function handleReport(reason: string) {
    submitReport.mutate(
      { postId: post.id, reason },
      {
        onSuccess: () => {
          setMenu('closed');
          Alert.alert('Bildirildi', 'Bu paylaşımı bildirdiğin için teşekkürler, ekibimiz inceleyecek.');
        },
        onError: () => {
          Alert.alert('Bir şeyler ters gitti', 'Bildirimi gönderemedik, lütfen tekrar dene.');
        },
      }
    );
  }

  function confirmBlock() {
    const label = displayNameFor(post.authorDisplayName, post.authorUsername);
    Alert.alert(
      `${label} engellensin mi?`,
      'Bu kişinin paylaşımlarını ve yorumlarını artık görmeyeceksin. İstediğin zaman Ayarlar > Engellenenler ekranından geri alabilirsin.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Engelle',
          style: 'destructive',
          onPress: () =>
            blockUser.mutate(post.authorId, {
              onSuccess: () => {
                setMenu('closed');
                Alert.alert('Engellendi', `${label} artık akışında görünmeyecek.`);
              },
              onError: () => Alert.alert('Bir şeyler ters gitti', 'Engelleyemedik, lütfen tekrar dene.'),
            }),
        },
      ]
    );
  }

  const name = post.isAnonymous ? 'anonim' : displayNameFor(post.authorDisplayName, post.authorUsername);

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
        <View style={styles.bylineLeft}>
          <Avatar isAnonymous={post.isAnonymous} avatarUrl={post.authorAvatarUrl} name={name} size={36} />
          {post.isAnonymous ? (
            <Text style={styles.byline}>anonim</Text>
          ) : (
            <AuthorName displayName={post.authorDisplayName} username={post.authorUsername} nameStyle={styles.name} />
          )}
        </View>
        <Pressable onPress={() => setMenu('actions')} hitSlop={10} style={styles.moreBtn} accessibilityLabel="Paylaşım seçenekleri">
          <MoreIcon size={16} color={colors.bordoMuted} />
        </Pressable>
      </View>

      <Text style={styles.quote}>&quot;{post.body}&quot;</Text>

      {post.tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {post.tags.map((t) => (
            <Pressable key={t} onPress={() => router.push(`/topic/${encodeURIComponent(t)}`)} hitSlop={4}>
              <Text style={styles.tagLabel}>#{t}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} style={styles.reactBtn} hitSlop={8}>
          <View style={{ position: 'relative' }}>
            <Animated.View style={heartStyle}>
              <HeartIcon size={17} color={post.hasReacted ? colors.gold : colors.bordoMuted} filled={post.hasReacted} />
            </Animated.View>
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

      <Sheet visible={menu === 'actions'} onClose={() => setMenu('closed')} title="Paylaşım seçenekleri">
        {canBlock ? (
          <Pressable style={styles.reasonRow} onPress={confirmBlock} disabled={blockUser.isPending}>
            <Text style={[styles.reasonLabel, styles.blockLabel]}>Bu kişiyi engelle</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.reasonRow} onPress={() => setMenu('report')}>
          <Text style={styles.reasonLabel}>Şikayet et</Text>
        </Pressable>
      </Sheet>

      <Sheet visible={menu === 'report'} onClose={() => setMenu('closed')} title="Bu paylaşımı bildir">
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  bylineLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  byline: {
    flex: 1,
    fontFamily: type.bodyMedium,
    fontSize: 13,
    color: colors.bordoMuted,
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
  blockLabel: {
    color: colors.bordo,
  },
  name: {
    fontFamily: type.bodyBold,
    fontSize: 13,
    color: colors.bordo,
  },
  quote: {
    fontFamily: type.body,
    fontSize: 16.5,
    lineHeight: 24,
    color: colors.bordoInk,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  tagLabel: {
    fontFamily: type.bodySemibold,
    fontSize: 12.5,
    color: colors.gold,
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
