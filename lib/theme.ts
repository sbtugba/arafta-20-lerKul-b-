// Arafta tasarım tokenları — tıklanabilir prototiple (arafta-prototype.html) birebir eşleşir.

export const colors = {
  cream: '#FBF3E6',
  creamDim: '#F2E4CE',
  creamLine: 'rgba(74,18,32,0.12)',
  bordo: '#2E0000',
  bordoDeep: '#220810',
  bordoInk: '#1D070D',
  bordoMuted: '#7C4B54',
  gold: '#CB9A4E',
  goldPale: '#E7CE9C',
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
  burgundy: '#2E0000',
  ink: '#2A1810',
  inkSoft: '#7A6A5C',
  inkFaint: '#A8998A',
  line: 'rgba(42,24,16,0.13)',
  error: '#A6432F',
  success: '#3E6B4A',
} as const;


// Keşfet ekranı için — kendi kapalı renk sistemi. Uygulamanın geri kalanı
// yukarıdaki `colors` bordo/altın tonlarını kullanıyor; bunlar isteyerek
// farklı (biraz daha canlı, "premium editorial") ve yalnızca Keşfet + hashtag
// detay ekranında kullanılıyor, global markayı etkilemiyor.
export const discover = {
  cream: '#FBF3E6',
  creamSecondary: '#F5ECDD', // = editorial.ivory ile birebir
  bordo: '#2E0000',
  bordoDeep: '#4A1220',
  bordoLight: '#B85C74',
  goldLight: '#E8C888',
  ink: '#2B1710',
  inkSoft: '#8C7364',
} as const;

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
