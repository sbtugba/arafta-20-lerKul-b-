import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { useSession } from '../../providers/SessionProvider';
import { AuthForm } from '../../components/editorial/AuthForm';
import { TextLink, TextLinkEmphasis } from '../../components/editorial/TextLink';

export default function SignUpScreen() {
  const { signUp } = useSession();
  const [confirmationSent, setConfirmationSent] = useState(false);

  if (confirmationSent) {
    return (
      <SafeAreaView style={styles.confirmSafe}>
        <Text style={styles.confirmTitle}>E-postana bir bağlantı gönderdik.</Text>
        <Text style={styles.confirmBody}>Gelen kutunu kontrol et — onayladığında Arafta seni burada bekliyor olacak.</Text>
        <TextLink onPress={() => router.replace('/(auth)/login')}>
          Onayladım, <TextLinkEmphasis>giriş yap</TextLinkEmphasis>
        </TextLink>
      </SafeAreaView>
    );
  }

  return (
    <AuthForm
      title="Aramıza katıl"
      subtitle="Bir e-posta ve şifre yeter, gerisini sonra hallederiz."
      submitLabel="Devam et"
      loadingLabel="Bir saniye…"
      minPasswordLength={8}
      onSubmit={signUp}
      onSuccess={(result) => {
        if (result.needsEmailConfirmation) setConfirmationSent(true);
        // aksi halde oturum kendiliğinden açılır, kök yönlendirme akışa taşır
      }}
      footer={
        <TextLink onPress={() => router.replace('/(auth)/login')}>
          Zaten hesabın var mı? <TextLinkEmphasis>Giriş yap</TextLinkEmphasis>
        </TextLink>
      }
    />
  );
}

const styles = StyleSheet.create({
  confirmSafe: {
    flex: 1,
    backgroundColor: editorial.cream,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  confirmTitle: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 22,
    color: editorial.ink,
    textAlign: 'center',
  },
  confirmBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: editorial.inkSoft,
    textAlign: 'center',
    marginBottom: 8,
  },
});
