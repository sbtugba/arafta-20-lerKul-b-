import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, type } from '../lib/theme';

// Paylaşım kartları ve yorumlarda kullanılan ortak avatar: isimli kullanıcıda
// gerçek profil fotoğrafı (yoksa baş harfi), anonimde ise kimliği değil
// "burada kimsin belli değil ama buradasın" hissini taşıyan bordo + altın "?".
export function Avatar({
  isAnonymous,
  avatarUrl,
  name,
  size = 38,
}: {
  isAnonymous: boolean;
  avatarUrl?: string | null;
  name: string;
  size?: number;
}) {
  const dim = { width: size, height: size, borderRadius: size / 2 };

  if (isAnonymous) {
    return (
      <LinearGradient colors={[colors.bordo, colors.bordoDeep]} style={[styles.circle, dim]}>
        <Text style={[styles.mark, { fontSize: size * 0.46 }]}>?</Text>
      </LinearGradient>
    );
  }

  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={[styles.circle, dim]} />;
  }

  const initial = name.charAt(0).toLocaleUpperCase('tr-TR');
  return (
    <View style={[styles.circle, dim, styles.fallback]}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: colors.goldPale,
  },
  mark: {
    fontFamily: type.display,
    color: colors.gold,
  },
  initial: {
    fontFamily: type.display,
    color: colors.bordo,
  },
});
