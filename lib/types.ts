export type Post = {
  id: string;
  authorId: string;
  isAnonymous: boolean;
  authorDisplayName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  body: string;
  tags: string[];
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  hasReacted: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  isAnonymous: boolean;
  authorDisplayName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  body: string;
  createdAt: string;
  likeCount: number;
  hasLiked: boolean;
  isMine: boolean;
  replies: Comment[];
};

// Paylaşım/yorumlarda görünecek isim: ikisi de varsa "İsim @kullaniciadi",
// yalnız biri varsa o, ikisi de yoksa (eski/eksik profiller için) jenerik "biri".
export function displayNameFor(displayName: string | null, username: string | null): string {
  if (displayName && username) return `${displayName} @${username}`;
  if (displayName) return displayName;
  if (username) return `@${username}`;
  return 'biri';
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'şimdi';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export type ProfileQuestion = {
  q: string;
  a: string;
};

export type ProfileLinks = Partial<Record<'instagram' | 'spotify' | 'letterboxd' | 'goodreads', string>>;

export type NotificationPrefs = {
  postLike: boolean;
  postComment: boolean;
  newContent: boolean;
  importantAnnouncements: boolean;
  appUpdates: boolean;
  emailProduct: boolean;
};

export type ContentPrefs = {
  reduceUninterested: boolean;
  sensitiveContent: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  postLike: true,
  postComment: true,
  newContent: true,
  importantAnnouncements: true,
  appUpdates: false,
  emailProduct: false,
};

export const DEFAULT_CONTENT_PREFS: ContentPrefs = {
  reduceUninterested: true,
  sensitiveContent: false,
};

export type Profile = {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  currentStatus: string[];
  interests: string[];
  questions: ProfileQuestion[];
  links: ProfileLinks;
  location: string | null;
  phone: string | null;
  birthdate: string | null;
  notificationPrefs: NotificationPrefs;
  contentPrefs: ContentPrefs;
};

export const FOLLOWABLE_TOPICS = ['kariyer', 'ilişkiler', 'para', 'yalnızlık', 'gelecek', 'ruhsağlığı'] as const;
export type FollowableTopic = (typeof FOLLOWABLE_TOPICS)[number];

export const STATUS_OPTIONS = [
  'Bir şeyler öğreniyorum',
  'İş arıyorum',
  'Kariyerimi değiştiriyorum',
  'Üniversitedeyim',
  'Yeni mezunum',
  'Yeni bir şehre alışıyorum',
  'Bir şeyler üretiyorum',
  'Kendimi bulmaya çalışıyorum',
  'Biraz kayboldum',
  'Hayatımı düzene sokuyorum',
  'Sadece akıştayım',
] as const;

export const INTEREST_OPTIONS = [
  'Film',
  'Dizi',
  'Müzik',
  'Kitap',
  'Tasarım',
  'Teknoloji',
  'Spor',
  'Seyahat',
  'Sanat',
  'Fotoğraf',
  'Podcast',
  'Oyun',
  'Kahve',
  'Yemek',
  'Kişisel gelişim',
] as const;

export const QUESTION_PROMPTS = [
  'Son zamanlarda seni ne heyecanlandırıyor?',
  'Bir gün tamamen boş olsa ne yapardın?',
  'Şu an hayatında neyi çözmeye çalışıyorsun?',
  'Kimseye söylemediğin bir hedefin var mı?',
  'En çok hangi konuda kendini yalnız hissediyorsun?',
] as const;

export const LINK_TYPES: { key: keyof ProfileLinks; name: string }[] = [
  { key: 'instagram', name: 'Instagram' },
  { key: 'spotify', name: 'Spotify' },
  { key: 'letterboxd', name: 'Letterboxd' },
  { key: 'goodreads', name: 'Goodreads' },
];

export const REPORT_REASONS = [
  'Spam',
  'Taciz / zorbalık',
  'Nefret söylemi',
  'Uygunsuz içerik',
  'Sahte hesap',
  'Kendine zarar verme içeriği',
  'Diğer',
] as const;

export type BlockedUser = {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

export function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function slugifyUsername(raw: string): string {
  return raw
    .toLocaleLowerCase('tr-TR')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);
}
