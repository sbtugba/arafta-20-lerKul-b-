import { Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { editorial } from '../../lib/theme';
import { useToast } from '../../providers/ToastProvider';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { RowButton } from '../../components/editorial/RowButton';

export default function SupportScreen() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Yardım ve Destek" />
      <ScrollView style={styles.scroll}>
        <SettingsSection last>
          <RowButton label="Bize Ulaşın" value="destek@arafta.app" onPress={() => Linking.openURL('mailto:destek@arafta.app')} />
          <RowButton label="Sorun Bildir" onPress={() => Linking.openURL('mailto:destek@arafta.app?subject=Sorun%20Bildirimi')} />
          <RowButton label="Geri Bildirim Gönder" onPress={() => Linking.openURL('mailto:destek@arafta.app?subject=Geri%20Bildirim')} />
          <RowButton
            label="Önbelleği temizle"
            value="Yüklenen akış ve profilleri sıfırlar."
            onPress={() => {
              queryClient.clear();
              toast('Önbellek temizlendi.');
            }}
            last
          />
        </SettingsSection>
        <Text style={styles.note}>
          Bir paylaşımı raporlamak için akışta o paylaşımın sağ üstündeki ••• menüsünü kullanabilirsin.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  scroll: { flex: 1, paddingHorizontal: 20 },
  note: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    lineHeight: 19,
    color: editorial.inkFaint,
    paddingVertical: 14,
  },
});
