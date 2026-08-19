import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { PrimaryButton } from '../../components/editorial/PrimaryButton';
import { TextLink, TextLinkEmphasis } from '../../components/editorial/TextLink';

export default function AuthChoiceScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.wordmark}>arafta.</Text>

      <View style={styles.mid}>
        <Text style={styles.headline}>Hayatın henüz bir yere oturmadıysa, burada yalnız değilsin.</Text>
        <Text style={styles.sub}>Arafta, aynı belirsizlikte olan insanların bir araya geldiği yer.</Text>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton label="Aramıza katıl" onPress={() => router.push('/(auth)/signup')} />
        <TextLink onPress={() => router.push('/(auth)/login')}>
          Zaten aramızdaysan, <TextLinkEmphasis>giriş yap</TextLinkEmphasis>
        </TextLink>
        <Text style={styles.legal}>Devam ederek Kullanım Koşulları ve Gizlilik Politikası&apos;nı kabul etmiş olursun.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: editorial.cream,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  wordmark: {
    fontFamily: 'Fraunces_600SemiBold_Italic',
    fontSize: 19,
    color: editorial.burgundy,
  },
  mid: {
    marginTop: 40,
  },
  headline: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 29,
    lineHeight: 37,
    color: editorial.ink,
    marginBottom: 16,
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: editorial.inkSoft,
    maxWidth: '82%',
  },
  bottom: {
    gap: 12,
  },
  legal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    lineHeight: 16,
    color: editorial.inkFaint,
    textAlign: 'center',
    marginTop: 12,
  },
});
