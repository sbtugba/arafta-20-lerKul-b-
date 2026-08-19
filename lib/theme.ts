// Arafta tasarım tokenları — tıklanabilir prototiple (arafta-prototype.html) birebir eşleşir.

export const colors = {
  cream: '#FBF3E6',
  creamDim: '#F2E4CE',
  creamLine: 'rgba(74,18,32,0.12)',
  bordo: '#380000',
  bordoDeep: '#220810',
  bordoInk: '#1D070D',
  bordoMuted: '#7C4B54',
  gold: '#CB9A4E',
  goldPale: '#E7CE9C',
  goldGlow: 'rgba(203,154,78,0.55)',
} as const;

export const radii = {
  card: 22,
  chip: 999,
  sheet: 28,
} as const;

// Auth ve Profil ekranları için — "Onboarding & Authentication" ve "Profilim &
// Profil Düzenleme" prototipleriyle geldi: daha az bordo, pill değil ince
// köşeli, editoryal bir alt sistem. Geri kalan uygulama hâlâ yukarıdaki
// bordo/gold paletini kullanıyor; tüm uygulamayı buna taşımak ayrı bir karar.
export const editorial = {
  cream: '#FAF3E9',
  ivory: '#F5ECDD',
  beige: '#EDE0CB',
  burgundy: '#380000',
  burgundyDeep: '#4A1526',
  ink: '#2A1810',
  inkSoft: '#7A6A5C',
  inkFaint: '#A8998A',
  line: 'rgba(42,24,16,0.13)',
  error: '#A6432F',
  errorBg: '#F3E1DA',
  success: '#3E6B4A',
} as const;

// Ayarlar → Görünüm → Koyu tema. Jenerik ters çevirme değil, Arafta'nın
// bordo + koyu kahverengi estetiğine uygun kendi paleti (bkz. arafta-settings
// prototipi). Şu an yalnızca EditorialThemeProvider ile sarılı ekranlarda
// (Ayarlar, ileride Auth/Profil) devreye giriyor — geri kalan uygulama etkilenmez.
export const editorialDark = {
  cream: '#241512',
  ivory: '#2E1B17',
  beige: '#3A231D',
  burgundy: '#D97A93',
  burgundyDeep: '#B85A73',
  ink: '#F2E7DE',
  inkSoft: '#C9B8AC',
  inkFaint: '#8C7A6E',
  line: 'rgba(242,231,222,0.1)',
  error: '#E38267',
  errorBg: '#402420',
  success: '#7CB894',
} as const;

export type EditorialColors = Record<keyof typeof editorial, string>;

export const editorialRadii = {
  chip: 10,
  btn: 14,
  sheet: 24,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 32,
} as const;

export const type = {
  display: 'Fraunces_500Medium_Italic', // yalnız logotype için — "yazılarda süslü font yok" kararına göre gövde metinlerinde kullanılmaz
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;
