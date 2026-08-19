import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { editorial } from '../../lib/theme';
import { PrimaryButton } from './PrimaryButton';

export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Vazgeç',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.actions}>
            <PrimaryButton label={confirmLabel} variant={danger ? 'error' : 'burgundy'} loading={loading} onPress={onConfirm} />
            <Pressable onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42,24,16,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: '82%',
    maxWidth: 300,
    backgroundColor: editorial.cream,
    borderRadius: 20,
    padding: 22,
  },
  title: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 18,
    color: editorial.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    lineHeight: 20,
    color: editorial.inkSoft,
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: editorial.inkSoft,
  },
});
