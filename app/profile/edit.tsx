import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial, editorialRadii } from '../../lib/theme';
import {
  INTEREST_OPTIONS,
  LINK_TYPES,
  QUESTION_PROMPTS,
  STATUS_OPTIONS,
  slugifyUsername,
  type ProfileLinks,
  type ProfileQuestion,
} from '../../lib/types';
import { checkUsernameAvailable, useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { useSession } from '../../providers/SessionProvider';
import { AvatarPicker } from '../../components/editorial/AvatarPicker';
import { Field } from '../../components/editorial/Field';
import { RowButton } from '../../components/editorial/RowButton';
import { Sheet } from '../../components/editorial/Sheet';
import { PrimaryButton } from '../../components/editorial/PrimaryButton';
import { ArrowLeftIcon, CheckIcon, PlusIcon } from '../../components/icons';

type SheetName = 'status' | 'interests' | 'questions' | 'links' | null;

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
  const questionsSummary = profile.questions.length ? `${profile.questions.length} soru cevaplandı` : 'Ekli değil';
  const linksSummary = Object.keys(profile.links).length ? `${Object.keys(profile.links).length} bağlantı` : 'Ekli değil';

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
            label="Görünen isim"
            placeholder="ör. Tuğba"
            value={displayName}
            onChangeText={setDisplayName}
            onBlur={() => displayName !== (profile.displayName ?? '') && save({ displayName })}
          />
          <Field
            label="Kullanıcı adı"
            placeholder="kullaniciadi"
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

        <View style={styles.section}>
          <RowButton label="Şu sıralar" value={statusSummary} onPress={() => setOpenSheet('status')} />
          <RowButton label="İlgi alanlarım" value={interestsSummary} onPress={() => setOpenSheet('interests')} />
          <RowButton label="Profil soruları" value={questionsSummary} onPress={() => setOpenSheet('questions')} />
          <RowButton label="Bağlantılar" value={linksSummary} onPress={() => setOpenSheet('links')} last />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GİZLİLİK</Text>
          <RowButton label="Görünürlük ve gizlilik ayarları" onPress={() => router.push('/settings/privacy')} last />
        </View>

        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <Text style={styles.sectionLabel}>HESAP</Text>
          <RowButton label="E-posta, şifre ve hesap" onPress={() => router.push('/settings/account-info')} last />
        </View>
      </View>

      <StatusSheet visible={openSheet === 'status'} onClose={() => setOpenSheet(null)} initial={profile.currentStatus} onSave={(v) => save({ currentStatus: v })} />
      <InterestsSheet visible={openSheet === 'interests'} onClose={() => setOpenSheet(null)} initial={profile.interests} onSave={(v) => save({ interests: v })} />
      <QuestionsSheet visible={openSheet === 'questions'} onClose={() => setOpenSheet(null)} initial={profile.questions} onSave={(v) => save({ questions: v })} />
      <LinksSheet visible={openSheet === 'links'} onClose={() => setOpenSheet(null)} initial={profile.links} onSave={(v) => save({ links: v })} />
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

// ---------------------------------------------------------------------------
function QuestionsSheet({
  visible,
  onClose,
  initial,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial: ProfileQuestion[];
  onSave: (v: ProfileQuestion[]) => void;
}) {
  const [questions, setQuestions] = useState<ProfileQuestion[]>(initial);
  const [draftPrompt, setDraftPrompt] = useState<string | null>(null);
  const [draftAnswer, setDraftAnswer] = useState('');

  useEffect(() => {
    if (visible) {
      setQuestions(initial);
      setDraftPrompt(null);
      setDraftAnswer('');
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  function commitAndClose(next: ProfileQuestion[]) {
    setQuestions(next);
    onSave(next);
  }

  const remaining = QUESTION_PROMPTS.filter((p) => !questions.some((q) => q.q === p));

  if (draftPrompt) {
    return (
      <Sheet
        visible={visible}
        onClose={onClose}
        title="Cevapla"
        footer={
          <PrimaryButton
            label="Ekle"
            disabled={!draftAnswer.trim()}
            onPress={() => {
              const next = [...questions, { q: draftPrompt, a: draftAnswer.trim() }];
              setDraftPrompt(null);
              setDraftAnswer('');
              commitAndClose(next);
            }}
          />
        }
      >
        <Text style={styles.qPrompt}>{draftPrompt}</Text>
        <Field label="" placeholder="Kısaca yaz..." multiline value={draftAnswer} onChangeText={setDraftAnswer} style={{ minHeight: 60 }} />
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Profil soruları" footer={<PrimaryButton label="Bitti" onPress={onClose} />}>
      {questions.map((q, idx) => (
        <View key={idx} style={styles.qaItem}>
          <Text style={styles.qaQ}>{q.q}</Text>
          <Text style={styles.qaA}>&quot;{q.a}&quot;</Text>
          <Text
            style={styles.removeLink}
            onPress={() => {
              const next = questions.filter((_, i) => i !== idx);
              commitAndClose(next);
            }}
          >
            Kaldır
          </Text>
        </View>
      ))}
      {remaining.map((p) => (
        <Pressable key={p} style={styles.qPromptRow} onPress={() => setDraftPrompt(p)}>
          <Text style={styles.qPromptRowText}>{p}</Text>
          <PlusIcon size={13} color={editorial.burgundy} />
        </Pressable>
      ))}
      {remaining.length === 0 && questions.length === 0 ? <Text style={styles.emptyNote}>Henüz soru yok.</Text> : null}
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
function LinksSheet({
  visible,
  onClose,
  initial,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial: ProfileLinks;
  onSave: (v: ProfileLinks) => void;
}) {
  const [links, setLinks] = useState<ProfileLinks>(initial);
  const [editingKey, setEditingKey] = useState<keyof ProfileLinks | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (visible) {
      setLinks(initial);
      setEditingKey(null);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(key: keyof ProfileLinks) {
    setEditingKey(key);
    setDraft(links[key] ?? '');
  }

  function commitEdit() {
    if (!editingKey) return;
    const next = { ...links };
    const cleaned = draft.trim().replace(/^@/, '');
    if (cleaned) next[editingKey] = cleaned;
    else delete next[editingKey];
    setLinks(next);
    setEditingKey(null);
    onSave(next);
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Bağlantılar" footer={<PrimaryButton label="Bitti" onPress={onClose} />}>
      {LINK_TYPES.map(({ key, name }) => (
        <View key={key} style={styles.linkRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.linkName}>{name}</Text>
            {editingKey === key ? (
              <TextInput
                autoFocus
                value={draft}
                onChangeText={setDraft}
                onBlur={commitEdit}
                onSubmitEditing={commitEdit}
                placeholder="kullaniciadi"
                placeholderTextColor={editorial.inkFaint}
                style={styles.linkInput}
              />
            ) : (
              <Text style={styles.linkValue}>{links[key] ? `@${links[key]}` : 'Bağlı değil'}</Text>
            )}
          </View>
          {editingKey !== key ? (
            <Text style={styles.linkAction} onPress={() => startEdit(key)}>
              {links[key] ? 'Düzenle' : 'Bağlantı ekle'}
            </Text>
          ) : null}
        </View>
      ))}
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
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: editorial.burgundy,
    marginBottom: 6,
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
    marginBottom: 6,
  },
  removeLink: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: editorial.error,
  },
  qPrompt: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 16,
    color: editorial.ink,
    marginBottom: 14,
  },
  qPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  qPromptRowText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: editorial.ink,
    flex: 1,
    marginRight: 8,
  },
  emptyNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: editorial.inkSoft,
    paddingVertical: 10,
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  linkName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: editorial.ink,
  },
  linkValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: editorial.inkFaint,
    marginTop: 2,
  },
  linkInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: editorial.ink,
    borderBottomWidth: 1,
    borderBottomColor: editorial.burgundy,
    paddingVertical: 2,
    marginTop: 2,
  },
  linkAction: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12.5,
    color: editorial.burgundy,
  },
});
