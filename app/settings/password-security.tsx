import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../../lib/supabase';
import { editorial } from '../../lib/theme';
import { translateAuthError } from '../../lib/authErrors';
import { useToast } from '../../providers/ToastProvider';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { RowButton } from '../../components/editorial/RowButton';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { Field } from '../../components/editorial/Field';
import { PrimaryButton } from '../../components/editorial/PrimaryButton';

export default function PasswordSecurityScreen() {
  const [changing, setChanging] = useState(false);
  const toast = useToast();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Şifre ve Güvenlik" />
      <ScrollView style={styles.scroll}>
        <SettingsSection>
          {changing ? (
            <ChangePasswordForm onDone={() => { setChanging(false); toast('Şifren başarıyla değiştirildi.'); }} />
          ) : (
            <RowButton label="Şifremi değiştir" onPress={() => setChanging(true)} />
          )}
          <RowButton label="E-posta doğrulaması" value="Doğrulandı" onPress={() => {}} last />
        </SettingsSection>

        <SettingsSection label="AKTİF OTURUMLAR" sub="Şu an yalnızca bu cihazı gösterebiliyoruz — diğer cihazların listesi yakında." last>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Bu cihaz</Text>
            <Text style={styles.sessionSub}>Şu an aktif</Text>
          </View>
          <Text
            style={styles.dangerLink}
            onPress={async () => {
              const { error } = await supabase.auth.signOut({ scope: 'others' });
              toast(error ? translateAuthError(error.message) : 'Diğer tüm cihazlardan çıkış yapıldı.');
            }}
          >
            Diğer tüm cihazlardan çıkış yap
          </Text>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (password.length < 8) {
      setError('En az 8 karakter olmalı.');
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) {
      setError(translateAuthError(updateError.message));
      return;
    }
    onDone();
  }

  return (
    <View style={{ paddingTop: 2, paddingBottom: 14, gap: 8 }}>
      <Field label="Yeni şifre" placeholder="en az 8 karakter" secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} error={error} />
      <PrimaryButton label="Şifreyi güncelle" loading={submitting} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sessionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  sessionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14.5, color: editorial.ink },
  sessionSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: editorial.inkFaint, marginTop: 2 },
  dangerLink: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13.5,
    color: editorial.error,
    paddingVertical: 14,
  },
});
