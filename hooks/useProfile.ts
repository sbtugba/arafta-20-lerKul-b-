import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import {
  DEFAULT_CONTENT_PREFS,
  DEFAULT_NOTIFICATION_PREFS,
  type ContentPrefs,
  type NotificationPrefs,
  type Profile,
  type ProfileLinks,
  type ProfileQuestion,
} from '../lib/types';
import { useSession } from './useSession';

const PROFILE_COLUMNS = [
  'id',
  'display_name',
  'username',
  'avatar_url',
  'bio',
  'current_status',
  'interests',
  'profile_questions',
  'links',
  'location',
  'location_visible',
  'profile_visible',
  'phone',
  'birthdate',
  'show_age',
  'show_interests',
  'show_active',
  'show_last_seen',
  'notification_prefs',
  'content_prefs',
].join(', ');

type ProfileRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  current_status: string[];
  interests: string[];
  profile_questions: ProfileQuestion[];
  links: ProfileLinks;
  location: string | null;
  location_visible: boolean;
  profile_visible: boolean;
  phone: string | null;
  birthdate: string | null;
  show_age: boolean;
  show_interests: boolean;
  show_active: boolean;
  show_last_seen: boolean;
  notification_prefs: Partial<Record<string, boolean>>;
  content_prefs: Partial<Record<string, boolean>>;
};

function mapNotificationPrefs(raw: ProfileRow['notification_prefs']): NotificationPrefs {
  return {
    newFollower: raw.new_follower ?? DEFAULT_NOTIFICATION_PREFS.newFollower,
    followRequest: raw.follow_request ?? DEFAULT_NOTIFICATION_PREFS.followRequest,
    postLike: raw.post_like ?? DEFAULT_NOTIFICATION_PREFS.postLike,
    postComment: raw.post_comment ?? DEFAULT_NOTIFICATION_PREFS.postComment,
    mention: raw.mention ?? DEFAULT_NOTIFICATION_PREFS.mention,
    newContent: raw.new_content ?? DEFAULT_NOTIFICATION_PREFS.newContent,
    suggestedPeople: raw.suggested_people ?? DEFAULT_NOTIFICATION_PREFS.suggestedPeople,
    communityEvents: raw.community_events ?? DEFAULT_NOTIFICATION_PREFS.communityEvents,
    importantAnnouncements: raw.important_announcements ?? DEFAULT_NOTIFICATION_PREFS.importantAnnouncements,
    appUpdates: raw.app_updates ?? DEFAULT_NOTIFICATION_PREFS.appUpdates,
    emailProduct: raw.email_product ?? DEFAULT_NOTIFICATION_PREFS.emailProduct,
  };
}

function mapContentPrefs(raw: ProfileRow['content_prefs']): ContentPrefs {
  return {
    reduceUninterested: raw.reduce_uninterested ?? DEFAULT_CONTENT_PREFS.reduceUninterested,
    sensitiveContent: raw.sensitive_content ?? DEFAULT_CONTENT_PREFS.sensitiveContent,
    autoplay: raw.autoplay ?? DEFAULT_CONTENT_PREFS.autoplay,
  };
}

function notificationPrefsToRow(prefs: Partial<NotificationPrefs>) {
  const map: Record<string, string> = {
    newFollower: 'new_follower',
    followRequest: 'follow_request',
    postLike: 'post_like',
    postComment: 'post_comment',
    mention: 'mention',
    newContent: 'new_content',
    suggestedPeople: 'suggested_people',
    communityEvents: 'community_events',
    importantAnnouncements: 'important_announcements',
    appUpdates: 'app_updates',
    emailProduct: 'email_product',
  };
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(prefs)) {
    if (value !== undefined) out[map[key]] = value;
  }
  return out;
}

function contentPrefsToRow(prefs: Partial<ContentPrefs>) {
  const map: Record<string, string> = {
    reduceUninterested: 'reduce_uninterested',
    sensitiveContent: 'sensitive_content',
    autoplay: 'autoplay',
  };
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(prefs)) {
    if (value !== undefined) out[map[key]] = value;
  }
  return out;
}

function mapRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    username: row.username,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    currentStatus: row.current_status ?? [],
    interests: row.interests ?? [],
    questions: row.profile_questions ?? [],
    links: row.links ?? {},
    location: row.location,
    locationVisible: row.location_visible,
    profileVisible: row.profile_visible,
    phone: row.phone,
    birthdate: row.birthdate,
    showAge: row.show_age,
    showInterests: row.show_interests,
    showActive: row.show_active,
    showLastSeen: row.show_last_seen,
    notificationPrefs: mapNotificationPrefs(row.notification_prefs ?? {}),
    contentPrefs: mapContentPrefs(row.content_prefs ?? {}),
  };
}

