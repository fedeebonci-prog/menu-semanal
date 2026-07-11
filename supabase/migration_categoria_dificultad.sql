-- Migración: agrega categoría y dificultad a las recetas.
-- Ejecutar en Supabase: Project > SQL Editor > New query > pegar todo > Run.
-- Es seguro correrlo aunque ya se haya corrido antes (usa IF NOT EXISTS / upsert de valores).

alter table public.recipes add column if not exists category text not null default 'principal';
alter table public.recipes add column if not exists difficulty text not null default 'media';

update public.recipes set category = 'principal', difficulty = 'media' where id = 'seed-1';
update public.recipes set category = 'principal', difficulty = 'media' where id = 'seed-2';
update public.recipes set category = 'principal', difficulty = 'media' where id = 'seed-3';
update public.recipes set category = 'guiso', difficulty = 'media' where id = 'seed-4';
update public.recipes set category = 'tarta', difficulty = 'media' where id = 'seed-5';
update public.recipes set category = 'pasta', difficulty = 'rapida' where id = 'seed-6';
update public.recipes set category = 'ensalada', difficulty = 'rapida' where id = 'seed-7';
update public.recipes set category = 'principal', difficulty = 'rapida' where id = 'seed-8';
update public.recipes set category = 'principal', difficulty = 'media' where id = 'seed-9';
update public.recipes set category = 'guiso', difficulty = 'elaborada' where id = 'seed-10';
update public.recipes set category = 'ensalada', difficulty = 'rapida' where id = 'seed-11';
update public.recipes set category = 'principal', difficulty = 'media' where id = 'seed-12';
update public.recipes set category = 'sandwich', difficulty = 'media' where id = 'seed-13';
update public.recipes set category = 'principal', difficulty = 'rapida' where id = 'seed-14';
update public.recipes set category = 'pasta', difficulty = 'rapida' where id = 'seed-15';
update public.recipes set category = 'principal', difficulty = 'rapida' where id = 'seed-16';
update public.recipes set category = 'ensalada', difficulty = 'rapida' where id = 'seed-17';
update public.recipes set category = 'guiso', difficulty = 'elaborada' where id = 'seed-18';
update public.recipes set category = 'sopa', difficulty = 'media' where id = 'seed-19';
update public.recipes set category = 'principal', difficulty = 'rapida' where id = 'seed-20';
update public.recipes set category = 'pizza', difficulty = 'media' where id = 'seed-21';

-- Por si Fede o vos cargaron alguna receta nueva antes de correr esto: le pone
-- 'principal' / 'media' por defecto (así queda editable, no en blanco).
update public.recipes set category = 'principal' where category is null;
update public.recipes set difficulty = 'media' where difficulty is null;
