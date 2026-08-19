import { Stack } from 'expo-router';

import { editorial } from '../../lib/theme';
import { ToastProvider } from '../../providers/ToastProvider';

export default function SettingsLayout() {
  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: editorial.cream } }} />
    </ToastProvider>
  );
}