async function fetchOrCreateProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle();
  if (error) throw error;
  if (data) return mapRow(data as unknown as ProfileRow);

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: userId })
    .select(PROFILE_COLUMNS)
    .single();
  if (insertError) throw insertError;

  return mapRow(created as unknown as ProfileRow);
}

export function useProfile() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchOrCreateProfile(userId as string),
    enabled: !!userId,
  });
}

export type ProfilePatch = Partial<{
  displayName: string;
  username: string;
  bio: string;
  currentStatus: string[];
  interests: string[];
  questions: ProfileQuestion[];
  links: ProfileLinks;
  locationVisible: boolean;
  profileVisible: boolean;
  phone: string;
  birthdate: string;
  showAge: boolean;
  showInterests: boolean;
  showActive: boolean;
  showLastSeen: boolean;
  notificationPrefs: Partial<NotificationPrefs>;
  contentPrefs: Partial<ContentPrefs>;
}>;

const UNIQUE_VIOLATION = '23505';

export function useUpdateProfile() {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: ProfilePatch) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');

      let notificationPatch: Record<string, boolean> | undefined;
      if (patch.notificationPrefs) {
        const current = queryClient.getQueryData<Profile>(['profile', userId]);
        notificationPatch = notificationPrefsToRow({ ...current?.notificationPrefs, ...patch.notificationPrefs });
      }
      let contentPatch: Record<string, boolean> | undefined;
      if (patch.contentPrefs) {
        const current = queryClient.getQueryData<Profile>(['profile', userId]);
        contentPatch = contentPrefsToRow({ ...current?.contentPrefs, ...patch.contentPrefs });
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
          ...(patch.username !== undefined ? { username: patch.username } : {}),
          ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
          ...(patch.currentStatus !== undefined ? { current_status: patch.currentStatus } : {}),
          ...(patch.interests !== undefined ? { interests: patch.interests } : {}),
          ...(patch.questions !== undefined ? { profile_questions: patch.questions } : {}),
          ...(patch.links !== undefined ? { links: patch.links } : {}),
          ...(patch.locationVisible !== undefined ? { location_visible: patch.locationVisible } : {}),
          ...(patch.profileVisible !== undefined ? { profile_visible: patch.profileVisible } : {}),
          ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
          ...(patch.birthdate !== undefined ? { birthdate: patch.birthdate } : {}),
          ...(patch.showAge !== undefined ? { show_age: patch.showAge } : {}),
          ...(patch.showInterests !== undefined ? { show_interests: patch.showInterests } : {}),
          ...(patch.showActive !== undefined ? { show_active: patch.showActive } : {}),
          ...(patch.showLastSeen !== undefined ? { show_last_seen: patch.showLastSeen } : {}),
          ...(notificationPatch ? { notification_prefs: notificationPatch } : {}),
          ...(contentPatch ? { content_prefs: contentPatch } : {}),
        })
        .eq('id', userId);

      if (error) {
        if (error.code === UNIQUE_VIOLATION) throw new Error('Bu kullanıcı adı alınmış.');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}

// Anlık kullanılabilirlik kontrolü için — mutasyon değil, doğrudan çağrılan bir sorgu.
export async function checkUsernameAvailable(username: string, currentUserId: string): Promise<boolean> {
  const { data, error } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
  if (error) throw error;
  return !data || data.id === currentUserId;
}

export function useUploadAvatar() {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (localUri: string) => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');

      const response = await fetch(localUri);
      const arrayBuffer = await response.arrayBuffer();
      const path = `${userId}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
      // Supabase CDN'i eski dosyayı önbellekleyebiliyor — aynı ada yeniden yükleyince görsel değişsin diye sürüm etiketi ekliyoruz.
      const versionedUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: versionedUrl }).eq('id', userId);
      if (updateError) throw updateError;

      return versionedUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}

export function useRemoveAvatar() {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Oturum henüz hazır değil.');
      await supabase.storage.from('avatars').remove([`${userId}/avatar.jpg`]);
      const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}

export function useProfileStats() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ['profile-stats', userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ count: postCount }, { count: anonCount }, { data: myPosts }] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId as string),
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', userId as string)
          .eq('is_anonymous', true),
        supabase.from('posts').select('reaction_count').eq('author_id', userId as string),
      ]);

      const reactionsReceived = (myPosts ?? []).reduce((sum, p) => sum + (p.reaction_count ?? 0), 0);

      return {
        postCount: postCount ?? 0,
        anonCount: anonCount ?? 0,
        reactionsReceived,
      };
    },
  });
}
