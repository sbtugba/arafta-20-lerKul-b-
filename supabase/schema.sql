-- Arafta: 20'ler Kulübü — Supabase şeması
-- Supabase projenin SQL Editor'ünde bu dosyanın tamamını çalıştır.
-- Uygulama artık gerçek e-posta/şifre hesabı gerektiriyor — "Anonymous Sign-Ins"
-- açık olması gerekmiyor (kapalı da kalabilir; kullanılmıyor).

-- ---------------------------------------------------------------------------
-- profiles: "Profilim" modunda görünen kimlik. Anonim paylaşımlar buna dokunmaz —
-- is_anonymous=true bir post'ta bu profildeki hiçbir alan gösterilmez.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  bio text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "users can insert their own profile" on public.profiles;
create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- profiles: kimlik alanları — bunların hiçbiri kayıt sırasında zorunlu değil.
-- Kullanıcı hesap açar açmaz akışa düşer; profilini istediği zaman, "Profili
-- Düzenle"den doldurur. Bu yüzden hepsi nullable / boş varsayılanlı.
-- Bu blok, eski bir kuruluma karşı da güvenle tekrar çalıştırılabilir.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'tagline'
  ) then
    alter table public.profiles rename column tagline to bio;
  end if;
end $$;

alter table public.profiles alter column display_name drop not null;
alter table public.profiles alter column display_name drop default;
alter table public.profiles alter column bio drop not null;
alter table public.profiles alter column bio drop default;

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists current_status text[] not null default '{}';
alter table public.profiles add column if not exists interests text[] not null default '{}';
alter table public.profiles add column if not exists profile_questions jsonb not null default '[]';
alter table public.profiles add column if not exists links jsonb not null default '{}';
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists location_visible boolean not null default true;
alter table public.profiles add column if not exists profile_visible boolean not null default true;

alter table public.profiles drop constraint if exists profiles_bio_length;
alter table public.profiles add constraint profiles_bio_length check (bio is null or char_length(bio) <= 180);

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format check (username is null or username ~ '^[a-z0-9_]{3,20}$');

create unique index if not exists profiles_username_unique_idx on public.profiles (username) where username is not null;

-- ---------------------------------------------------------------------------
-- profiles: Ayarlar sistemi alanları. "Etkileşimler" bölümündeki mesaj/mention/
-- etiketleme ayarları burada YOK — Arafta'da o özellikler henüz yok, UI'da
-- "Yakında" olarak duruyor, sahte bir state'e ihtiyaçları olmadı.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists birthdate date;
alter table public.profiles add column if not exists show_age boolean not null default false;
alter table public.profiles add column if not exists show_interests boolean not null default true;
alter table public.profiles add column if not exists show_active boolean not null default true;
alter table public.profiles add column if not exists show_last_seen boolean not null default false;
-- "Kimler takip edebilir" gibi kişi-takibine dayalı ayarlar bilinçli olarak yok —
-- Arafta'da henüz bir takipçi grafiği yok (konu takibi üstüne kurulu), UI'da olmayan
-- bir özellik için sahte bir alan tutmadık. profile_visible (herkese açık/kapalı)
-- zaten var olan daha basit mekanizmayı kullanıyor.

alter table public.profiles add column if not exists notification_prefs jsonb not null default '{
  "new_follower": true, "follow_request": true, "post_like": true, "post_comment": true, "mention": true,
  "new_content": true, "suggested_people": false, "community_events": true,
  "important_announcements": true, "app_updates": false, "email_product": false
}'::jsonb;

alter table public.profiles add column if not exists content_prefs jsonb not null default '{
  "reduce_uninterested": true, "sensitive_content": false, "autoplay": true
}'::jsonb;

-- ---------------------------------------------------------------------------
-- blocks: kullanıcı engelleme. Engellenen kişinin paylaşımları istemci
-- tarafında süzülür (RLS burada zorunlu değil, posts zaten herkese açık).
-- ---------------------------------------------------------------------------
create table if not exists public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

drop policy if exists "users can read their own block list" on public.blocks;
create policy "users can read their own block list"
  on public.blocks for select
  using (auth.uid() = blocker_id);

drop policy if exists "users can block as themselves" on public.blocks;
create policy "users can block as themselves"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

drop policy if exists "users can unblock their own blocks" on public.blocks;
create policy "users can unblock their own blocks"
  on public.blocks for delete
  using (auth.uid() = blocker_id);

-- ---------------------------------------------------------------------------
-- reports: içerik/kullanıcı bildirimleri. Yalnızca bildiren kişi kendi
-- bildirimini görebilir — moderasyon panosu ayrı bir iş, bu MVP kapsamı dışında.
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

drop policy if exists "users can read their own reports" on public.reports;
create policy "users can read their own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

