import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { editorial, editorialRadii } from '../../lib/theme';

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  loadingLabel,
  variant = 'burgundy',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  loadingLabel?: string;
  variant?: 'burgundy' | 'error';
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        variant === 'error' && styles.btnError,
        isDisabled && styles.btnDisabled,
        pressed && !isDisabled && styles.btnPressed,
      ]}
    >
      {loading ? <ActivityIndicator color={editorial.cream} size="small" /> : null}
      <Text style={styles.label}>{loading ? (loadingLabel ?? 'Bir saniye…') : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    borderRadius: editorialRadii.btn,
    backgroundColor: editorial.burgundy,
  },
  btnError: {
    backgroundColor: editorial.error,
  },
  btnDisabled: {
    opacity: 0.42,
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15.5,
    color: editorial.cream,
  },
});
