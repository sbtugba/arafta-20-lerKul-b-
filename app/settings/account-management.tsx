import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { DELETE_ACCOUNT_REASONS } from '../../lib/types';
import { useSession } from '../../providers/SessionProvider';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { RowButton } from '../../components/editorial/RowButton';
import { ConfirmDialog } from '../../components/editorial/ConfirmDialog';
import { Sheet } from '../../components/editorial/Sheet';
import { PrimaryButton } from '../../components/editorial/PrimaryButton';

type Modal = null | 'logout' | 'freeze' | 'delete-warning' | 'delete-reason' | 'delete-final';

export default function AccountManagementScreen() {
  const { signOut } = useSession();
  const [modal, setModal] = useState<Modal>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    await signOut();
    setBusy(false);
    setModal(null);
    // root layout'taki auth gate oturum kapanınca otomatik (auth)'a yönlendiriyor
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Hesap Yönetimi" />
      <ScrollView style={styles.scroll}>
        <SettingsSection>
          <RowButton label="Çıkış Yap" onPress={() => setModal('logout')} last />
        </SettingsSection>

        <SettingsSection label="TEHLİKELİ ALAN" last>
          <RowButton label="Hesabı Dondur" onPress={() => setModal('freeze')} />
          <RowButton label="Hesabı Sil" danger onPress={() => setModal('delete-warning')} last />
        </SettingsSection>
      </ScrollView>

      <ConfirmDialog
        visible={modal === 'logout'}
        title="Çıkış yapmak istediğine emin misin?"
        body="Arafta'ya tekrar bekleriz."
        confirmLabel="Çıkış Yap"
        loading={busy}
        onConfirm={handleLogout}
        onCancel={() => setModal(null)}
      />

      <ConfirmDialog
        visible={modal === 'freeze'}
        title="Hesabını dondurmak istediğine emin misin?"
        body="Hesabını dondurduğunda profilin ve içeriklerin diğer kullanıcılara görünmez. Daha sonra tekrar giriş yaparak hesabını aktif hale getirebilirsin."
        confirmLabel="Hesabı Dondur"
        danger
        onConfirm={() => {
          setModal(null);
          Alert.alert('Yakında', 'Hesap dondurma altyapısı henüz hazır değil — bu, sunucu tarafında ayrı bir durum alanı gerektiriyor.');
        }}
        onCancel={() => setModal(null)}
      />

      <Sheet visible={modal === 'delete-warning'} onClose={() => setModal(null)} title="Hesabı Sil">
        <Text style={styles.warningBody}>
          Hesabını sildiğinde profilin, gönderilerin ve hesabına bağlı verilerin silinmesi başlatılır. Bu işlem geri
          alınamayabilir.
        </Text>
        <PrimaryButton label="Devam et" onPress={() => setModal('delete-reason')} />
      </Sheet>

      <Sheet visible={modal === 'delete-reason'} onClose={() => setModal(null)} title="Neden ayrılıyorsun?">
        <Text style={styles.warningBody}>Opsiyonel — bize yardımcı olur.</Text>
        {DELETE_ACCOUNT_REASONS.map((r) => (
          <Pressable key={r} style={styles.reasonRow} onPress={() => setReason(r)}>
            <View style={[styles.reasonDot, reason === r && styles.reasonDotOn]} />
            <Text style={styles.reasonLabel}>{r}</Text>
          </Pressable>
        ))}
        <PrimaryButton label="Hesabı Sil" variant="error" onPress={() => setModal('delete-final')} />
      </Sheet>

      <ConfirmDialog
        visible={modal === 'delete-final'}
        title="Emin misin?"
        body="Bu işlem hesabının silinmesini başlatacak."
        confirmLabel="Hesabımı Sil"
        danger
        loading={busy}
        onConfirm={async () => {
          setBusy(true);
          Alert.alert(
            'Hesap silme',
            'Kalıcı silme işlemi güvenlik nedeniyle şu an yalnızca destek ekibi üzerinden yapılabiliyor (sunucu tarafı bir işlem gerektiriyor). Şimdilik oturumunu kapatıyoruz — destek@arafta.app üzerinden bize ulaşabilirsin.'
          );
          await signOut();
          setBusy(false);
          setModal(null);
        }}
        onCancel={() => setModal(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  scroll: { flex: 1, paddingHorizontal: 20 },
  warningBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    lineHeight: 20,
    color: editorial.inkSoft,
    marginBottom: 16,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  reasonDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: editorial.line,
  },
  reasonDotOn: {
    borderColor: editorial.burgundy,
    backgroundColor: editorial.burgundy,
  },
  reasonLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: editorial.ink,
  },
});
