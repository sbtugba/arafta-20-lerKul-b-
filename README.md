# Arafta — 20'ler Kulübü

> Hayatının nereye gittiğinden emin olmayan 20'li yaşlardaki insanlar için, aynı adlı
> podcast'in yanında yer alan bir topluluk uygulaması.

Arafta, "henüz hiçbir şey yerine oturmadı" hissini paylaşan insanların; kariyer, ilişkiler,
yalnızlık, taşınmak, para gibi başlıklar etrafında — çoğu zaman **anonim** olarak —
küçük anlarını (bir "arafta anı") paylaştığı bir alan.

Uygulamanın tamamı bilinçli olarak **kişi değil konu takibi** üzerine kurulu: takipçi
grafiği, "önerilen kişiler", başkasının profilini gezme gibi sosyal ağ mekanikleri yok.
İnsanlar hashtag takip eder, birbirini değil.

---

## Ekran görüntüleri

> _Buraya eklenecek — `docs/screenshots/` altına koyup aşağıdaki bağlantıları güncelle._

| Eşik / Onboarding | Akış | Keşfet |
|---|---|---|
| ![](docs/screenshots/threshold.png) | ![](docs/screenshots/feed.png) | ![](docs/screenshots/discover.png) |

| Gönderi + yorumlar | Profil | Ayarlar |
|---|---|---|
| ![](docs/screenshots/post.png) | ![](docs/screenshots/profile.png) | ![](docs/screenshots/settings.png) |

---

## Özellikler

- **Kimlik doğrulama** — e-posta + şifre, kayıtta kullanıcı adı (debounce'lu müsaitlik
  kontrolü) ve doğum tarihi. "Eşik" ekranı ve giriş öncesi kısa bir nefes alanı.
- **Akış** — "arafta anı" paylaşımları; varsayılan anonim veya isimli. "bende de öyle"
  tepkisi (optimistic update), hashtag'ler.
- **Gönderi detayı** — iç içe yorumlar + yanıtlar, yorum beğenisi, paylaş, şikayet.
- **Keşfet**
  - **Bugünün Nabzı** — son 24 saatte paylaşım almış ilk 5 hashtag, çoktan aza sıralı
  - Kişiselleştirilmiş konular ("Sana göre"), takip edilen etiketler
  - Haftalık podcast kartı, konu arama
- **Etiket detayı** (`/topic/[tag]`) — o başlığa ait paylaşımlar ve toplam sayaç.
- **Bildirimler** — uygulama içi liste + okunmamış rozeti. Türler: paylaşıma beğeni,
  paylaşıma yorum, yoruma tepki, haftalık podcast yayını. Tümü `security definer`
  Postgres trigger'ları ile üretilir; istemci doğrudan bildirim ekleyemez.
- **Moderasyon** — gönderi/yorum `•••` menüsünden **engelle** ve **şikayet et**.
  Engellenen kullanıcıların isimli paylaşım/yorumları akıştan ve yorumlardan süzülür.
  Ayarlar'dan engel yönetimi.
- **Profil** — sade bir kimlik ekranı: isim, kullanıcı adı, bio, "şu sıralar" durumu,
  ilgi alanları, avatar seçici. Profil yalnızca sahibine görünür; sosyal bir vitrin değil.
- **Ayarlar** — hesap bilgileri, şifre & güvenlik, engellenenler, bildirim tercihleri,
  içerik tercihleri, destek. Çıkış / hesap silme ortalanmış modal ile.

## Teknoloji

| Katman | Araç |
|---|---|
| Uygulama | Expo SDK 54, React Native 0.81 (new architecture), expo-router v6, TypeScript |
| Durum / veri | TanStack Query (react-query) |
| Animasyon | react-native-reanimated v4 |
| Backend | Supabase — Postgres + Row Level Security + Auth + Storage |
| Tipografi | Fraunces (yalnız logotype) + Inter (gövde) |

## Mimari notları

- **RLS + trigger'lar.** Sayaçlar (`reaction_count`, `comment_count`) ve bildirimler
  istemcide değil, `security definer` trigger'larla tutulur. `notifications` tablosuna
  hiçbir kullanıcı doğrudan yazamaz, başkasının satırını okuyamaz.
- **Trend hesabı istemcide.** "Bugünün Nabzı" ve konu arama, son 300 paylaşımlık tek bir
  sorgudan türetilir (`hooks/useTrendingTopics.ts`) — MVP için yeterli; ölçek büyüyünce
  bir Postgres view/RPC'ye taşınır.
- **İki paletli tasarım sistemi.** `editorial` (auth / profil / ayarlar) ve `discover`
  (Keşfet) — `lib/theme.ts`. Gövde metninde süslü font kullanılmaz.
- **PostgREST embed yok.** `posts.author_id` → `auth.users` FK'si üzerinden geldiği için
  yazar profilleri ayrı bir adımda çekilir (bkz. `hooks/usePosts.ts`).
- **Anonimlik önce.** Paylaşımlar varsayılan `is_anonymous = true`; isim koymak bir tercih.

## Proje yapısı

```
app/                 expo-router ekranları
  (auth)/            eşik, giriş, kayıt
  (tabs)/            akış, keşfet, bildirimler, profil
  post/[id].tsx      gönderi + yorumlar
  topic/[tag].tsx    etiket detayı
  settings/          ayarlar ekranları
components/           PostCard, TopBar, GlassTabBar, editorial/ (ortak UI)
hooks/               react-query hook'ları (usePosts, useComments, useNotifications, ...)
lib/                 theme, types, supabase istemcisi, motion
providers/           SessionProvider, ToastProvider
supabase/schema.sql  tüm veritabanı şeması (idempotent, tekrar çalıştırılabilir)
```

## Kurulum

```bash
npm install
cp .env.example .env   # Supabase URL + anon key'i gir (Project Settings > API)
npm start              # Expo — QR ile Expo Go, veya i/a ile simülatör
```

`.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://<proje>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Veritabanı

Tek dosya: [`supabase/schema.sql`](supabase/schema.sql). Supabase SQL Editor'e yapıştırıp
çalıştır — tablolar, RLS politikaları, trigger'lar ve storage bucket'ı oluşur. Baştan
tekrar çalıştırmaya karşı güvenlidir.

Tablolar: `profiles`, `posts`, `reactions`, `comments`, `comment_likes`, `topic_follows`,
`notifications`, `blocks`, `reports`, `weekly_podcast`.

## Bilinen sınırlar

- **Hesap silme** sunucu tarafı bir işlem gerektirdiğinden şu an destek ekibine
  yönlendiriyor (oturumu kapatıp `destek@arafta.app`).
- **Telefon push bildirimi yok** — yalnızca uygulama içi bildirim listesi var.
- **Başkasının profilini görüntüleme yok** — ürün kararı (konu takibi ≠ kişi takibi).
- Manuel test edildi; otomatik test paketi yok.
