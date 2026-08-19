import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { useBlockedUsers, useUnblockUser } from '../../hooks/useBlockedUsers';
import { useToast } from '../../providers/ToastProvider';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { PersonIcon } from '../../components/icons';

export default function BlockedUsersScreen() {
  const { data: blocked, isLoading } = useBlockedUsers();
  const unblock = useUnblockUser();
  const toast = useToast();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Engellenen Kullanıcılar" />
      {!isLoading && blocked && blocked.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Henüz engellediğin kimse yok.</Text>
        </View>
      ) : (
        <FlatList
          data={blocked ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.avatarUrl ? (
                <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <PersonIcon size={18} color={editorial.inkFaint} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.displayName || item.username || 'biri'}</Text>
                {item.username ? <Text style={styles.username}>@{item.username}</Text> : null}
              </View>
              <Text
                style={styles.unblock}
                onPress={() => unblock.mutate(item.id, { onSuccess: () => toast('Engel kaldırıldı.') })}
              >
                Engeli kaldır
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceholder: { backgroundColor: editorial.beige, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 14.5, color: editorial.ink },
  username: { fontFamily: 'Inter_400Regular', fontSize: 12.5, color: editorial.inkFaint, marginTop: 1 },
  unblock: { fontFamily: 'Inter_700Bold', fontSize: 13, color: editorial.burgundy },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyTitle: { fontFamily: 'Fraunces_500Medium_Italic', fontSize: 16, color: editorial.inkSoft },
});
