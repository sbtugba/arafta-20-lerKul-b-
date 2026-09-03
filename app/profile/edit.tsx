import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial, editorialRadii } from '../../lib/theme';
import { INTEREST_OPTIONS, STATUS_OPTIONS, slugifyUsername } from '../../lib/types';
import { checkUsernameAvailable, useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { useSession } from '../../providers/SessionProvider';
import { AvatarPicker } from '../../components/editorial/AvatarPicker';
import { Field } from '../../components/editorial/Field';
import { RowButton } from '../../components/editorial/RowButton';
import { Sheet } from '../../components/editorial/Sheet';
import { PrimaryButton } from '../../components/editorial/PrimaryButton';
import { ArrowLeftIcon, CheckIcon } from '../../components/icons';

type SheetName = 'status' | 'interests' | null;

export default function ProfileEditScreen() {
  const { userId } = useSession();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [usernameNote, setUsernameNote] = useState('3–20 karakter, küçük harf/rakam/alt çizgi. Türkçe karakter otomatik dönüştürülür.');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const [savedPulse, setSavedPulse] = useState(false);
  const [openSheet, setOpenSheet] = useState<SheetName>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName ?? '');
    setUsername(profile.username ?? '');
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!profile) return;
    setBio(profile.bio ?? '');
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function flashSaved() {
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1200);
  }

  function save(patch: Parameters<typeof updateProfile.mutate>[0]) {
    updateProfile.mutate(patch, { onSuccess: flashSaved });
  }

  function onUsernameChange(raw: string) {
    const clean = slugifyUsername(raw);
    setUsername(clean);
    if (clean.length < 3) {
      setUsernameStatus('idle');
      setUsernameNote('3–20 karakter, küçük harf/rakam/alt çizgi. Türkçe karakter otomatik dönüştürülür.');
      return;
    }
    setUsernameStatus('checking');
    setUsernameNote('Kontrol ediliyor…');
  }

  // debounced availability check
  useEffect(() => {
    if (username.length < 3 || !userId) return;
    if (username === profile?.username) {
      setUsernameStatus('ok');
      setUsernameNote('Bu senin kullanıcı adın.');
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(username, userId);
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
  }, [username, userId, profile?.username]);

  function commitUsername() {
    if (usernameStatus !== 'ok' || username === profile?.username) return;
    save({ username });
  }

  if (!profile) return null;

  const statusSummary = profile.currentStatus.length ? profile.currentStatus.join(' · ') : 'Ekli değil';
  const interestsSummary = profile.interests.length ? profile.interests.join(', ') : 'Ekli değil';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={10}>
          <ArrowLeftIcon size={20} color={editorial.ink} />
        </Pressable>
        <Text style={styles.topTitle}>Profili düzenle</Text>
        <Text style={[styles.savedPill, savedPulse && styles.savedPillShow]}>✓ Kaydedildi</Text>
      </View>

      <View style={styles.scroll}>
        <AvatarPicker profile={profile} />

        <View style={styles.section}>
          <Field
            label="İsim"
            placeholder="Adını Ekle"
            value={displayName}
            onChangeText={setDisplayName}
            onBlur={() => displayName !== (profile.displayName ?? '') && save({ displayName })}
          />
          <Field
            label="Kullanıcı adı"
            placeholder="Kullanıcı Adını Ekle"
            autoCapitalize="none"
            value={username}
            onChangeText={onUsernameChange}
            onBlur={commitUsername}
            error={usernameStatus === 'taken' ? usernameNote : undefined}
            note={usernameStatus !== 'taken' ? usernameNote : undefined}
            rightElement={usernameStatus === 'ok' ? <CheckIcon size={14} color={editorial.success} /> : undefined}
          />
          <Field
            label={`Hakkımda  ${bio.length} / 180`}
            placeholder="Şu sıralar hayatında neler oluyor?"
            multiline
            maxLength={180}
            value={bio}
            onChangeText={setBio}
            onBlur={() => bio !== (profile.bio ?? '') && save({ bio })}
            style={{ minHeight: 60 }}
          />
        </View>

        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <RowButton label="Şu sıralar" value={statusSummary} onPress={() => setOpenSheet('status')} />
          <RowButton label="İlgi alanlarım" value={interestsSummary} onPress={() => setOpenSheet('interests')} last />
        </View>
      </View>

      <StatusSheet visible={openSheet === 'status'} onClose={() => setOpenSheet(null)} initial={profile.currentStatus} onSave={(v) => save({ currentStatus: v })} />
      <InterestsSheet visible={openSheet === 'interests'} onClose={() => setOpenSheet(null)} initial={profile.interests} onSave={(v) => save({ interests: v })} />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
function StatusSheet({
  visible,
  onClose,
  initial,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial: string[];
  onSave: (v: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [custom, setCustom] = useState('');

  useEffect(() => {
    if (visible) {
      setSelected(initial);
      setCustom('');
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(opt: string) {
    setSelected((s) => (s.includes(opt) ? s.filter((x) => x !== opt) : [...s, opt]));
  }

  function done() {
    const custoTrimmed = custom.trim();
    onSave(custoTrimmed ? [...selected, custoTrimmed] : selected);
    onClose();
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Şu sıralar..." footer={<PrimaryButton label="Bitti" onPress={done} />}>
      {STATUS_OPTIONS.map((opt) => {
        const on = selected.includes(opt);
        return (
          <Pressable key={opt} style={styles.statusOption} onPress={() => toggle(opt)}>
            <View style={[styles.statusDot, on && styles.statusDotOn]}>{on ? <CheckIcon size={11} color={editorial.cream} /> : null}</View>
            <Text style={[styles.statusLabel, on && styles.statusLabelOn]}>{opt}</Text>
          </Pressable>
        );
      })}
      <View style={{ marginTop: 8 }}>
        <Field label="ya da kendi cümleni yaz" placeholder="ör. biraz her şeyim" value={custom} onChangeText={setCustom} />
      </View>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
function InterestsSheet({
  visible,
  onClose,
  initial,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial: string[];
  onSave: (v: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial);

  useEffect(() => {
    if (visible) setSelected(initial);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(opt: string) {
    setSelected((s) => (s.includes(opt) ? s.filter((x) => x !== opt) : [...s, opt]));
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="İlgi alanların"
      footer={
        <PrimaryButton
          label="Bitti"
          onPress={() => {
            onSave(selected);
            onClose();
          }}
        />
      }
    >
      <View style={styles.chipGrid}>
        {INTEREST_OPTIONS.map((opt) => {
          const on = selected.includes(opt);
          return (
            <Pressable key={opt} style={[styles.interestChip, on && styles.interestChipOn]} onPress={() => toggle(opt)}>
              <Text style={[styles.interestChipLabel, on && styles.interestChipLabelOn]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: editorial.cream,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 16,
    color: editorial.ink,
  },
  savedPill: {
    width: 80,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: editorial.success,
    textAlign: 'right',
    opacity: 0,
  },
  savedPillShow: {
    opacity: 1,
  },
  section: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },

  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  statusDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: editorial.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotOn: {
    backgroundColor: editorial.burgundy,
    borderColor: editorial.burgundy,
  },
  statusLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14.5,
    color: editorial.inkSoft,
  },
  statusLabelOn: {
    fontFamily: 'Inter_600SemiBold',
    color: editorial.ink,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    paddingBottom: 4,
  },
  interestChip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: editorialRadii.chip,
    borderWidth: 1.5,
    borderColor: editorial.line,
  },
  interestChipOn: {
    backgroundColor: editorial.burgundy,
    borderColor: editorial.burgundy,
  },
  interestChipLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13.5,
    color: editorial.ink,
  },
  interestChipLabelOn: {
    color: editorial.cream,
  },
});
