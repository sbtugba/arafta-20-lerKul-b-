import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, type } from '../lib/theme';
import { ArrowRightIcon } from '../components/icons';
import { useSession } from '../providers/SessionProvider';

type Phase = 'splash' | 'breath';

export default function ThresholdScreen() {
  const { session } = useSession();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [phase, setPhase] = useState<Phase>('splash');

  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordRise = useRef(new Animated.Value(8)).current;
  const doorOpacity = useRef(new Animated.Value(0)).current;
  const seamScale = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineRise = useRef(new Animated.Value(8)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaRise = useRef(new Animated.Value(8)).current;
  const leave = useRef(new Animated.Value(0)).current;

  // breath phase — the "kısa nefes alanı" between the threshold and authentication
  const breathWarmth = useRef(new Animated.Value(0)).current;
  const [breathStep, setBreathStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      wordOpacity.setValue(1);
      wordRise.setValue(0);
      doorOpacity.setValue(1);
      seamScale.setValue(1);
      taglineOpacity.setValue(1);
      taglineRise.setValue(0);
      ctaOpacity.setValue(1);
      ctaRise.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(wordRise, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(50),
      Animated.timing(doorOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(500),
      Animated.timing(seamScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(taglineRise, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(1250),
      Animated.parallel([
        Animated.timing(ctaOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(ctaRise, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();
  }, [reduceMotion]);

  function enter() {
    // Already signed in (returning to a warm session) — no need to breathe through
    // the "you don't know what's next" framing again, just cross into the app.
    if (session) {
      Animated.timing(leave, { toValue: 1, duration: reduceMotion ? 0 : 400, useNativeDriver: true }).start(() => {
        router.replace('/(tabs)');
      });
      return;
    }

    Animated.timing(leave, { toValue: 1, duration: reduceMotion ? 0 : 400, useNativeDriver: true }).start(() => {
      setPhase('breath');
    });
  }

  // Nefes ekranı zamanlaması — her satır kendi mount'unda fade-in yapar (bkz. BreathLine),
  // burada sadece hangi satırın aktif olduğunu ve ne zaman auth'a geçileceğini yönetiyoruz.
  // Eski hali Animated.sequence + tek Animated.Value ile karışık native/JS driver kullanıp
  // ilk satırı yavaş cihazda görünmeden atlıyordu.
  useEffect(() => {
    if (phase !== 'breath') return;
    if (reduceMotion) {
      router.replace('/(auth)');
      return;
    }

    const LINE_MS = 2100; // her satırın ekranda kalma süresi (fade dahil)
    const timers = [
      setTimeout(() => setBreathStep(1), 150),
      setTimeout(() => setBreathStep(2), 150 + LINE_MS),
      // arka planı ikinci satırla birlikte bordo'dan cream'e ısıt (renk interp -> JS driver)
      setTimeout(
        () => Animated.timing(breathWarmth, { toValue: 1, duration: 1400, useNativeDriver: false }).start(),
        150 + LINE_MS + 200,
      ),
      setTimeout(() => router.replace('/(auth)'), 150 + LINE_MS * 2),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduceMotion]);

  if (phase === 'breath') {
    const bg = breathWarmth.interpolate({ inputRange: [0, 1], outputRange: [colors.bordo, colors.cream] });
    const lineColor = breathWarmth.interpolate({ inputRange: [0, 1], outputRange: [colors.cream, colors.bordo] });

    return (
      <Animated.View key="breath" style={[styles.container, { backgroundColor: bg }]}>
        <SafeAreaView style={styles.breathSafe}>
          <View style={styles.breathLineWrap}>
            <BreathLine active={breathStep === 1} color={lineColor}>
              Henüz hiçbir şey yerine oturmadı.
            </BreathLine>
            <BreathLine active={breathStep === 2} color={lineColor} overlay>
              Burada bunu açıklaman gerekmiyor.
            </BreathLine>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  }

  return (
    <Animated.View key="splash" style={[styles.container, { opacity: leave.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={{ alignItems: 'center', opacity: wordOpacity, transform: [{ translateY: wordRise }] }}>
          <Text style={styles.wordmark}>arafta.</Text>
          <Text style={styles.subtitle}>20'ler kulübü</Text>
        </Animated.View>

        <Animated.View style={[styles.doorWrap, { opacity: doorOpacity }]}>
          <LinearGradient colors={[colors.cream, colors.goldPale]} style={styles.door} />
          <Animated.View
            style={[
              styles.seam,
              { transform: [{ translateX: -1.5 }, { scaleY: seamScale }] },
            ]}
          />
        </Animated.View>

        <View style={styles.copy}>
          <Animated.Text
            style={[styles.tagline, { opacity: taglineOpacity, transform: [{ translateY: taglineRise }] }]}
          >
            Yalnız değilsin. Burada herkes biraz arafta.
          </Animated.Text>

          <Animated.View style={{ opacity: ctaOpacity, transform: [{ translateY: ctaRise }] }}>
            <Pressable onPress={enter} style={styles.cta} hitSlop={10}>
              <Text style={styles.ctaLabel}>İçeri gir</Text>
              <ArrowRightIcon size={16} color={colors.gold} />
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

// Tek satır — mount olur olmaz kendi opacity'sini `active`'e göre yumuşatır.
// Animasyon yalnızca bu Text ekrandayken çalıştığı için "görünmeden geçme" olmaz.
function BreathLine({
  active,
  color,
  overlay = false,
  children,
}: {
  active: boolean;
  color: Animated.AnimatedInterpolation<string | number>;
  overlay?: boolean;
  children: string;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // useNativeDriver: false — aynı <Animated.Text> üstünde `color` (breathWarmth
    // renk interpolasyonu, JS driver) da animasyonlu; opacity'yi native'e taşırsak
    // "node has been moved to native" hatası çıkıyor. İkisi de JS driver olmalı.
    Animated.timing(opacity, {
      toValue: active ? 1 : 0,
      duration: active ? 600 : 400,
      useNativeDriver: false,
    }).start();
  }, [active, opacity]);

  return (
    <Animated.Text style={[styles.breathLine, overlay && styles.breathLineOverlay, { color, opacity }]}>
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bordo,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 44,
    paddingHorizontal: 28,
  },
  wordmark: {
    fontFamily: type.display,
    fontSize: 26,
    color: colors.goldPale,
  },
  subtitle: {
    fontFamily: type.body,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.gold,
    marginTop: 4,
  },
  doorWrap: {
    width: '62%',
    maxWidth: 220,
    aspectRatio: 3 / 4.2,
    alignItems: 'center',
  },
  door: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: colors.gold,
    shadowOpacity: 0.55,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  seam: {
    position: 'absolute',
    top: '6%',
    bottom: 0,
    left: '50%',
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  copy: {
    alignItems: 'center',
    gap: 22,
  },
  tagline: {
    fontFamily: type.body,
    fontSize: 15.5,
    lineHeight: 24,
    color: colors.cream,
    textAlign: 'center',
    maxWidth: 260,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  ctaLabel: {
    fontFamily: type.bodySemibold,
    fontSize: 15,
    color: colors.gold,
  },
  breathSafe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathLineWrap: {
    paddingHorizontal: 40,
  },
  breathLine: {
    fontFamily: type.display,
    fontSize: 19,
    lineHeight: 28,
    textAlign: 'center',
  },
  breathLineOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
