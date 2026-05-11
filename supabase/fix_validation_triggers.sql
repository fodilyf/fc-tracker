-- =====================================================
-- FIX VALIDATION : ajoute les triggers d'auto-validation
-- À exécuter dans Supabase → SQL Editor
-- =====================================================

-- 1) AUTO-VALIDATION du créateur quand il insère un match
--    Si le créateur est player1 → validated_by_p1 = true
--    Si le créateur est player2 → validated_by_p2 = true
--    Si le créateur n'est ni l'un ni l'autre → aucun auto-vote (besoin des 2)
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

  -- Si les 2 ont déjà validé (cas très rare au moment de l'insert)
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

-- 2) AUTO-PASSAGE à "validated" quand les 2 ont validé (après update)
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

-- =====================================================
-- 3) RATTRAPAGE pour les matchs existants
--    Pour chaque match en "pending" :
--    - Si le créateur est player1 → on met validated_by_p1 = true
--    - Si le créateur est player2 → on met validated_by_p2 = true
--    Les matchs où l'autre joueur a déjà cliqué passent en "validated"
-- =====================================================
update public.matches
   set validated_by_p1 = true
 where status = 'pending'
   and created_by = player1_id
   and validated_by_p1 = false;

update public.matches
   set validated_by_p2 = true
 where status = 'pending'
   and created_by = player2_id
   and validated_by_p2 = false;

-- Bascule en "validated" tous ceux qui ont les 2 cases cochées
update public.matches
   set status = 'validated'
 where status = 'pending'
   and validated_by_p1 = true
   and validated_by_p2 = true;
