-- =====================================================
-- FC TRACKER — MIGRATION V2
-- À exécuter UNE FOIS dans Supabase → SQL Editor
-- Ajoute : validation des matchs + nouvelle logique titres (reset symétrique)
-- =====================================================

-- 1) Ajouter colonnes de validation à la table matches
alter table public.matches
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'validated', 'rejected')),
  add column if not exists validated_by_p1 boolean not null default false,
  add column if not exists validated_by_p2 boolean not null default false;

-- 2) Index pour récupérer rapidement les matchs en attente
create index if not exists matches_status_idx on public.matches(status);

-- 3) Auto-validation au moment de l'insertion :
--    Si le créateur est player1 → validated_by_p1 = true
--    Si le créateur est player2 → validated_by_p2 = true
--    Si le créateur n'est ni p1 ni p2 (un 3ème joueur) → ni l'un ni l'autre
create or replace function public.handle_match_creation()
returns trigger
language plpgsql
as $$
begin
  if new.created_by = new.player1_id then
    new.validated_by_p1 := true;
  end if;
  if new.created_by = new.player2_id then
    new.validated_by_p2 := true;
  end if;

  -- Si les 2 joueurs ont validé → match validé direct
  if new.validated_by_p1 and new.validated_by_p2 then
    new.status := 'validated';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_match_creation on public.matches;
create trigger trg_match_creation
  before insert on public.matches
  for each row execute procedure public.handle_match_creation();

-- 4) À chaque update de validated_by_*, mettre status = validated si les 2 OK
create or replace function public.handle_match_validation()
returns trigger
language plpgsql
as $$
begin
  if new.validated_by_p1 and new.validated_by_p2 and new.status = 'pending' then
    new.status := 'validated';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_match_validation on public.matches;
create trigger trg_match_validation
  before update on public.matches
  for each row execute procedure public.handle_match_validation();

-- 5) Policy : seuls player1 ou player2 peuvent valider/rejeter un match en pending
drop policy if exists "matches_update_validate" on public.matches;
create policy "matches_update_validate" on public.matches
  for update using (
    auth.uid() = player1_id or auth.uid() = player2_id
  );

-- =====================================================
-- 6) RECRÉER la vue leaderboard pour ne compter QUE les matchs validés
-- =====================================================
create or replace view public.v_leaderboard as
with all_results as (
  select player1_id as player_id,
         case when player1_score > player2_score then 'W'
              when player1_score < player2_score then 'L'
              else 'D' end as result,
         player1_score as gf, player2_score as ga
    from public.matches
   where status = 'validated'
  union all
  select player2_id as player_id,
         case when player2_score > player1_score then 'W'
              when player2_score < player1_score then 'L'
              else 'D' end as result,
         player2_score as gf, player1_score as ga
    from public.matches
   where status = 'validated'
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
-- 7) DROP des anciennes fonctions (signature différente)
-- =====================================================
drop function if exists public.duo_stats(uuid, uuid);
drop function if exists public.all_titles();

-- =====================================================
-- 7b) NOUVELLE FONCTION duo_stats : reset SYMÉTRIQUE des titres
--    Logique :
--    - On compte les défaites consécutives ACTUELLES de chaque joueur
--    - MAIS on calcule aussi les victoires consécutives actuelles
--    - Si le joueur a un "titre actif", il faut le même nombre de victoires
--      consécutives que le seuil pour le faire sauter
--    Exemple :
--    - X perd 3 fois → X devient lkebda de Y
--    - X gagne 1 fois → X reste lkebda (car 3V nécessaires pour annuler lkebda)
--    - X gagne 3 fois → X n'est plus rien (titre annulé)
--    - X gagne 5 fois → X n'est plus rien
--    - Y perd 5 fois → Y devient zawja de X (titre s'inverse)
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
  a_current_win_streak  int,
  b_current_win_streak  int,
  a_title       text,
  b_title       text,
  last_played   timestamptz
)
language plpgsql
as $$
declare
  rec record;
  -- Variables pour parcourir les matchs récents
  a_loss_streak int := 0;
  a_win_streak  int := 0;
  b_loss_streak int := 0;
  b_win_streak  int := 0;
  -- Verrous : une fois qu'on rencontre un changement, on fige
  loss_streak_a_locked boolean := false;
  win_streak_a_locked  boolean := false;
  loss_streak_b_locked boolean := false;
  win_streak_b_locked  boolean := false;
