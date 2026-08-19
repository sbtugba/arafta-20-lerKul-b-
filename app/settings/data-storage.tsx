import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { editorial } from '../../lib/theme';
import { useLocalSetting } from '../../hooks/useLocalSetting';
import { useToast } from '../../providers/ToastProvider';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { ToggleRow } from '../../components/editorial/ToggleRow';
import { RowButton } from '../../components/editorial/RowButton';

type AutoplayMode = 'wifi-mobile' | 'wifi' | 'off';
const AUTOPLAY_OPTIONS: { key: AutoplayMode; label: string }[] = [
  { key: 'wifi-mobile', label: 'Wi-Fi + Mobil veri' },
  { key: 'wifi', label: 'Sadece Wi-Fi' },
  { key: 'off', label: 'Kapalı' },
];

export default function DataStorageScreen() {
  const [reduceMobileData, setReduceMobileData] = useLocalSetting('data.reduceMobileData', false);
  const [videoAutoplay, setVideoAutoplay] = useLocalSetting<AutoplayMode>('data.videoAutoplay', 'wifi-mobile');
  const queryClient = useQueryClient();
  const toast = useToast();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Veri Kullanımı" />
      <ScrollView style={styles.scroll}>
        <SettingsSection>
          <ToggleRow
            label="Mobil veri kullanımını azalt"
            value="Görselleri düşük çözünürlükte yükler."
            on={reduceMobileData}
            onToggle={() => setReduceMobileData(!reduceMobileData)}
            last
          />
        </SettingsSection>

        <SettingsSection label="VİDEO OTOMATİK OYNATMA">
          {AUTOPLAY_OPTIONS.map((opt, i) => (
            <Pressable
              key={opt.key}
              style={[styles.row, i < AUTOPLAY_OPTIONS.length - 1 && styles.rowBorder]}
              onPress={() => setVideoAutoplay(opt.key)}
            >
              <View style={[styles.radio, videoAutoplay === opt.key && styles.radioOn]} />
              <Text style={styles.label}>{opt.label}</Text>
            </Pressable>
          ))}
        </SettingsSection>

        <SettingsSection last>
          <RowButton
            label="Önbelleği temizle"
            onPress={() => {
              queryClient.clear();
              toast('Önbellek temizlendi.');
            }}
          />
          <RowButton label="İndirilen verileri temizle" onPress={() => toast('İndirilen veri bulunmuyor.')} last />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  scroll: { flex: 1, paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: editorial.line },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: editorial.line },
  radioOn: { borderColor: editorial.burgundy, backgroundColor: editorial.burgundy },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: editorial.ink },
});
