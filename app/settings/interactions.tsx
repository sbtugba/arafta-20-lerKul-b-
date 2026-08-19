import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { RowButton } from '../../components/editorial/RowButton';

export default function InteractionsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Etkileşimler" />
      <ScrollView style={styles.scroll}>
        <SettingsSection
          sub="Arafta'da mesajlaşma, yorum, mention ve etiketleme henüz yok — bu ayarlar o özellikler eklendiğinde burada aktif olacak."
          last
        >
          <RowButton label="Kimler bana mesaj gönderebilir?" soon onPress={() => {}} />
          <RowButton label="Kimler gönderilerime yorum yapabilir?" soon onPress={() => {}} />
          <RowButton label="Kimler beni mention edebilir?" soon onPress={() => {}} />
          <RowButton label="Kimler beni gönderilerde etiketleyebilir?" soon onPress={() => {}} last />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  scroll: { flex: 1, paddingHorizontal: 20 },
});
