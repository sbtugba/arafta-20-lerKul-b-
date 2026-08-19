import { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { editorial } from '../../lib/theme';
import type { Profile } from '../../lib/types';
import { useRemoveAvatar, useUploadAvatar } from '../../hooks/useProfile';
import { CameraIcon, PersonIcon } from '../icons';

function initials(p: Profile): string {
  const src = p.displayName || p.username || '';
  return src ? src.charAt(0).toLocaleUpperCase('tr-TR') : '';
}

export function AvatarPicker({ profile }: { profile: Profile }) {
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const [menuOpen, setMenuOpen] = useState(false);
  const busy = uploadAvatar.isPending || removeAvatar.isPending;

  async function pick(source: 'library' | 'camera') {
    setMenuOpen(false);
    const perm =
      source === 'library'
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;

    const result = await (source === 'library' ? ImagePicker.launchImageLibraryAsync : ImagePicker.launchCameraAsync)({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadAvatar.mutate(result.assets[0].uri);
    }
  }

  return (
    <View style={styles.block}>
      <Pressable onPress={() => setMenuOpen(true)} style={styles.frame} disabled={busy}>
        <View style={[styles.circle, !profile.avatarUrl && styles.circleEmpty]}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.img} />
          ) : initials(profile) ? (
            <Text style={styles.letter}>{initials(profile)}</Text>
          ) : (
            <PersonIcon size={34} color={editorial.inkFaint} />
          )}
          {busy ? (
            <View style={styles.busyOverlay}>
              <ActivityIndicator color={editorial.cream} />
            </View>
          ) : null}
        </View>
        <View style={styles.badge}>
          <CameraIcon size={15} color={editorial.cream} />
        </View>
      </Pressable>

      {!profile.avatarUrl ? <Text style={styles.hint}>Fotoğraf eklemek için dokun</Text> : null}

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.menu}>
            <Pressable style={styles.menuItem} onPress={() => pick('library')}>
              <Text style={styles.menuLabel}>Galeriden seç</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => pick('camera')}>
              <Text style={styles.menuLabel}>Kameradan çek</Text>
            </Pressable>
            {profile.avatarUrl ? (
              <Pressable
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={() => {
                  setMenuOpen(false);
                  removeAvatar.mutate();
                }}
              >
                <Text style={[styles.menuLabel, styles.menuLabelDanger]}>Fotoğrafı kaldır</Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const AVATAR_SIZE = 92;

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  frame: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  circle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: editorial.beige,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleEmpty: {
    borderWidth: 1.5,
    borderColor: editorial.inkFaint,
    borderStyle: 'dashed',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  letter: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 30,
    color: editorial.inkFaint,
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42,24,16,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: editorial.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: editorial.cream,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: editorial.inkFaint,
    marginTop: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42,24,16,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    width: 220,
    backgroundColor: editorial.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: editorial.line,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: editorial.ink,
  },
  menuLabelDanger: {
    color: editorial.error,
  },
});
