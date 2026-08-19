import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { useToast } from '../../providers/ToastProvider';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { ToggleRow } from '../../components/editorial/ToggleRow';

export default function PrivacyScreen() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  if (!profile) return null;

  function save(patch: Parameters<typeof updateProfile.mutate>[0]) {
    updateProfile.mutate(patch, { onSuccess: () => toast('✓ Güncellendi') });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Gizlilik ve Görünürlük" />
      <ScrollView style={styles.scroll}>
        <SettingsSection sub="Arafta kişi değil konu takibi üstüne kurulu — takipçiye özel görünürlük gibi ayarlar, kişi takibi eklendiğinde buraya gelecek.">
          <ToggleRow
            label="Profilimi herkese açık göster"
            value="Kapalıyken profilin yalnızca sen giriş yapınca görünür."
            on={profile.profileVisible}
            onToggle={() => save({ profileVisible: !profile.profileVisible })}
            last
          />
        </SettingsSection>

        <SettingsSection sub="Bu bilgiler profilinde ne kadar görünür olacağını belirler.">
          <ToggleRow
            label="Şehrimi göster"
            value="Profilinde yalnızca şehir seviyesinde görünür."
            on={profile.locationVisible}
            onToggle={() => save({ locationVisible: !profile.locationVisible })}
          />
          <ToggleRow
            label="Yaşımı göster"
            value="Kapalıyken kimse yaşını göremez."
            on={profile.showAge}
            onToggle={() => save({ showAge: !profile.showAge })}
          />
          <ToggleRow
            label="İlgi alanlarımı göster"
            value="Profilindeki ilgi alanları herkese açık olur."
            on={profile.showInterests}
            onToggle={() => save({ showInterests: !profile.showInterests })}
          />
          <ToggleRow
            label="Aktif olduğumu göster"
            value="Diğerleri çevrimiçi olduğunu görebilir."
            on={profile.showActive}
            onToggle={() => save({ showActive: !profile.showActive })}
          />
          <ToggleRow
            label="Son görülme durumumu göster"
            value="Kapalıyken son görülme bilgin gizli kalır."
            on={profile.showLastSeen}
            onToggle={() => save({ showLastSeen: !profile.showLastSeen })}
            last
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  scroll: { flex: 1, paddingHorizontal: 20 },
});
