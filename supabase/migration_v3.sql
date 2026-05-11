-- =====================================================
-- FC TRACKER — MIGRATION V3
-- À exécuter UNE FOIS dans Supabase → SQL Editor
-- Ajoute : système de contestation + arbitrage par tiers
--
-- WORKFLOW :
--   1. X ajoute un match → status='pending', auto-validé par X
--   2. Y reçoit notif → 2 options :
--      a) Valider → status='validated' ✅
--      b) Refuser → status='rejected', refused_by=Y ❌
--   3. Si rejected, X reçoit notif → 2 options :
--      a) Accepter le refus → match supprimé / reste rejected
--      b) Réclamer (contester) → status='disputed'
--   4. Si disputed, tout joueur (≠X et ≠Y) reçoit notif :
--      → vote final : validate ou reject
--      → status devient 'validated' ou 'rejected_final'
-- =====================================================

-- 1) Étendre le check sur status pour inclure les nouveaux statuts
alter table public.matches
  drop constraint if exists matches_status_check;

alter table public.matches
  add constraint matches_status_check
  check (status in ('pending', 'validated', 'rejected', 'disputed', 'rejected_final'));

-- 2) Nouvelles colonnes
alter table public.matches
  add column if not exists refused_by uuid references public.profiles(id),
  add column if not exists arbitrated_by uuid references public.profiles(id),
  add column if not exists arbitrated_at timestamptz;

-- 3) Vue : litiges à arbitrer (pour les joueurs tiers)
create or replace view public.v_disputed_matches as
select m.*,
       p1.username as p1_username,
       p2.username as p2_username,
       pc.username as creator_username,
       pr.username as refused_by_username
  from public.matches m
  left join public.profiles p1 on p1.id = m.player1_id
  left join public.profiles p2 on p2.id = m.player2_id
  left join public.profiles pc on pc.id = m.created_by
  left join public.profiles pr on pr.id = m.refused_by
 where m.status = 'disputed';

-- 4) Vue : matchs refusés (où le créateur peut réclamer)
create or replace view public.v_rejected_matches as
select m.*,
       p1.username as p1_username,
       p2.username as p2_username,
       pc.username as creator_username,
       pr.username as refused_by_username
  from public.matches m
  left join public.profiles p1 on p1.id = m.player1_id
  left join public.profiles p2 on p2.id = m.player2_id
  left join public.profiles pc on pc.id = m.created_by
  left join public.profiles pr on pr.id = m.refused_by
 where m.status = 'rejected';

-- 5) Mise à jour de la vue v_pending_matches pour inclure les infos
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

-- 6) Mettre à jour la vue leaderboard pour ne compter QUE les validés
--    (rejected_final ne compte pas non plus)
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
