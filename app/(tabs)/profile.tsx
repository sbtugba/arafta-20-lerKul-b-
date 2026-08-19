import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial, editorialRadii } from '../../lib/theme';
import type { Profile } from '../../lib/types';
import { useProfile } from '../../hooks/useProfile';
import { CheckIcon, GearIcon, LocationPinIcon, MoreIcon, PersonIcon } from '../../components/icons';

function completion(p: Profile): number {
  let n = 0;
  if (p.username) n++;
  if (p.avatarUrl) n++;
  if (p.bio) n++;
  if (p.currentStatus.length) n++;
  if (p.interests.length) n++;
  return Math.round((n / 5) * 100);
}

function isTouched(p: Profile): boolean {
  return !!(p.bio || p.avatarUrl || p.interests.length || p.questions.length || p.currentStatus.length);
}

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
      <ScrollView contentContainerStyle={styles.content}>
        {!isLoading && profile ? (isTouched(profile) ? <FullProfile profile={profile} /> : <Nudge profile={profile} />) : null}
      </ScrollView>
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

function Nudge({ profile }: { profile: Profile }) {
  const pct = completion(profile);
  const checks: [string, boolean][] = [
    ['Kullanıcı adı', !!profile.username],
    ['Profil fotoğrafı', !!profile.avatarUrl],
    ['Hakkında', !!profile.bio],
    ['İlgi alanları', profile.interests.length > 0],
    ['Şu sıralar', profile.currentStatus.length > 0],
  ];

  return (
    <View style={styles.nudge}>
      <Avatar profile={profile} size={84} />
      <Text style={styles.nudgeUsername}>@{profile.username || 'kullaniciadi'}</Text>
      <Text style={styles.nudgeHeadline}>Profilini biraz daha sen yap.</Text>
      <Text style={styles.nudgeSub}>
        İnsanların seni daha iyi tanıması için profiline birkaç şey ekleyebilirsin — istediğin zaman, istediğin kadar.
      </Text>

      <View style={styles.progressWrap}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Profilin</Text>
          <Text style={styles.progressLabel}>%{pct}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
      </View>

      <EditButton />

      <View style={styles.checklist}>
        {checks.map(([label, done]) => (
          <View key={label} style={styles.checkItem}>
            <View style={[styles.checkDot, done && styles.checkDotDone]}>{done ? <CheckIcon size={10} color={editorial.cream} /> : null}</View>
            <Text style={[styles.checkLabel, done && styles.checkLabelDone]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EditButton() {
  return (
    <Text style={styles.editBtn} onPress={() => router.push('/profile/edit')}>
      Profili düzenle
    </Text>
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
          {profile.locationVisible && profile.location ? (
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
          <Text style={styles.emptyPrompt}>&quot;Şu sıralar hayatında neler oluyor?&quot;</Text>
          <Text style={styles.emptyAdd} onPress={() => router.push('/profile/edit')}>
            + Bio ekle
          </Text>
        </View>
      )}

      <EditButton />

      {statusHead ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ŞU SIRALAR</Text>
          <Text style={styles.statusLine}>
            {statusHead}
            {statusExtra > 0 ? <Text style={styles.statusExtra}> +{statusExtra}</Text> : null}
          </Text>
        </View>
      ) : null}

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

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PROFİL SORULARI</Text>
        {profile.questions.length ? (
          profile.questions.map((q, idx) => (
            <View key={idx} style={[styles.qaItem, idx === profile.questions.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.qaQ}>{q.q}</Text>
              <Text style={styles.qaA}>&quot;{q.a}&quot;</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyRowTight}>
            <Text style={styles.emptyPrompt}>İstersen biraz daha kendinden bahsedebilirsin.</Text>
            <Text style={styles.emptyAdd} onPress={() => router.push('/profile/edit')}>
              + Bir soru cevapla
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

  // nudge
  nudge: {
    alignItems: 'center',
    paddingTop: 24,
  },
  nudgeUsername: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: editorial.inkSoft,
    marginTop: 12,
    marginBottom: 16,
  },
  nudgeHeadline: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 22,
    color: editorial.ink,
    marginBottom: 8,
  },
  nudgeSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    lineHeight: 20,
    color: editorial.inkSoft,
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: 22,
  },
  progressWrap: {
    width: '100%',
    marginBottom: 20,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  progressLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: editorial.inkSoft,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: editorial.beige,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: editorial.burgundy,
    borderRadius: 2,
  },
  checklist: {
    width: '100%',
    marginTop: 18,
    gap: 9,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: editorial.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDotDone: {
    backgroundColor: editorial.burgundy,
    borderColor: editorial.burgundy,
  },
  checkLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: editorial.inkFaint,
  },
  checkLabelDone: {
    color: editorial.ink,
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
  editBtn: {
    minHeight: 46,
    lineHeight: 46,
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: editorial.burgundy,
    color: editorial.burgundy,
    borderRadius: editorialRadii.btn,
    fontFamily: 'Inter_700Bold',
    fontSize: 14.5,
    marginBottom: 26,
    overflow: 'hidden',
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
  qaItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  qaQ: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: editorial.inkSoft,
    marginBottom: 4,
  },
  qaA: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 15,
    color: editorial.ink,
    lineHeight: 22,
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
