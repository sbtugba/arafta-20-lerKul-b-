import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import type { NotificationPrefs } from '../../lib/types';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { ToggleRow } from '../../components/editorial/ToggleRow';

export default function NotificationsScreen() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  if (!profile) return null;
  const prefs = profile.notificationPrefs;

  function set(key: keyof NotificationPrefs, value: boolean) {
    updateProfile.mutate({ notificationPrefs: { [key]: value } });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Bildirim Ayarları" />
      <ScrollView style={styles.scroll}>
        <SettingsSection label="ETKİLEŞİMLER">
          <ToggleRow label="Yeni takipçi" on={prefs.newFollower} onToggle={() => set('newFollower', !prefs.newFollower)} />
          <ToggleRow label="Takip isteği" on={prefs.followRequest} onToggle={() => set('followRequest', !prefs.followRequest)} />
          <ToggleRow label="Gönderime beğeni" on={prefs.postLike} onToggle={() => set('postLike', !prefs.postLike)} />
          <ToggleRow label="Gönderime yorum" on={prefs.postComment} onToggle={() => set('postComment', !prefs.postComment)} />
          <ToggleRow label="Mention" on={prefs.mention} onToggle={() => set('mention', !prefs.mention)} last />
        </SettingsSection>

        <SettingsSection label="SOSYAL">
          <ToggleRow label="Yeni takip edilen içerikler" on={prefs.newContent} onToggle={() => set('newContent', !prefs.newContent)} />
          <ToggleRow label="Önerilen kişiler" on={prefs.suggestedPeople} onToggle={() => set('suggestedPeople', !prefs.suggestedPeople)} />
          <ToggleRow label="Topluluk etkinlikleri" on={prefs.communityEvents} onToggle={() => set('communityEvents', !prefs.communityEvents)} last />
        </SettingsSection>

        <SettingsSection label="SİSTEM">
          <ToggleRow label="Hesap güvenliği" value="Kapatılamaz — hesabını korumak için gerekli." on locked />
          <ToggleRow
            label="Önemli duyurular"
            on={prefs.importantAnnouncements}
            onToggle={() => set('importantAnnouncements', !prefs.importantAnnouncements)}
          />
          <ToggleRow label="Uygulama güncellemeleri" on={prefs.appUpdates} onToggle={() => set('appUpdates', !prefs.appUpdates)} last />
        </SettingsSection>

        <SettingsSection label="E-POSTA" last>
          <ToggleRow label="Ürün güncellemeleri" on={prefs.emailProduct} onToggle={() => set('emailProduct', !prefs.emailProduct)} />
          <ToggleRow label="Önemli hesap bildirimleri" value="Kapatılamaz." on locked last />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  scroll: { flex: 1, paddingHorizontal: 20 },
});
