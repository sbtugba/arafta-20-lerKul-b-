import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { useSession } from '../../providers/SessionProvider';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { RowButton } from '../../components/editorial/RowButton';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { ConfirmDialog } from '../../components/editorial/ConfirmDialog';
import { SearchIcon } from '../../components/icons';

type AccountAction = 'logout' | 'delete';
type SearchEntry = { label: string; path?: string; action?: AccountAction };

const SEARCH_INDEX: SearchEntry[] = [
  { label: 'Hesap Bilgileri', path: '/settings/account-info' },
  { label: 'Şifre ve Güvenlik', path: '/settings/password-security' },
  { label: 'Aktif oturumlar', path: '/settings/password-security' },
  { label: 'Engellenen Kullanıcılar', path: '/settings/blocked-users' },
  { label: 'Bildirim Ayarları', path: '/settings/notifications' },
  { label: 'E-posta bildirimleri', path: '/settings/notifications' },
  { label: 'Etkileşim bildirimleri', path: '/settings/notifications' },
  { label: 'İçerik Tercihleri', path: '/settings/content-prefs' },
  { label: 'Yardım ve Destek', path: '/settings/support' },
  { label: 'Önbelleği temizle', path: '/settings/support' },
  { label: 'Çıkış Yap', action: 'logout' },
  { label: 'Hesabı Sil', action: 'delete' },
];

type Modal = null | 'logout' | 'delete-info' | 'delete-final';

export default function SettingsHomeScreen() {
  const { signOut } = useSession();
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);

  const hits = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return null;
    return SEARCH_INDEX.filter((item) => item.label.toLocaleLowerCase('tr-TR').includes(q));
  }, [query]);

  function runSearchHit(hit: SearchEntry) {
    if (hit.action) setModal(hit.action === 'logout' ? 'logout' : 'delete-info');
    else if (hit.path) router.push(hit.path as never);
  }

  async function handleLogout() {
    setBusy(true);
    await signOut();
    setBusy(false);
    setModal(null);
    // root layout'taki auth gate oturum kapanınca otomatik (auth)'a yönlendiriyor
  }

  async function handleDelete() {
    setBusy(true);
    Alert.alert(
      'Hesap silme',
      'Kalıcı silme işlemi güvenlik nedeniyle şu an yalnızca destek ekibi üzerinden yapılabiliyor (sunucu tarafı bir işlem gerektiriyor). Şimdilik oturumunu kapatıyoruz — destek@arafta.app üzerinden bize ulaşabilirsin.'
    );
    await signOut();
    setBusy(false);
    setModal(null);
  }

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
                <Text key={h.label + i} style={styles.hit} onPress={() => runSearchHit(h)}>
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
              <RowButton label="Engellenenler" onPress={() => router.push('/settings/blocked-users')} last />
            </SettingsSection>
            <SettingsSection label="BİLDİRİMLER">
              <RowButton label="Bildirim Ayarları" onPress={() => router.push('/settings/notifications')} last />
            </SettingsSection>
            <SettingsSection label="İÇERİK">
              <RowButton label="İçerik Tercihleri" onPress={() => router.push('/settings/content-prefs')} last />
            </SettingsSection>
            <SettingsSection label="DESTEK">
              <RowButton label="Yardım ve Destek" onPress={() => router.push('/settings/support')} last />
            </SettingsSection>
            <SettingsSection label="HESAP YÖNETİMİ" last>
              <RowButton label="Çıkış Yap" onPress={() => setModal('logout')} />
              <RowButton label="Hesabı Sil" danger onPress={() => setModal('delete-info')} last />
            </SettingsSection>
          </>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={modal === 'logout'}
        title="Çıkış yapmak istediğine emin misin?"
        body="Oturumun bu cihazda kapanacak. Tekrar giriş yapmak için e-posta ve şifren yeterli; hesabın ve paylaşımların olduğu gibi kalır."
        confirmLabel="Çıkış Yap"
        loading={busy}
        onConfirm={handleLogout}
        onCancel={() => setModal(null)}
      />

      <ConfirmDialog
        visible={modal === 'delete-info'}
        title="Hesabını silmek istiyor musun?"
        body="Profilin, paylaşımların, yorumların ve hesabına bağlı tüm veriler kalıcı olarak silinir. Bu işlem geri alınamaz. Sadece bir mola istiyorsan çıkış yapman yeterli."
        confirmLabel="Devam et"
        onConfirm={() => setModal('delete-final')}
        onCancel={() => setModal(null)}
      />

      <ConfirmDialog
        visible={modal === 'delete-final'}
        title="Son kez soruyoruz"
        body="Bu, hesabının kalıcı olarak silinmesini başlatır ve geri alınamaz."
        confirmLabel="Hesabımı Sil"
        cancelLabel="Vazgeç"
        danger
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setModal(null)}
      />
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
