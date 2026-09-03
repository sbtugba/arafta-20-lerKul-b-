import { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, type } from '../../lib/theme';
import { usePost, useToggleReaction } from '../../hooks/usePosts';
import { useComments, useCreateComment, useDeleteComment, useToggleCommentLike } from '../../hooks/useComments';
import { useSubmitCommentReport, useSubmitReport } from '../../hooks/useReports';
import { useBlockUser } from '../../hooks/useBlockedUsers';
import { useSession } from '../../hooks/useSession';
import { REPORT_REASONS, displayNameFor, relativeTime, type Comment, type Post } from '../../lib/types';
import { ArrowLeftIcon, HeartIcon, MoreIcon, ShareIcon, TalkIcon } from '../../components/icons';
import { Avatar } from '../../components/Avatar';
import { AuthorName } from '../../components/AuthorName';
import { Sheet } from '../../components/editorial/Sheet';
import { ConfirmDialog } from '../../components/editorial/ConfirmDialog';

// Ortak engelleme onayı — hem gönderi hem yorum menüsünden çağrılıyor.
function askBlock(label: string, onConfirm: () => void) {
  Alert.alert(
    `${label} engellensin mi?`,
    'Bu kişinin paylaşımlarını ve yorumlarını artık görmeyeceksin. İstediğin zaman Ayarlar > Engellenenler ekranından geri alabilirsin.',
    [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Engelle', style: 'destructive', onPress: onConfirm },
    ]
  );
}