drop policy if exists "users can submit reports as themselves" on public.reports;
create policy "users can submit reports as themselves"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- ---------------------------------------------------------------------------
-- avatars: profil fotoğrafları için storage bucket'ı. Herkes görebilir,
-- yalnızca kendi klasörüne (kullanıcı id'si) yükleyip silebilir.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar images are publicly accessible" on storage.objects;
create policy "avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "users can upload their own avatar" on storage.objects;
create policy "users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users can replace their own avatar" on storage.objects;
create policy "users can replace their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users can delete their own avatar" on storage.objects;
create policy "users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- posts: bir "arafta anı". is_anonymous true ise istemci tarafında isim gösterilmez.
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  is_anonymous boolean not null default true,
  body text not null check (char_length(body) between 1 and 1000),
  tags text[] not null default '{}',
  reaction_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_tags_idx on public.posts using gin (tags);

alter table public.posts enable row level security;

drop policy if exists "posts are publicly readable" on public.posts;
create policy "posts are publicly readable"
  on public.posts for select
  using (true);

drop policy if exists "users can insert their own posts" on public.posts;
create policy "users can insert their own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

drop policy if exists "users can delete their own posts" on public.posts;
create policy "users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- reactions: "bende de öyle". Aynı kullanıcı aynı paylaşıma bir kez basabilir.
-- ---------------------------------------------------------------------------
create table if not exists public.reactions (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.reactions enable row level security;

drop policy if exists "reactions are publicly readable" on public.reactions;
create policy "reactions are publicly readable"
  on public.reactions for select
  using (true);

drop policy if exists "users can react as themselves" on public.reactions;
create policy "users can react as themselves"
  on public.reactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can remove their own reaction" on public.reactions;
create policy "users can remove their own reaction"
  on public.reactions for delete
  using (auth.uid() = user_id);

-- reaction_count'u posts tablosunda güncel tutan tetikleyici
create or replace function public.handle_reaction_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set reaction_count = reaction_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts set reaction_count = greatest(reaction_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_reaction_change on public.reactions;
create trigger on_reaction_change
  after insert or delete on public.reactions
  for each row execute function public.handle_reaction_change();

-- ---------------------------------------------------------------------------
-- comments: bir paylaşımın altına bırakılan yorumlar.
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  is_anonymous boolean not null default false,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id, created_at);

alter table public.comments add column if not exists parent_comment_id uuid references public.comments (id) on delete cascade;
alter table public.comments add column if not exists like_count integer not null default 0;

create index if not exists comments_parent_comment_id_idx on public.comments (parent_comment_id);

alter table public.comments enable row level security;

drop policy if exists "comments are publicly readable" on public.comments;
create policy "comments are publicly readable"
  on public.comments for select
  using (true);

drop policy if exists "users can insert their own comments" on public.comments;
create policy "users can insert their own comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

drop policy if exists "users can delete their own comments" on public.comments;
create policy "users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- comment_count'u posts tablosunda güncel tutan tetikleyici
create or replace function public.handle_comment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.handle_comment_change();

-- reports üzerinden yorum bildirimi de yapılabilsin (post_id gibi opsiyonel)
alter table public.reports add column if not exists comment_id uuid references public.comments (id) on delete cascade;

-- ---------------------------------------------------------------------------
-- comment_likes: bir yoruma verilen "bende de öyle" karşılığı, yorum ölçeğinde.
-- ---------------------------------------------------------------------------
create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_likes enable row level security;

drop policy if exists "comment likes are publicly readable" on public.comment_likes;
create policy "comment likes are publicly readable"
  on public.comment_likes for select
  using (true);

drop policy if exists "users can like comments as themselves" on public.comment_likes;
create policy "users can like comments as themselves"
  on public.comment_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can remove their own comment like" on public.comment_likes;
create policy "users can remove their own comment like"
  on public.comment_likes for delete
  using (auth.uid() = user_id);

-- comments.like_count'u güncel tutan tetikleyici
create or replace function public.handle_comment_like_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.comments set like_count = like_count + 1 where id = new.comment_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.comments set like_count = greatest(like_count - 1, 0) where id = old.comment_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_comment_like_change on public.comment_likes;
create trigger on_comment_like_change
  after insert or delete on public.comment_likes
  for each row execute function public.handle_comment_like_change();

-- ---------------------------------------------------------------------------
-- topic_follows: Arafta'da "kişi değil konu takibi" kararı — bkz. konsept dokümanı.
-- ---------------------------------------------------------------------------
create table if not exists public.topic_follows (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, topic)
);

alter table public.topic_follows enable row level security;

drop policy if exists "users can read their own followed topics" on public.topic_follows;
create policy "users can read their own followed topics"
  on public.topic_follows for select
  using (auth.uid() = user_id);

drop policy if exists "users can follow topics as themselves" on public.topic_follows;
create policy "users can follow topics as themselves"
  on public.topic_follows for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can unfollow their own topics" on public.topic_follows;
create policy "users can unfollow their own topics"
  on public.topic_follows for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Örnek veri (opsiyonel) — akışın boş görünmemesi için birkaç başlangıç paylaşımı.
-- author_id gerektirdiğinden, ilk anonim oturumu açtıktan sonra o kullanıcının
-- auth.uid() değerini bulup aşağıdaki INSERT'leri Supabase SQL Editor'den elle çalıştırabilirsin.
-- Örnek:
-- insert into public.posts (author_id, is_anonymous, body, tags)
-- values ('<uid>', true, '25 yaşındayım ve hâlâ ne olmak istediğimi bilmiyorum. Herkes bir yerlere gidiyor gibi geliyor ama ben aynı yerde duruyorum.', array['kariyer','belirsizlik']);
