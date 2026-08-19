import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { useSession } from '../../providers/SessionProvider';
import { useProfile } from '../../hooks/useProfile';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { RowButton } from '../../components/editorial/RowButton';
import { SettingsSection } from '../../components/editorial/SettingsSection';

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.charAt(0)}***@${domain}`;
}

export default function AccountInfoScreen() {
  const { session } = useSession();
  const { data: profile } = useProfile();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Hesap Bilgileri" />
      <ScrollView style={styles.scroll}>
        <SettingsSection last>
          <RowButton label="E-posta" value={session?.user.email ? maskEmail(session.user.email) : ''} onPress={() => router.push('/settings/password-security')} />
          <RowButton label="Telefon numarası" value={profile?.phone || 'Eklenmedi'} onPress={() => {}} />
          <RowButton label="Doğum tarihi" value={profile?.birthdate || 'Eklenmedi'} onPress={() => {}} />
          <RowButton label="Kullanıcı adı" value={profile?.username ? `@${profile.username}` : 'Eklenmedi'} onPress={() => router.push('/profile/edit')} last />
        </SettingsSection>
        <Text style={styles.note}>
          Hassas bilgiler maskelenerek gösterilir. Telefon ve doğum tarihi eklemek yakında — şimdilik e-postanı ve kullanıcı
          adını buradan yönetebilirsin.
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
    fontSize: 12,
    color: editorial.inkFaint,
    lineHeight: 18,
    paddingVertical: 12,
  },
});
