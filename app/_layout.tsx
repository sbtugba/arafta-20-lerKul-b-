import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Fraunces_500Medium_Italic, Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { colors } from '../lib/theme';
import { SessionProvider, useSession } from '../providers/SessionProvider';
import { EditorialThemeProvider } from '../providers/EditorialThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <EditorialThemeProvider>
            <SafeAreaProvider>
              <AppGate />
            </SafeAreaProvider>
          </EditorialThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function AppGate() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium_Italic,
    Fraunces_600SemiBold_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const { session, loading: sessionLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  const ready = fontsLoaded && !sessionLoading;

  const hideSplash = useCallback(async () => {
    if (ready) await SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  // Guards protected routes even if the session disappears mid-use (e.g. sign out,
  // an expired token) — the splash screen owns the *initial* routing decision,
  // this just keeps things honest afterwards.
  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    const protectedSegments = ['(tabs)', 'share', 'settings', 'profile', 'post'];
    const inProtectedGroup = protectedSegments.includes(segments[0] as string);

    if (!session && inProtectedGroup) {
      router.replace('/(auth)');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [ready, session, segments, router]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bordo }} />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="post" />
      <Stack.Screen
        name="share"
        options={{ presentation: 'transparentModal', animation: 'none' }}
      />
    </Stack>
  );
}
