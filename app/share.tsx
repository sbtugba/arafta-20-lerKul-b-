import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { colors, radii, type } from '../lib/theme';
import { rubberband, springs } from '../lib/motion';
import { useCreatePost } from '../hooks/usePosts';
import { MaskIcon, PersonIcon, PlusIcon } from '../components/icons';

type Mode = 'Anonim' | 'Profilim';

const SHEET_TRAVEL = 480;
const DISMISS_THRESHOLD = SHEET_TRAVEL * 0.32;
const FLING_VELOCITY = 900;

export default function ShareModal() {
  const [step, setStep] = useState<'picker' | 'composer'>('picker');
  const [mode, setMode] = useState<Mode>('Anonim');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  const createPost = useCreatePost();

  // §12 materialize: enters translating up *and* scaling in, not a plain slide.
  const translateY = useSharedValue(SHEET_TRAVEL);
  const scale = useSharedValue(0.94);

  useEffect(() => {
    translateY.value = withSpring(0, springs.momentum);
    scale.value = withSpring(1, springs.momentum);
  }, [scale, translateY]);

  function goBack() {
    router.back();
  }

  function animateClose(velocity = 0) {
    translateY.value = withSpring(SHEET_TRAVEL, { ...springs.move, velocity }, (finished) => {
      if (finished) runOnJS(goBack)();
    });
    scale.value = withTiming(0.94, { duration: 220 });
  }

  // §2 §3 §9 — 1:1 drag, rubber-band past the open position, live value stays interruptible.
  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY < 0 ? rubberband(e.translationY, SHEET_TRAVEL, 0.5) : e.translationY;
    })
    .onEnd((e) => {
      // §6 — decide by projected motion (position + velocity), not position alone.
      const shouldDismiss = translateY.value > DISMISS_THRESHOLD || e.velocityY > FLING_VELOCITY;
      if (shouldDismiss) {
        translateY.value = withSpring(SHEET_TRAVEL, { ...springs.move, velocity: e.velocityY }, (finished) => {
          if (finished) runOnJS(goBack)();
        });
      } else {
        // §5 — hand off the release velocity so the snap-back doesn't seam.
        translateY.value = withSpring(0, { ...springs.momentum, velocity: e.velocityY });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(1, 1 - translateY.value / SHEET_TRAVEL)) * 0.42,
  }));

  function openComposer(m: Mode) {
    setMode(m);
    setStep('composer');
  }

  function commitTag() {
    const clean = tagInput.trim().toLocaleLowerCase('tr-TR').replace(/^#/, '');
    if (clean) setTags((t) => Array.from(new Set([...t, clean])));
    setTagInput('');
    setAddingTag(false);
  }

  async function submit() {
    if (!body.trim()) return;
    await createPost.mutateAsync({
      body: body.trim(),
      tags: tags.length ? tags : ['arafta'],
      isAnonymous: mode === 'Anonim',
    });
    animateClose();
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => animateClose()} />
      </Animated.View>

      <Animated.View style={[styles.sheetWrap, sheetStyle]}>
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <GestureDetector gesture={dragGesture}>
              <View style={styles.handleZone}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>

            {step === 'picker' ? (
              <View style={styles.picker}>
                <Text style={styles.title}>Aklından ne geçiyor?</Text>

                <Pressable style={styles.option} onPress={() => openComposer('Anonim')}>
                  <View style={styles.optionIcon}>
                    <MaskIcon size={17} color={colors.bordo} />
                  </View>
                  <View>
                    <Text style={styles.optionTitle}>Anonim paylaş</Text>
                    <Text style={styles.optionSub}>Kimliğin görünmez</Text>
                  </View>
                </Pressable>

                <Pressable style={styles.option} onPress={() => openComposer('Profilim')}>
                  <View style={styles.optionIcon}>
                    <PersonIcon size={17} color={colors.bordo} />
                  </View>
                  <View>
                    <Text style={styles.optionTitle}>Ben olarak paylaş</Text>
                    <Text style={styles.optionSub}>Profilinle görünür</Text>
                  </View>
                </Pressable>
              </View>
            ) : (
              <View style={styles.composer}>
                <Text style={styles.title}>Aklından ne geçiyor?</Text>

                <TextInput
                  style={styles.textarea}
                  placeholder="Bugün kafanda kalan şeyi bırak..."
                  placeholderTextColor={colors.bordoMuted}
                  multiline
                  autoFocus
                  value={body}
                  onChangeText={setBody}
                />

                <View style={styles.tagRow}>
                  {tags.map((t) => (
                    <View key={t} style={styles.tagChip}>
                      <Text style={styles.tagChipLabel}>#{t}</Text>
                    </View>
                  ))}
                  {addingTag ? (
                    <TextInput
                      style={styles.tagInput}
                      autoFocus
                      value={tagInput}
                      onChangeText={setTagInput}
                      placeholder="konu"
                      placeholderTextColor={colors.bordoMuted}
                      onSubmitEditing={commitTag}
                      onBlur={commitTag}
                      returnKeyType="done"
                    />
                  ) : null}
                </View>

                <View style={styles.bottomRow}>
                  <View style={styles.modeToggle}>
                    <Pressable style={[styles.modeBtn, mode === 'Anonim' && styles.modeBtnOn]} onPress={() => setMode('Anonim')}>
                      <Text style={[styles.modeLabel, mode === 'Anonim' && styles.modeLabelOn]}>Anonim</Text>
                    </Pressable>
                    <Pressable style={[styles.modeBtn, mode === 'Profilim' && styles.modeBtnOn]} onPress={() => setMode('Profilim')}>
                      <Text style={[styles.modeLabel, mode === 'Profilim' && styles.modeLabelOn]}>Profilim</Text>
                    </Pressable>
                  </View>

                  <Pressable style={styles.tagAdd} onPress={() => setAddingTag(true)} hitSlop={8}>
                    <PlusIcon size={13} color={colors.bordo} />
                    <Text style={styles.tagAddLabel}>konu ekle</Text>
                  </Pressable>
                </View>

                <Pressable
                  style={[styles.dropBtn, !body.trim() && styles.dropBtnDisabled]}
                  disabled={!body.trim() || createPost.isPending}
                  onPress={submit}
                >
                  <Text style={styles.dropLabel}>{createPost.isPending ? 'Bırakılıyor…' : 'Bırak.'}</Text>
                </Pressable>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: colors.bordoDeep,
  },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '22%',
  },
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    shadowColor: colors.bordoDeep,
    shadowOpacity: 0.3,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -10 },
    elevation: 20,
  },
  handleZone: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.creamLine,
  },
  title: {
    fontFamily: type.bodyBold,
    fontSize: 17,
    color: colors.bordoInk,
    textAlign: 'center',
    marginBottom: 18,
  },
  picker: {
    paddingHorizontal: 22,
    paddingTop: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.creamDim,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontFamily: type.bodyBold,
    fontSize: 15,
    color: colors.bordo,
  },
  optionSub: {
    fontFamily: type.body,
    fontSize: 12.5,
    color: colors.bordoMuted,
    marginTop: 2,
  },
  composer: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 8,
    flex: 1,
  },
  textarea: {
    minHeight: 120,
    fontFamily: type.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.bordoInk,
    textAlignVertical: 'top',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: colors.creamDim,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  tagChipLabel: {
    fontFamily: type.bodyBold,
    fontSize: 12.5,
    color: colors.bordo,
  },
  tagInput: {
    fontFamily: type.body,
    fontSize: 13,
    color: colors.bordoInk,
    backgroundColor: colors.creamDim,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 11,
    minWidth: 80,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.creamLine,
    paddingTop: 14,
    marginTop: 4,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.creamDim,
    borderRadius: 999,
    padding: 3,
  },
  modeBtn: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
  },
  modeBtnOn: {
    backgroundColor: colors.bordo,
  },
  modeLabel: {
    fontFamily: type.bodyBold,
    fontSize: 12.5,
    color: colors.bordoMuted,
  },
  modeLabelOn: {
    color: colors.cream,
  },
  tagAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tagAddLabel: {
    fontFamily: type.bodySemibold,
    fontSize: 13,
    color: colors.bordo,
  },
  dropBtn: {
    backgroundColor: colors.bordo,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  dropBtnDisabled: {
    opacity: 0.45,
  },
  dropLabel: {
    fontFamily: type.bodyBold,
    fontSize: 15,
    color: colors.cream,
  },
});
