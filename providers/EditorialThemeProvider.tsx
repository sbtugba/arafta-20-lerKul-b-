import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { editorial, editorialDark, editorialRadii, type EditorialColors } from '../lib/theme';
import { useLocalSetting } from '../hooks/useLocalSetting';

export type ThemePreference = 'system' | 'light' | 'dark';

type EditorialThemeState = {
  colors: EditorialColors;
  radii: typeof editorialRadii;
  themePref: ThemePreference;
  setThemePref: (pref: ThemePreference) => void;
  isDark: boolean;
};

const EditorialThemeContext = createContext<EditorialThemeState>({
  colors: editorial,
  radii: editorialRadii,
  themePref: 'system',
  setThemePref: () => {},
  isDark: false,
});

// Ayarlar → Görünüm → Tema burada yaşıyor. Şu an Ayarlar ekranlarını sarıyor;
// Auth/Profil ekranları hâlâ sabit (ışık) editorial paletini kullanıyor —
// onları da buraya taşımak, tüm dosyalarında tek tek risk almamak için ayrı
// bir adım olarak bırakıldı.
export function EditorialThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePref, setThemePref] = useLocalSetting<ThemePreference>('appearance.theme', 'system');

  const isDark = themePref === 'dark' || (themePref === 'system' && systemScheme === 'dark');
  const colors = isDark ? editorialDark : editorial;

  const value = useMemo<EditorialThemeState>(
    () => ({ colors, radii: editorialRadii, themePref, setThemePref, isDark }),
    [colors, themePref, setThemePref, isDark]
  );

  return <EditorialThemeContext.Provider value={value}>{children}</EditorialThemeContext.Provider>;
}

export function useEditorialTheme() {
  return useContext(EditorialThemeContext);
}
