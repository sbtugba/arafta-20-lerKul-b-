export type Post = {
  id: string;
  authorId: string;
  isAnonymous: boolean;
  authorDisplayName: string | null;
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
  body: string;
  createdAt: string;
  likeCount: number;
  hasLiked: boolean;
  isMine: boolean;
  replies: Comment[];
};

export type ProfileQuestion = {
  q: string;
  a: string;
};

export type ProfileLinks = Partial<Record<'instagram' | 'spotify' | 'letterboxd' | 'goodreads', string>>;

export type NotificationPrefs = {
  newFollower: boolean;
  followRequest: boolean;
  postLike: boolean;
  postComment: boolean;
  mention: boolean;
  newContent: boolean;
  suggestedPeople: boolean;
  communityEvents: boolean;
  importantAnnouncements: boolean;
  appUpdates: boolean;
  emailProduct: boolean;
};

export type ContentPrefs = {
  reduceUninterested: boolean;
  sensitiveContent: boolean;
  autoplay: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  newFollower: true,
  followRequest: true,
  postLike: true,
  postComment: true,
  mention: true,
  newContent: true,
  suggestedPeople: false,
  communityEvents: true,
  importantAnnouncements: true,
  appUpdates: false,
  emailProduct: false,
};

export const DEFAULT_CONTENT_PREFS: ContentPrefs = {
  reduceUninterested: true,
  sensitiveContent: false,
  autoplay: true,
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
  locationVisible: boolean;
  profileVisible: boolean;
  phone: string | null;
  birthdate: string | null;
  showAge: boolean;
  showInterests: boolean;
  showActive: boolean;
  showLastSeen: boolean;
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

export const DELETE_ACCOUNT_REASONS = [
  'Uygulamayı artık kullanmıyorum',
  'Gizlilik konusunda endişeliyim',
  'İstediğim topluluğu bulamadım',
  'Çok fazla bildirim alıyorum',
  'Teknik bir sorun yaşıyorum',
  'Diğer',
] as const;

export type BlockedUser = {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

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
