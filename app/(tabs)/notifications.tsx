import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, type } from '../../lib/theme';
import { relativeTime } from '../../lib/types';
import { useNotifications, useMarkNotificationsRead, type NotificationType } from '../../hooks/useNotifications';
import { TopBar } from '../../components/TopBar';
import { HeartIcon, HeadphoneIcon, TalkIcon } from '../../components/icons';

const ICON_BY_TYPE: Record<NotificationType, typeof HeartIcon> = {
  post_like: HeartIcon,
  post_comment: TalkIcon,
  comment_like: HeartIcon,
  podcast: HeadphoneIcon,
};

export default function NotificationsScreen() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  // Bildirimler sekmesini açmak, kişiye özel bildirimleri okunmuş sayar —
  // yayın bildirimleri (podcast) zaten "okundu" takip etmiyor (bkz. hook).
  useEffect(() => {
    markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>BİLDİRİMLER</Text>
        {!isLoading && notifications?.length === 0 ? <Text style={styles.empty}>Henüz bir bildirimin yok.</Text> : null}
        {(notifications ?? []).map((n) => {
          const Icon = ICON_BY_TYPE[n.type];
          return (
            <Pressable
              key={n.id}
              style={styles.row}
              disabled={!n.postId}
              onPress={() => n.postId && router.push(`/post/${n.postId}`)}
            >
              <View style={styles.iconWrap}>
                <Icon size={15} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.text}>{n.body}</Text>
                <Text style={styles.time}>{relativeTime(n.createdAt)}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
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
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamLine,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.creamDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: type.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.bordoInk,
  },
  time: {
    fontFamily: type.body,
    fontSize: 12,
    color: colors.bordoMuted,
    marginTop: 3,
  },
  empty: {
    fontFamily: type.body,
    fontSize: 14,
    color: colors.bordoMuted,
    paddingVertical: 20,
  },
});
