import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { RowButton } from '../../components/editorial/RowButton';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { SearchIcon } from '../../components/icons';

type SearchEntry = { label: string; path: string };

const SEARCH_INDEX: SearchEntry[] = [
  { label: 'Hesap Bilgileri', path: '/settings/account-info' },
  { label: 'Şifre ve Güvenlik', path: '/settings/password-security' },
  { label: 'Aktif oturumlar', path: '/settings/password-security' },
  { label: 'Gizlilik ve Görünürlük', path: '/settings/privacy' },
  { label: 'Engellenen Kullanıcılar', path: '/settings/blocked-users' },
  { label: 'Etkileşimler', path: '/settings/interactions' },
  { label: 'Bildirim Ayarları', path: '/settings/notifications' },
  { label: 'E-posta bildirimleri', path: '/settings/notifications' },
  { label: 'Etkileşim bildirimleri', path: '/settings/notifications' },
  { label: 'İçerik Tercihleri', path: '/settings/content-prefs' },
  { label: 'Görünüm', path: '/settings/appearance' },
  { label: 'Koyu tema', path: '/settings/appearance' },
  { label: 'Dil', path: '/settings/language' },
  { label: 'Veri Kullanımı', path: '/settings/data-storage' },
  { label: 'Yardım ve Destek', path: '/settings/support' },
  { label: 'Topluluk ve Güvenlik', path: '/settings/community-safety' },
  { label: 'Çıkış yap, hesabı dondur veya sil', path: '/settings/account-management' },
];

export default function SettingsHomeScreen() {
  const [query, setQuery] = useState('');

  const hits = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return null;
    return SEARCH_INDEX.filter((item) => item.label.toLocaleLowerCase('tr-TR').includes(q));
  }, [query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Ayarlar" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.searchRow}>
          <SearchIcon size={15} color={editorial.inkFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ayarları ara..."
            placeholderTextColor={editorial.inkFaint}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {hits ? (
          <View style={{ marginTop: 6 }}>
            {hits.length === 0 ? (
              <Text style={styles.empty}>Sonuç bulunamadı.</Text>
            ) : (
              hits.map((h, i) => (
                <Text key={h.label + i} style={styles.hit} onPress={() => router.push(h.path as never)}>
                  {h.label}
                </Text>
              ))
            )}
          </View>
        ) : (
          <>
            <SettingsSection label="HESABIM">
              <RowButton label="Hesap Bilgileri" onPress={() => router.push('/settings/account-info')} />
              <RowButton label="Şifre ve Güvenlik" onPress={() => router.push('/settings/password-security')} last />
            </SettingsSection>
            <SettingsSection label="GİZLİLİK">
              <RowButton label="Gizlilik ve Görünürlük" onPress={() => router.push('/settings/privacy')} />
              <RowButton label="Engellenenler" onPress={() => router.push('/settings/blocked-users')} />
              <RowButton label="Etkileşimler" onPress={() => router.push('/settings/interactions')} last />
            </SettingsSection>
            <SettingsSection label="BİLDİRİMLER">
              <RowButton label="Bildirim Ayarları" onPress={() => router.push('/settings/notifications')} last />
            </SettingsSection>
            <SettingsSection label="İÇERİK">
              <RowButton label="İçerik Tercihleri" onPress={() => router.push('/settings/content-prefs')} last />
            </SettingsSection>
            <SettingsSection label="UYGULAMA">
              <RowButton label="Görünüm" onPress={() => router.push('/settings/appearance')} />
              <RowButton label="Dil" value="Türkçe" onPress={() => router.push('/settings/language')} />
              <RowButton label="Veri Kullanımı" onPress={() => router.push('/settings/data-storage')} last />
            </SettingsSection>
            <SettingsSection label="DESTEK">
              <RowButton label="Yardım ve Destek" onPress={() => router.push('/settings/support')} />
              <RowButton label="Topluluk ve Güvenlik" onPress={() => router.push('/settings/community-safety')} last />
            </SettingsSection>
            <SettingsSection label="HESAP YÖNETİMİ" last>
              <RowButton label="Çıkış yap, hesabı dondur veya sil" onPress={() => router.push('/settings/account-management')} last />
            </SettingsSection>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  scroll: { flex: 1, paddingHorizontal: 20 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: editorial.ivory,
    borderWidth: 1,
    borderColor: editorial.line,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: editorial.ink,
  },
  hit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: editorial.ink,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: editorial.inkFaint,
    paddingVertical: 14,
  },
});
