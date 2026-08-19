import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial, editorialRadii } from '../../lib/theme';

export function Sheet({
  visible,
  onClose,
  title,
  children,
  footer,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42,24,16,0.32)',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: editorial.cream,
    borderTopLeftRadius: editorialRadii.sheet,
    borderTopRightRadius: editorialRadii.sheet,
    paddingHorizontal: 20,
  },
  handle: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: editorial.line,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 18,
    color: editorial.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingBottom: 8,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 16,
  },
});
