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
          <ToggleRow label="Paylaşımıma beğeni" on={prefs.postLike} onToggle={() => set('postLike', !prefs.postLike)} />
          <ToggleRow label="Paylaşımıma yorum" on={prefs.postComment} onToggle={() => set('postComment', !prefs.postComment)} last />
        </SettingsSection>

        <SettingsSection label="ETİKETLER">
          <ToggleRow
            label="Takip ettiğim etiketlerde yeni paylaşım"
            on={prefs.newContent}
            onToggle={() => set('newContent', !prefs.newContent)}
            last
          />
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
