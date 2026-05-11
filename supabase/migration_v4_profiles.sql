-- =====================================================
-- FC TRACKER — MIGRATION V4 : Profils enrichis
-- À exécuter dans Supabase → SQL Editor
-- =====================================================

-- 1) Ajouter les colonnes manquantes à profiles
alter table public.profiles
  add column if not exists emoji text default '⚽',
  add column if not exists bio text,
  add column if not exists favorite_team text,
  add column if not exists favorite_color text default '#00ff87';

-- 2) Vue : worst_title — pour chaque joueur, son pire titre actif
--    (sert à afficher l'emoji dynamique partout dans l'app)
create or replace view public.v_player_worst_title as
with all_t as (
  select loser_id as player_id, title,
         case when title = 'l9a7ba' then 3
              when title = 'zawja'  then 2
              when title = 'lkebda' then 1
              else 0 end as severity
    from public.all_titles()
)
select p.id as player_id,
       p.username,
       p.emoji,
       (select t.title
          from all_t t
         where t.player_id = p.id
         order by severity desc
         limit 1) as worst_title
  from public.profiles p;
