const KNOWN_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-posta veya şifre hatalı.',
  'User already registered': 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dener misin?',
  'Email not confirmed': 'E-postanı henüz doğrulamadın — gelen kutunu kontrol et.',
  'Email rate limit exceeded': 'Çok fazla deneme yapıldı, birazdan tekrar dene.',
  'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalı.',
};

export function translateAuthError(message: string | undefined): string {
  if (!message) return 'Bir şeyler ters gitti, tekrar dener misin?';
  return KNOWN_MESSAGES[message] ?? message;
}