begin
  total_matches := 0; a_wins := 0; b_wins := 0; draws := 0;
  a_goals := 0; b_goals := 0;

  -- Parcours du plus récent au plus ancien (matchs validés uniquement)
  for rec in
    select *,
           case when player1_id = p_a then player1_score else player2_score end as a_sc,
           case when player1_id = p_a then player2_score else player1_score end as b_sc
      from public.matches
     where status = 'validated'
       and ((player1_id = p_a and player2_id = p_b)
         or (player1_id = p_b and player2_id = p_a))
     order by played_at desc, id desc
  loop
    total_matches := total_matches + 1;
    a_goals := a_goals + rec.a_sc;
    b_goals := b_goals + rec.b_sc;

    if rec.a_sc > rec.b_sc then
      a_wins := a_wins + 1;
      -- A a gagné CE match → série de victoires de A continue, série de défaites de A s'arrête
      if not win_streak_a_locked then a_win_streak := a_win_streak + 1; end if;
      loss_streak_a_locked := true;
      -- Pour B : sa série de défaites continue, sa série de victoires s'arrête
      if not loss_streak_b_locked then b_loss_streak := b_loss_streak + 1; end if;
      win_streak_b_locked := true;
    elsif rec.a_sc < rec.b_sc then
      b_wins := b_wins + 1;
      if not win_streak_b_locked then b_win_streak := b_win_streak + 1; end if;
      loss_streak_b_locked := true;
      if not loss_streak_a_locked then a_loss_streak := a_loss_streak + 1; end if;
      win_streak_a_locked := true;
    else
      draws := draws + 1;
      -- Un nul casse toutes les séries
      win_streak_a_locked := true;
      loss_streak_a_locked := true;
      win_streak_b_locked := true;
      loss_streak_b_locked := true;
    end if;

    if last_played is null then last_played := rec.played_at; end if;
  end loop;

  a_current_loss_streak := a_loss_streak;
  b_current_loss_streak := b_loss_streak;
  a_current_win_streak  := a_win_streak;
  b_current_win_streak  := b_win_streak;

  -- =====================================================
  -- LOGIQUE DES TITRES (symétrique : V annule autant que L)
  -- Pour décider du titre actuel de A vis-à-vis de B :
  --   - On regarde a_loss_streak : si >= 10 → l9a7ba, >= 5 → zawja, >= 3 → lkebda
  --   - MAIS si A a une win streak >= seuil, on vérifie si elle "annule" un précédent titre
  --
  -- Le calcul se fait simplement : on regarde la PLUS GRANDE série actuelle.
  -- - Si A a perdu 3 d'affilée (sans avoir gagné depuis) → lkebda (peu importe le passé)
  -- - Si A a gagné 3 d'affilée (sans avoir perdu depuis) → pas de titre (le titre passé est annulé)
  -- C'est exactement ce que produit cette logique car a_loss_streak et a_win_streak
  -- sont des streaks ACTUELS (depuis le dernier match), donc l'un OU l'autre est forcément à 0.
  -- =====================================================
  a_title := case
    when a_loss_streak >= 10 then 'l9a7ba'
    when a_loss_streak >= 5  then 'zawja'
    when a_loss_streak >= 3  then 'lkebda'
    else null
  end;

  b_title := case
    when b_loss_streak >= 10 then 'l9a7ba'
    when b_loss_streak >= 5  then 'zawja'
    when b_loss_streak >= 3  then 'lkebda'
    else null
  end;

  return next;
end;
$$;

-- =====================================================
-- 8) RECRÉER all_titles avec la nouvelle signature
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
-- 9) Vue helper : matchs en attente pour l'utilisateur connecté
-- =====================================================
create or replace view public.v_pending_matches as
select m.*,
       p1.username as p1_username,
       p2.username as p2_username,
       pc.username as creator_username
  from public.matches m
  left join public.profiles p1 on p1.id = m.player1_id
  left join public.profiles p2 on p2.id = m.player2_id
  left join public.profiles pc on pc.id = m.created_by
 where m.status = 'pending';
