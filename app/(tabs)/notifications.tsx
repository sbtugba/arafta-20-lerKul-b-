import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, type } from '../../lib/theme';
import { TopBar } from '../../components/TopBar';
import { BellIcon, HeadphoneIcon, TalkIcon } from '../../components/icons';

const NOTIFICATIONS = [
  {
    icon: BellIcon,
    text: '128 kişi paylaşımında kendini buldu — "25 yaşındayım ve hâlâ..."',
    time: '2 saat önce',
  },
  {
    icon: TalkIcon,
    text: 'emre paylaşımına yorum yaptı: "ben de tam olarak böyle hissediyorum..."',
    time: 'Dün',
  },
  {
    icon: HeadphoneIcon,
    text: 'Yeni bölüm yayında: "Herkes ilerliyor, ben neden yerimdeyim?"',
    time: '3 gün önce',
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>BİLDİRİMLER</Text>
        {NOTIFICATIONS.map((n, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.iconWrap}>
              <n.icon size={15} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.text}>{n.text}</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
          </View>
        ))}
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
});