function PostHeader({ post, onToggleReaction }: { post: Post; onToggleReaction: () => void }) {
  const [menu, setMenu] = useState<'closed' | 'actions' | 'report'>('closed');
  const submitReport = useSubmitReport();
  const blockUser = useBlockUser();
  const { userId } = useSession();

  const name = post.isAnonymous ? 'anonim' : displayNameFor(post.authorDisplayName, post.authorUsername);
  const canBlock = !post.isAnonymous && !!post.authorId && post.authorId !== userId;

  function handleReport(reason: string) {
    submitReport.mutate(
      { postId: post.id, reason },
      {
        onSuccess: () => {
          setMenu('closed');
          Alert.alert('Bildirildi', 'Bu paylaşımı bildirdiğin için teşekkürler, ekibimiz inceleyecek.');
        },
        onError: () => Alert.alert('Bir şeyler ters gitti', 'Bildirimi gönderemedik, lütfen tekrar dene.'),
      }
    );
  }

  function onBlock() {
    askBlock(name, () =>
      blockUser.mutate(post.authorId, {
        onSuccess: () => {
          setMenu('closed');
          Alert.alert('Engellendi', `${name} artık akışında görünmeyecek.`);
          router.back();
        },
        onError: () => Alert.alert('Bir şeyler ters gitti', 'Engelleyemedik, lütfen tekrar dene.'),
      })
    );
  }

  return (
    <View style={styles.postBlock}>
      <View style={styles.postTopRow}>
        <View style={styles.commentWho}>
          <Avatar isAnonymous={post.isAnonymous} avatarUrl={post.authorAvatarUrl} name={name} size={40} />
          <View>
            {post.isAnonymous ? (
              <Text style={styles.postName}>anonim</Text>
            ) : (
              <AuthorName displayName={post.authorDisplayName} username={post.authorUsername} nameStyle={styles.postName} />
            )}
            <Text style={styles.commentTime}>{relativeTime(post.createdAt)}</Text>
          </View>
        </View>
        <Pressable hitSlop={10} style={styles.moreBtn} onPress={() => setMenu('actions')} accessibilityLabel="Gönderi seçenekleri">
          <MoreIcon size={16} color={colors.bordoMuted} />
        </Pressable>
      </View>

      <Text style={styles.postBody}>{post.body}</Text>

      <View style={styles.postActionsRow}>
        <Pressable style={styles.postActionBtn} hitSlop={8} onPress={onToggleReaction}>
          <HeartIcon size={17} color={post.hasReacted ? colors.gold : colors.bordoMuted} filled={post.hasReacted} />
          <Text style={styles.postActionLabel}>{post.reactionCount.toLocaleString('tr-TR')}</Text>
        </Pressable>
        <View style={styles.postActionBtn}>
          <TalkIcon size={15} color={colors.bordoMuted} />
          <Text style={styles.postActionLabel}>{post.commentCount}</Text>
        </View>
        <Pressable style={styles.postActionBtn} hitSlop={8} onPress={() => Share.share({ message: post.body })}>
          <ShareIcon size={15} color={colors.bordoMuted} />
          <Text style={styles.postActionLabel}>Paylaş</Text>
        </Pressable>
      </View>

      <Sheet visible={menu === 'actions'} onClose={() => setMenu('closed')} title="Gönderi seçenekleri">
        {canBlock ? (
          <Pressable style={styles.sheetRow} onPress={onBlock} disabled={blockUser.isPending}>
            <Text style={styles.sheetRowBordo}>Bu kişiyi engelle</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.sheetRow} onPress={() => setMenu('report')}>
          <Text style={styles.sheetRowLabel}>Şikayet et</Text>
        </Pressable>
      </Sheet>

      <Sheet visible={menu === 'report'} onClose={() => setMenu('closed')} title="Bu gönderiyi bildir">
        {REPORT_REASONS.map((reason) => (
          <Pressable key={reason} style={styles.sheetRow} onPress={() => handleReport(reason)} disabled={submitReport.isPending}>
            <Text style={styles.sheetRowDanger}>{reason}</Text>
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}

function CommentSkeleton() {
  return (
    <View style={styles.skelWrap}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.skelRow}>
          <View style={[styles.skelBlock, { width: '30%', height: 10 }]} />
          <View style={[styles.skelBlock, { width: '85%', height: 10, marginTop: 8 }]} />
          <View style={[styles.skelBlock, { width: '55%', height: 10, marginTop: 6 }]} />
        </View>
      ))}
    </View>
  );
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isPending: postLoading } = usePost(id);
  const { data: comments, isPending: commentsLoading } = useComments(id);
  const toggleReaction = useToggleReaction();
  const toggleCommentLike = useToggleCommentLike(id);
  const createComment = useCreateComment(id);
  const deleteComment = useDeleteComment(id);
  const submitCommentReport = useSubmitCommentReport();
  const blockUser = useBlockUser();
  const { userId } = useSession();

  const [draft, setDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ id: string; name: string } | null>(null);
  const [menuComment, setMenuComment] = useState<Comment | null>(null);
  const [reportSheetComment, setReportSheetComment] = useState<Comment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  function startReply(comment: Comment) {
    const name = comment.isAnonymous ? 'anonim' : displayNameFor(comment.authorDisplayName, comment.authorUsername);
    setReplyTarget({ id: comment.id, name });
  }
  function cancelReply() {
    setReplyTarget(null);
  }

  function submit() {
    const body = draft.trim();
    if (!body) return;
    createComment.mutate(
      { body, parentCommentId: replyTarget?.id ?? null },
      {
        onSuccess: () => {
          setDraft('');
          cancelReply();
        },
        onError: () => Alert.alert('Bir şeyler ters gitti', 'Yorumun gönderilemedi, lütfen tekrar dene.'),
      }
    );
  }

  function handleReport(reason: string) {
    if (!reportSheetComment) return;
    submitCommentReport.mutate(
      { commentId: reportSheetComment.id, reason },
      {
        onSuccess: () => {
          setReportSheetComment(null);
          Alert.alert('Bildirildi', 'Bu yorumu bildirdiğin için teşekkürler, ekibimiz inceleyecek.');
        },
        onError: () => Alert.alert('Bir şeyler ters gitti', 'Bildirimi gönderemedik, lütfen tekrar dene.'),
      }
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteComment.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: () => {
        setDeleteTarget(null);
        Alert.alert('Bir şeyler ters gitti', 'Yorum silinemedi, lütfen tekrar dene.');
      },
    });
  }

  function renderComment(comment: Comment, isReply: boolean) {
    const name = comment.isAnonymous ? 'anonim' : displayNameFor(comment.authorDisplayName, comment.authorUsername);
    return (
      <View key={comment.id}>
        <View style={[styles.commentCard, isReply && styles.replyCard]}>
          <View style={styles.commentTop}>
            <View style={styles.commentWho}>
              <Avatar isAnonymous={comment.isAnonymous} avatarUrl={comment.authorAvatarUrl} name={name} size={30} />
              <View>
                {comment.isAnonymous ? (
                  <Text style={styles.commentName}>anonim</Text>
                ) : (
                  <AuthorName displayName={comment.authorDisplayName} username={comment.authorUsername} nameStyle={styles.commentName} />
                )}
                <Text style={styles.commentTime}>{relativeTime(comment.createdAt)}</Text>
              </View>
            </View>
            <Pressable
              hitSlop={8}
              style={styles.moreBtn}
              onPress={() => setMenuComment(comment)}
              accessibilityLabel="Yorum seçenekleri"
            >
              <MoreIcon size={14} color={colors.bordoMuted} />
            </Pressable>
          </View>
          <Text style={styles.commentBody}>{comment.body}</Text>
          <View style={styles.commentBottom}>
            <Pressable
              style={styles.likeBtn}
              hitSlop={8}
              onPress={() => toggleCommentLike.mutate({ commentId: comment.id, hasLiked: comment.hasLiked })}
            >
              <HeartIcon size={12} color={comment.hasLiked ? colors.bordo : colors.bordoMuted} filled={comment.hasLiked} />
              <Text style={[styles.likeCount, comment.hasLiked && { color: colors.bordo }]}>{comment.likeCount}</Text>
            </Pressable>
            {!isReply ? (
              <Pressable hitSlop={8} onPress={() => startReply(comment)}>
                <Text style={styles.replyLabel}>Yanıtla</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        {comment.replies.length > 0 ? (
          <View style={styles.repliesWrap}>{comment.replies.map((r) => renderComment(r, true))}</View>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <ArrowLeftIcon size={18} color={colors.bordo} />
        </Pressable>
        <Text style={styles.headerTitle}>Yorumlar</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={8}>
        <FlatList
          data={commentsLoading ? [] : (comments ?? [])}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            !postLoading && post ? (
              <>
                <PostHeader post={post} onToggleReaction={() => toggleReaction.mutate({ postId: post.id, hasReacted: post.hasReacted })} />
                <View style={styles.commentsHeading}>
                  <Text style={styles.commentsHeadingTitle}>Yorumlar</Text>
                  <Text style={styles.commentsHeadingCount}>{post.commentCount} yorum</Text>
                </View>
              </>
            ) : null
          }
          ListEmptyComponent={
            commentsLoading ? (
              <CommentSkeleton />
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Henüz bir yorum yok.</Text>
                <Text style={styles.emptySub}>İlk sözü sen söyle.</Text>
              </View>
            )
          }
          renderItem={({ item }) => renderComment(item, false)}
        />

        <View style={styles.composerWrap}>
          {replyTarget ? (
            <View style={styles.replyChip}>
              <Text style={styles.replyChipLabel}>@{replyTarget.name}'e yanıt ver</Text>
              <Pressable onPress={cancelReply} hitSlop={8}>
                <Text style={styles.replyChipClose}>×</Text>
              </Pressable>
            </View>
          ) : null}
          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder="Bir şey söyle..."
              placeholderTextColor={colors.bordoMuted}
              value={draft}
              onChangeText={setDraft}
              multiline
            />
            <Pressable
              style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
              disabled={!draft.trim() || createComment.isPending}
              onPress={submit}
            >
              <Text style={styles.sendLabel}>Gönder</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Sheet visible={!!menuComment} onClose={() => setMenuComment(null)} title={menuComment?.isMine ? 'Yorumun' : 'Yorum seçenekleri'}>
        {menuComment?.isMine ? (
          <Pressable
            style={styles.sheetRow}
            onPress={() => {
              setDeleteTarget(menuComment);
              setMenuComment(null);
            }}
          >
            <Text style={styles.sheetRowDanger}>Yorumu sil</Text>
          </Pressable>
        ) : (
          <>
            {menuComment && !menuComment.isAnonymous && menuComment.authorId !== userId ? (
              <Pressable
                style={styles.sheetRow}
                disabled={blockUser.isPending}
                onPress={() => {
                  const c = menuComment;
                  const label = displayNameFor(c.authorDisplayName, c.authorUsername);
                  setMenuComment(null);
                  askBlock(label, () =>
                    blockUser.mutate(c.authorId, {
                      onSuccess: () => Alert.alert('Engellendi', `${label} artık akışında ve yorumlarda görünmeyecek.`),
                      onError: () => Alert.alert('Bir şeyler ters gitti', 'Engelleyemedik, lütfen tekrar dene.'),
                    })
                  );
                }}
              >
                <Text style={styles.sheetRowBordo}>Bu kişiyi engelle</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={styles.sheetRow}
              onPress={() => {
                setReportSheetComment(menuComment);
                setMenuComment(null);
              }}
            >
              <Text style={styles.sheetRowLabel}>Yorumu bildir</Text>
            </Pressable>
          </>
        )}
      </Sheet>

      <Sheet visible={!!reportSheetComment} onClose={() => setReportSheetComment(null)} title="Bu yorumu bildir">
        {REPORT_REASONS.map((reason) => (
          <Pressable key={reason} style={styles.sheetRow} onPress={() => handleReport(reason)} disabled={submitCommentReport.isPending}>
            <Text style={styles.sheetRowLabel}>{reason}</Text>
          </Pressable>
        ))}
      </Sheet>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Yorumu silmek istediğine emin misin?"
        body="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        danger
        loading={deleteComment.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: type.bodyBold,
    fontSize: 15,
    color: colors.bordoInk,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  postBlock: {
    paddingTop: 6,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamLine,
    marginBottom: 18,
  },
  postTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  postName: {
    fontFamily: type.bodyBold,
    fontSize: 14.5,
    color: colors.bordoInk,
  },
  postBody: {
    fontFamily: type.body,
    fontSize: 17,
    lineHeight: 26,
    color: colors.bordoInk,
    marginBottom: 14,
  },
  postActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  postActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionLabel: {
    fontFamily: type.bodySemibold,
    fontSize: 13.5,
    color: colors.bordoMuted,
  },
  commentsHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 14,
  },
  commentsHeadingTitle: {
    fontFamily: type.bodyBold,
    fontSize: 15,
    color: colors.bordoInk,
  },
  commentsHeadingCount: {
    fontFamily: type.body,
    fontSize: 12.5,
    color: colors.bordoMuted,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  emptyTitle: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 17,
    color: colors.bordoInk,
  },
  emptySub: {
    fontFamily: type.body,
    fontSize: 13.5,
    color: colors.bordoMuted,
  },
  skelWrap: {
    gap: 10,
    paddingTop: 4,
  },
  skelRow: {
    backgroundColor: colors.creamDim,
    borderRadius: 16,
    padding: 14,
  },
  skelBlock: {
    backgroundColor: colors.gold + '33',
    borderRadius: 5,
  },
  commentCard: {
    backgroundColor: colors.creamDim,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  replyCard: {
    backgroundColor: '#EDE0CB',
    marginBottom: 0,
  },
  commentTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  commentWho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  commentName: {
    fontFamily: type.bodyBold,
    fontSize: 13.5,
    color: colors.bordoInk,
  },
  commentTime: {
    fontFamily: type.body,
    fontSize: 11.5,
    color: colors.bordoMuted,
    marginTop: 1,
  },
  moreBtn: {
    padding: 2,
  },
  commentBody: {
    fontFamily: type.body,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.bordoInk,
    marginBottom: 8,
  },
  commentBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontFamily: type.bodySemibold,
    fontSize: 11.5,
    color: colors.bordoMuted,
  },
  replyLabel: {
    fontFamily: type.bodySemibold,
    fontSize: 12,
    color: colors.bordoMuted,
  },
  repliesWrap: {
    marginTop: -2,
    marginBottom: 10,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: colors.creamLine,
    gap: 8,
  },
  composerWrap: {
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.creamLine,
  },
  replyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.creamDim,
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  replyChipLabel: {
    fontFamily: type.bodySemibold,
    fontSize: 12,
    color: colors.bordo,
  },
  replyChipClose: {
    fontSize: 16,
    color: colors.bordoMuted,
    lineHeight: 16,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontFamily: type.body,
    fontSize: 14.5,
    color: colors.bordoInk,
    backgroundColor: colors.creamDim,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendBtn: {
    backgroundColor: colors.bordo,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  sendBtnDisabled: {
    opacity: 0.42,
  },
  sendLabel: {
    fontFamily: type.bodyBold,
    fontSize: 13.5,
    color: colors.cream,
  },
  sheetRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamLine,
  },
  sheetRowLabel: {
    fontFamily: type.bodyMedium,
    fontSize: 14.5,
    color: colors.bordoInk,
  },
  sheetRowDanger: {
    fontFamily: type.bodySemibold,
    fontSize: 14.5,
    color: '#A6432F',
  },
  sheetRowBordo: {
    fontFamily: type.bodySemibold,
    fontSize: 14.5,
    color: colors.bordo,
  },
});
