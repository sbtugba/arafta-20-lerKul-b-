import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import type { ContentPrefs } from '../../lib/types';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { ToggleRow } from '../../components/editorial/ToggleRow';

export default function ContentPrefsScreen() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  if (!profile) return null;
  const prefs = profile.contentPrefs;

  function set(key: keyof ContentPrefs, value: boolean) {
    updateProfile.mutate({ contentPrefs: { [key]: value } });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="İçerik Tercihleri" />
      <ScrollView style={styles.scroll}>
        <SettingsSection last>
          <ToggleRow
            label="İlgilenmediğim içerikleri azalt"
            value="Akış, tepki verdiğin konulara göre uyum sağlar."
            on={prefs.reduceUninterested}
            onToggle={() => set('reduceUninterested', !prefs.reduceUninterested)}
          />
          <ToggleRow
            label="Hassas içerik uyarısı"
            value="Zor konulardaki paylaşımlar önce bir uyarıyla gösterilir."
            on={prefs.sensitiveContent}
            onToggle={() => set('sensitiveContent', !prefs.sensitiveContent)}
          />
          <ToggleRow
            label="Otomatik oynatma"
            value="Akışta içerikler kendiliğinden oynamaya başlar."
            on={prefs.autoplay}
            onToggle={() => set('autoplay', !prefs.autoplay)}
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
