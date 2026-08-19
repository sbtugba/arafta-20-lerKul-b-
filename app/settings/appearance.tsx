import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { useEditorialTheme, type ThemePreference } from '../../providers/EditorialThemeProvider';
import { useLocalSetting } from '../../hooks/useLocalSetting';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { ToggleRow } from '../../components/editorial/ToggleRow';
import { CheckIcon } from '../../components/icons';

const THEME_OPTIONS: { key: ThemePreference; label: string }[] = [
  { key: 'system', label: 'Sistem' },
  { key: 'light', label: 'Açık' },
  { key: 'dark', label: 'Koyu' },
];

export default function AppearanceScreen() {
  const { themePref, setThemePref, colors: previewColors } = useEditorialTheme();
  const [textSize, setTextSize] = useLocalSetting<'standard' | 'large'>('appearance.textSize', 'standard');
  const [reduceMotion, setReduceMotion] = useLocalSetting('appearance.reduceMotion', false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Görünüm" />
      <ScrollView style={styles.scroll}>
        <SettingsSection
          label="TEMA"
          sub="Koyu tema seçimi kaydediliyor ve bu ekranda önizlenir; uygulamanın geri kalanına yansıtmak sıradaki adım."
        >
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const selected = themePref === opt.key;
              const swatchColors = opt.key === 'dark' ? previewColors : editorial;
              return (
                <Pressable key={opt.key} style={[styles.themeCard, selected && styles.themeCardSelected]} onPress={() => setThemePref(opt.key)}>
                  <View
                    style={[
                      styles.swatch,
                      opt.key === 'system'
                        ? { backgroundColor: editorial.cream }
                        : { backgroundColor: swatchColors.cream, borderColor: swatchColors.burgundy },
                    ]}
                  >
                    {opt.key === 'system' ? (
                      <View style={styles.swatchSplit} />
                    ) : (
                      <View style={[styles.swatchDot, { backgroundColor: swatchColors.burgundy }]} />
                    )}
                    {selected ? (
                      <View style={styles.swatchCheck}>
                        <CheckIcon size={10} color={editorial.cream} />
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.themeLabel}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </SettingsSection>

        <SettingsSection label="YAZI BOYUTU">
          {(['standard', 'large'] as const).map((v, i, arr) => (
            <Pressable key={v} style={[styles.sizeRow, i < arr.length - 1 && styles.sizeRowBorder]} onPress={() => setTextSize(v)}>
              <View style={[styles.radio, textSize === v && styles.radioOn]} />
              <Text style={[styles.sizeLabel, v === 'large' && { fontSize: 16 }]}>{v === 'standard' ? 'Standart' : 'Büyük'}</Text>
            </Pressable>
          ))}
        </SettingsSection>

        <SettingsSection last>
          <ToggleRow
            label="Hareketleri azalt"
            value="Geçiş ve mikro animasyonları sadeleştirir."
            on={reduceMotion}
            onToggle={() => setReduceMotion(!reduceMotion)}
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
  themeRow: { flexDirection: 'row', gap: 10, paddingTop: 2 },
  themeCard: { flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: editorial.line, padding: 10 },
  themeCardSelected: { borderColor: editorial.burgundy },
  swatch: {
    height: 46,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 6,
    overflow: 'hidden',
  },
  swatchSplit: { position: 'absolute', left: '50%', top: 0, bottom: 0, right: 0, backgroundColor: editorial.ink },
  swatchDot: { width: 12, height: 12, borderRadius: 6 },
  swatchCheck: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: editorial.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: editorial.ink, textAlign: 'center' },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  sizeRowBorder: { borderBottomWidth: 1, borderBottomColor: editorial.line },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: editorial.line },
  radioOn: { borderColor: editorial.burgundy, backgroundColor: editorial.burgundy },
  sizeLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: editorial.ink },
});
