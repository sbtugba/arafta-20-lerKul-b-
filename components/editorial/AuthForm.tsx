import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { slugifyUsername } from '../../lib/types';
import { checkUsernameAvailable } from '../../hooks/useProfile';
import { Field } from './Field';
import { PrimaryButton } from './PrimaryButton';
import { ArrowLeftIcon, CheckIcon } from '../icons';

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// "GG.AA.YYYY" yazarken otomatik nokta ekler, kullanıcı sadece rakam girer.
function formatBirthdateInput(raw: string, previous: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const deleting = raw.length < previous.length;
  let out = digits.slice(0, 2);
  if (digits.length > 2) out += '.' + digits.slice(2, 4);
  if (digits.length > 4) out += '.' + digits.slice(4, 8);
  // Silme sırasında otomatik eklenen noktayı geri getirmeyelim (kullanıcı geri tuşuna basınca takılmasın).
  return deleting && raw.endsWith('.') ? raw : out;
}

// Geçerli bir "GG.AA.YYYY" ise ISO tarihe ("YYYY-MM-DD") çevirir, değilse null döner.
function parseBirthdateInput(raw: string): string | null {
  const match = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (date > new Date()) return null;

  const age = (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 13 || age > 100) return null;

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function AuthForm<T extends { error: string | null }>({
  title,
  subtitle,
  submitLabel,
  loadingLabel,
  minPasswordLength,
  collectBirthdate,
  collectUsername,
  onSubmit,
  onSuccess,
  footer,
}: {
  title: string;
  subtitle: string;
  submitLabel: string;
  loadingLabel: string;
  minPasswordLength?: number;
  collectBirthdate?: boolean;
  collectUsername?: boolean;
  onSubmit: (email: string, password: string, birthdate?: string, username?: string) => Promise<T>;
  onSuccess: (result: T) => void;
  footer: ReactNode;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthdateInput, setBirthdateInput] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const [usernameNote, setUsernameNote] = useState('3–20 karakter, küçük harf/rakam/alt çizgi.');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [birthdateError, setBirthdateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onUsernameChange(raw: string) {
    const clean = slugifyUsername(raw);
    setUsername(clean);
    if (clean.length < 3) {
      setUsernameStatus('idle');
      setUsernameNote('3–20 karakter, küçük harf/rakam/alt çizgi.');
      return;
    }
    setUsernameStatus('checking');
    setUsernameNote('Kontrol ediliyor…');
  }

  // debounced kullanılabilirlik kontrolü — henüz hesap yok, o yüzden "kendisi"
  // diye hariç tutulacak bir userId de yok (bkz. checkUsernameAvailable).
  useEffect(() => {
    if (!collectUsername || username.length < 3) return;
    const timer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(username, '');
        if (available) {
          setUsernameStatus('ok');
          setUsernameNote('✓ Kullanılabilir');
        } else {
          setUsernameStatus('taken');
          setUsernameNote('Bu kullanıcı adı alınmış.');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 550);
    return () => clearTimeout(timer);
  }, [collectUsername, username]);

  async function handleSubmit() {
    let ok = true;
    if (!isValidEmail(email.trim())) {
      setEmailError('Geçerli bir e-posta gir.');
      ok = false;
    } else {
      setEmailError(null);
    }

    if (minPasswordLength && password.length < minPasswordLength) {
      setPasswordError(`En az ${minPasswordLength} karakter olmalı.`);
      ok = false;
    } else if (password.length === 0) {
      setPasswordError('Şifreni gir.');
      ok = false;
    } else {
      setPasswordError(null);
    }

    let birthdate: string | undefined;
    if (collectBirthdate) {
      const parsed = parseBirthdateInput(birthdateInput);
      if (!parsed) {
        setBirthdateError('Geçerli bir tarih gir (GG.AA.YYYY).');
        ok = false;
      } else {
        setBirthdateError(null);
        birthdate = parsed;
      }
    }

    if (collectUsername) {
      if (usernameStatus === 'checking') {
        setUsernameNote('Bir saniye, kontrol ediyoruz…');
        ok = false;
      } else if (usernameStatus !== 'ok') {
        setUsernameStatus('idle');
        setUsernameNote(username.length < 3 ? 'Bir kullanıcı adı seç.' : usernameNote);
        ok = false;
      }
    }

    if (!ok) return;

    setSubmitting(true);
    const result = await onSubmit(email, password, birthdate, collectUsername ? username : undefined);
    setSubmitting(false);

    if (result.error) {
      setPasswordError(result.error);
      return;
    }
    onSuccess(result);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={10}>
          <ArrowLeftIcon size={20} color={editorial.ink} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.head}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.fields}>
            <Field
              label="E-posta"
              placeholder="sen@ornek.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />
            <Field
              label="Şifre"
              placeholder={minPasswordLength ? `en az ${minPasswordLength} karakter` : 'şifren'}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              rightElement={
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  <Text style={styles.toggle}>{showPassword ? 'GİZLE' : 'GÖSTER'}</Text>
                </Pressable>
              }
            />
            {collectUsername ? (
              <Field
                label="Kullanıcı adı"
                placeholder="kullaniciadi"
                autoCapitalize="none"
                value={username}
                onChangeText={onUsernameChange}
                error={usernameStatus === 'taken' ? usernameNote : undefined}
                note={usernameStatus !== 'taken' ? usernameNote : undefined}
                rightElement={usernameStatus === 'ok' ? <CheckIcon size={14} color={editorial.success} /> : undefined}
              />
            ) : null}
            {collectBirthdate ? (
              <Field
                label="Doğum tarihi"
                placeholder="GG.AA.YYYY"
                keyboardType="number-pad"
                maxLength={10}
                value={birthdateInput}
                onChangeText={(v) => setBirthdateInput((prev) => formatBirthdateInput(v, prev))}
                error={birthdateError}
              />
            ) : null}
          </View>

          <View style={styles.footer}>
            <PrimaryButton label={submitLabel} loadingLabel={loadingLabel} loading={submitting} onPress={handleSubmit} />
            {footer}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: editorial.cream,
    paddingHorizontal: 24,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    marginTop: 8,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  head: {
    marginBottom: 28,
  },
  title: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 25,
    color: editorial.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: editorial.inkSoft,
    maxWidth: '85%',
  },
  fields: {
    marginBottom: 8,
  },
  toggle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: editorial.inkFaint,
  },
  footer: {
    gap: 4,
    paddingBottom: 24,
  },
});
