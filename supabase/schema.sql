-- =====================================================
-- FC TRACKER - Schema Supabase
-- À exécuter dans Supabase → SQL Editor → New Query
-- =====================================================

-- Profil joueur lié à auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Matchs
create table if not exists public.matches (
  id bigserial primary key,
  player1_id uuid not null references public.profiles(id) on delete cascade,
  player2_id uuid not null references public.profiles(id) on delete cascade,
  player1_score int not null check (player1_score >= 0),
  player2_score int not null check (player2_score >= 0),
  team1 text,
  team2 text,
  played_at timestamptz default now(),
  created_by uuid references public.profiles(id),
  notes text,
  check (player1_id <> player2_id)
);

create index if not exists matches_player1_idx on public.matches(player1_id);
create index if not exists matches_player2_idx on public.matches(player2_id);
create index if not exists matches_played_at_idx on public.matches(played_at desc);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
alter table public.profiles enable row level security;
alter table public.matches  enable row level security;

drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "matches_read_all" on public.matches;
create policy "matches_read_all" on public.matches
  for select using (true);

drop policy if exists "matches_insert_authenticated" on public.matches;
create policy "matches_insert_authenticated" on public.matches
  for insert with check (auth.uid() is not null);

drop policy if exists "matches_delete_creator" on public.matches;
create policy "matches_delete_creator" on public.matches
  for delete using (auth.uid() = created_by);

-- =====================================================
-- VUE : Leaderboard (V/N/D, points, ratio)
-- =====================================================
create or replace view public.v_leaderboard as
with all_results as (
  select player1_id as player_id,
         case when player1_score > player2_score then 'W'
              when player1_score < player2_score then 'L'
              else 'D' end as result,
         player1_score as gf, player2_score as ga
    from public.matches
  union all
  select player2_id as player_id,
         case when player2_score > player1_score then 'W'
              when player2_score < player1_score then 'L'
              else 'D' end as result,
         player2_score as gf, player1_score as ga
    from public.matches
)
select p.id,
       p.username,
       p.avatar_url,
       count(*)::int                                           as played,
       count(*) filter (where result = 'W')::int               as wins,
       count(*) filter (where result = 'D')::int               as draws,
       count(*) filter (where result = 'L')::int               as losses,
       coalesce(sum(gf), 0)::int                               as goals_for,
       coalesce(sum(ga), 0)::int                               as goals_against,
       (coalesce(sum(gf), 0) - coalesce(sum(ga), 0))::int      as goal_diff,
       (count(*) filter (where result = 'W') * 3
        + count(*) filter (where result = 'D'))::int           as points,
       case when count(*) > 0
            then round(100.0 * count(*) filter (where result = 'W') / count(*), 1)
            else 0 end                                         as win_rate
  from public.profiles p
  left join all_results r on r.player_id = p.id
 group by p.id, p.username, p.avatar_url;

-- =====================================================
-- FONCTION : Stats d'un duo (head-to-head + titre)
-- Retourne: matches joués, victoires de chacun, meilleure série,
-- défaites consécutives actuelles de A contre B, et titre attribué.
--
-- TITRES (de A vers B) basés sur les défaites consécutives ACTUELLES de A contre B :
--   3  défaites de suite → A est le "lkebda" de B
--   5  défaites de suite → A est la "zawja" de B
--   10 défaites de suite → A est la "l9a7ba" de B
-- =====================================================
create or replace function public.duo_stats(p_a uuid, p_b uuid)
returns table (
  total_matches int,
  a_wins        int,
  b_wins        int,
  draws         int,
  a_goals       int,
  b_goals       int,
  a_current_loss_streak int,
  b_current_loss_streak int,
  a_title       text,
  b_title       text,
  last_played   timestamptz
)
language plpgsql
as $$
declare
  rec record;
  a_streak int := 0;
  b_streak int := 0;
  a_streak_locked boolean := false;
  b_streak_locked boolean := false;
begin
  total_matches := 0; a_wins := 0; b_wins := 0; draws := 0;
  a_goals := 0; b_goals := 0;

  -- Parcours du plus récent au plus ancien pour calculer les streaks "actuels"
  for rec in
    select *,
           case when player1_id = p_a then player1_score else player2_score end as a_sc,
           case when player1_id = p_a then player2_score else player1_score end as b_sc
      from public.matches
     where (player1_id = p_a and player2_id = p_b)
        or (player1_id = p_b and player2_id = p_a)
     order by played_at desc, id desc
  loop
    total_matches := total_matches + 1;
    a_goals := a_goals + rec.a_sc;
    b_goals := b_goals + rec.b_sc;

    if rec.a_sc > rec.b_sc then
      a_wins := a_wins + 1;
      -- A a gagné → la série de défaites de A s'arrête, celle de B continue
      a_streak_locked := true;
      if not b_streak_locked then b_streak := b_streak + 1; end if;
    elsif rec.a_sc < rec.b_sc then
      b_wins := b_wins + 1;
      b_streak_locked := true;
      if not a_streak_locked then a_streak := a_streak + 1; end if;
    else
      draws := draws + 1;
      a_streak_locked := true;
      b_streak_locked := true;
    end if;

    if last_played is null then last_played := rec.played_at; end if;
  end loop;

  a_current_loss_streak := a_streak;
  b_current_loss_streak := b_streak;

  -- Attribution des titres
  a_title := case
    when a_streak >= 10 then 'l9a7ba'
    when a_streak >= 5  then 'zawja'
    when a_streak >= 3  then 'lkebda'
    else null
  end;

  b_title := case
    when b_streak >= 10 then 'l9a7ba'
    when b_streak >= 5  then 'zawja'
    when b_streak >= 3  then 'lkebda'
    else null
  end;

  return next;
end;
$$;

-- =====================================================
-- FONCTION : Tous les titres actuels (pour affichage global)
-- Retourne pour chaque (loser, winner) le titre actuel
-- =====================================================
create or replace function public.all_titles()
returns table (
  loser_id uuid,
  loser_username text,
  winner_id uuid,
  winner_username text,
  loss_streak int,
  title text
)
language plpgsql
as $$
declare
  pa record;
  pb record;
  d  record;
begin
  for pa in select id, username from public.profiles loop
    for pb in select id, username from public.profiles where id <> pa.id loop
      select * into d from public.duo_stats(pa.id, pb.id);
      if d.a_title is not null then
        loser_id := pa.id;
        loser_username := pa.username;
        winner_id := pb.id;
        winner_username := pb.username;
        loss_streak := d.a_current_loss_streak;
        title := d.a_title;
        return next;
      end if;
    end loop;
  end loop;
end;
$$;

-- =====================================================
-- TRIGGER : Auto-création du profil au signup
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- REALTIME : activer les broadcasts pour les matchs
-- =====================================================
alter publication supabase_realtime add table public.matches;
