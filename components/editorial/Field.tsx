import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { editorial } from '../../lib/theme';

type FieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  note?: string;
  rightElement?: ReactNode;
};

export function Field({ label, error, note, rightElement, onFocus, onBlur, style, ...inputProps }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, focused && styles.rowFocused, !!error && styles.rowError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={editorial.inkFaint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {rightElement}
      </View>
      {error || note ? <Text style={[styles.note, !!error && styles.noteError]}>{error ?? note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: editorial.inkSoft,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: editorial.line,
    paddingBottom: 8,
  },
  rowFocused: {
    borderBottomColor: editorial.burgundy,
  },
  rowError: {
    borderBottomColor: editorial.error,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15.5,
    color: editorial.ink,
    padding: 0,
  },
  note: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: editorial.inkFaint,
    marginTop: 6,
  },
  noteError: {
    color: editorial.error,
  },
});
