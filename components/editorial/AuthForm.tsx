import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { Field } from './Field';
import { PrimaryButton } from './PrimaryButton';
import { ArrowLeftIcon } from '../icons';

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function AuthForm<T extends { error: string | null }>({
  title,
  subtitle,
  submitLabel,
  loadingLabel,
  minPasswordLength,
  onSubmit,
  onSuccess,
  footer,
}: {
  title: string;
  subtitle: string;
  submitLabel: string;
  loadingLabel: string;
  minPasswordLength?: number;
  onSubmit: (email: string, password: string) => Promise<T>;
  onSuccess: (result: T) => void;
  footer: ReactNode;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

    if (!ok) return;

    setSubmitting(true);
    const result = await onSubmit(email, password);
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
        </View>

        <View style={styles.footer}>
          <PrimaryButton label={submitLabel} loadingLabel={loadingLabel} loading={submitting} onPress={handleSubmit} />
          {footer}
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
    flex: 1,
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
