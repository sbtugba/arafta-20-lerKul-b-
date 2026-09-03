import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial, editorialRadii } from '../../lib/theme';
import type { Profile } from '../../lib/types';
import { useProfile } from '../../hooks/useProfile';
import { GearIcon, LocationPinIcon, MoreIcon, PersonIcon } from '../../components/icons';

function initials(p: Profile): string {
  const src = p.displayName || p.username || '';
  return src ? src.charAt(0).toLocaleUpperCase('tr-TR') : '';
}

export default function ProfileScreen() {
  const { data: profile, isLoading } = useProfile();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topbar}>
        <Text style={styles.wordmark}>arafta.</Text>
        <Pressable onPress={() => router.push('/settings')} style={styles.gearBtn} hitSlop={8} accessibilityLabel="Ayarlar">
          <GearIcon size={17} color={editorial.burgundy} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>{!isLoading && profile ? <FullProfile profile={profile} /> : null}</ScrollView>
    </SafeAreaView>
  );
}

function Avatar({ profile, size }: { profile: Profile; size: number }) {
  if (profile.avatarUrl) {
    return <Image source={{ uri: profile.avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {initials(profile) ? (
        <Text style={[styles.avatarLetter, { fontSize: size * 0.36 }]}>{initials(profile)}</Text>
      ) : (
        <PersonIcon size={size * 0.42} color={editorial.inkFaint} />
      )}
    </View>
  );
}

function FullProfile({ profile }: { profile: Profile }) {
  const statusAll = profile.currentStatus;
  const statusHead = statusAll[0];
  const statusExtra = statusAll.length - 1;

  return (
    <View>
      <View style={styles.head}>
        <Avatar profile={profile} size={76} />
        <View style={{ flex: 1, paddingTop: 2 }}>
          <Text style={styles.name}>{profile.displayName || profile.username || 'sen'}</Text>
          <Text style={styles.username}>@{profile.username || 'kullaniciadi'}</Text>
          {profile.location ? (
            <View style={styles.locationRow}>
              <LocationPinIcon size={11} color={editorial.inkFaint} />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          ) : null}
        </View>
        <Pressable onPress={() => router.push('/profile/edit')} style={styles.moreBtn} hitSlop={8}>
          <MoreIcon size={18} color={editorial.inkSoft} />
        </Pressable>
      </View>

      {profile.bio ? (
        <Text style={styles.bio}>&quot;{profile.bio}&quot;</Text>
      ) : (
        <View style={styles.emptyRow}>
          <Text style={styles.emptyCaption}>Henüz kendinden bahsetmedin.</Text>
          <Text style={styles.emptyAdd} onPress={() => router.push('/profile/edit')}>
            + Bio ekle
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ŞU SIRALAR</Text>
        {statusHead ? (
          <Text style={styles.statusLine}>
            {statusHead}
            {statusExtra > 0 ? <Text style={styles.statusExtra}> +{statusExtra}</Text> : null}
          </Text>
        ) : (
          <View style={styles.emptyRowTight}>
            <Text style={styles.emptyPrompt}>Şu sıralar neler oluyor, hiç yazmadın.</Text>
            <Text style={styles.emptyAdd} onPress={() => router.push('/profile/edit')}>
              + Şu sıralar ekle
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>İLGİ ALANLARIM</Text>
        {profile.interests.length ? (
          <View style={styles.tagRow}>
            {profile.interests.map((i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagLabel}>{i}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyRowTight}>
            <Text style={styles.emptyPrompt}>Henüz ilgi alanı eklemedin.</Text>
            <Text style={styles.emptyAdd} onPress={() => router.push('/profile/edit')}>
              + İlgi alanı ekle
            </Text>
          </View>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: editorial.cream,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  gearBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: editorial.ivory,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: 'Fraunces_600SemiBold_Italic',
    fontSize: 17,
    color: editorial.burgundy,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  avatar: {
    backgroundColor: editorial.beige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'Fraunces_500Medium_Italic',
    color: editorial.inkFaint,
  },

  // full profile
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingTop: 8,
    paddingBottom: 18,
  },
  name: {
    fontFamily: 'Fraunces_600SemiBold_Italic',
    fontSize: 21,
    color: editorial.ink,
  },
  username: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: editorial.inkSoft,
    marginTop: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: editorial.inkFaint,
  },
  moreBtn: {
    padding: 4,
  },
  bio: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 16,
    lineHeight: 25,
    color: editorial.ink,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: editorial.burgundy,
    marginBottom: 8,
  },
  statusLine: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 15,
    color: editorial.ink,
    lineHeight: 22,
  },
  statusExtra: {
    fontFamily: 'Inter_700Bold',
    color: editorial.burgundy,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: editorialRadii.chip,
    borderWidth: 1,
    borderColor: editorial.line,
  },
  tagLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: editorial.ink,
  },
  emptyRow: {
    paddingVertical: 14,
    marginBottom: 4,
  },
  emptyRowTight: {
    paddingTop: 0,
  },
  emptyCaption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: editorial.inkSoft,
    marginBottom: 4,
  },
  emptyPrompt: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 15,
    color: editorial.inkSoft,
    marginBottom: 10,
  },
  emptyAdd: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13.5,
    color: editorial.burgundy,
  },
});
