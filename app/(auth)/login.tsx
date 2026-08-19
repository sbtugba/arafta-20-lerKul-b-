import { router } from 'expo-router';

import { useSession } from '../../providers/SessionProvider';
import { AuthForm } from '../../components/editorial/AuthForm';
import { TextLink, TextLinkEmphasis } from '../../components/editorial/TextLink';

export default function LoginScreen() {
  const { signIn } = useSession();

  return (
    <AuthForm
      title="Tekrar hoş geldin"
      subtitle="Kaldığın yerden devam edebilirsin."
      submitLabel="Giriş yap"
      loadingLabel="Giriş yapılıyor…"
      onSubmit={signIn}
      onSuccess={() => {}}
      footer={
        <TextLink onPress={() => router.replace('/(auth)/signup')}>
          Hesabın yok mu? <TextLinkEmphasis>Aramıza katıl</TextLinkEmphasis>
        </TextLink>
      }
    />
  );
}
