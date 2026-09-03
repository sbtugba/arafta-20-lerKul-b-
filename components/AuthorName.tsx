import { StyleSheet, Text, type TextStyle } from 'react-native';

import { colors, type } from '../lib/theme';

// "İsim @kullaniciadi" — isim vurgulu (nameStyle çağıran ekrandan gelir),
// @kullaniciadi bilerek silik: bir kimlik etiketi, ikinci bir isim değil.
export function AuthorName({
  displayName,
  username,
  nameStyle,
}: {
  displayName: string | null;
  username: string | null;
  nameStyle: TextStyle;
}) {
  if (displayName && username) {
    return (
      <Text style={nameStyle}>
        {displayName} <Text style={styles.handle}>@{username}</Text>
      </Text>
    );
  }
  if (displayName) return <Text style={nameStyle}>{displayName}</Text>;
  if (username) return <Text style={[nameStyle, styles.handle]}>@{username}</Text>;
  return <Text style={nameStyle}>biri</Text>;
}

const styles = StyleSheet.create({
  handle: {
    fontFamily: type.bodyMedium,
    color: colors.bordoMuted,
  },
});
