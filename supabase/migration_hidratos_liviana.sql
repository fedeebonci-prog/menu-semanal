-- Migración: agrega "alta en hidratos" y "liviana" a las recetas.
-- Ejecutar en Supabase: Project > SQL Editor > New query > pegar todo > Run.
-- Seguro de correr más de una vez.

alter table public.recipes add column if not exists high_carb boolean not null default false;
alter table public.recipes add column if not exists light boolean not null default false;

-- Valores estimados para las 21 recetas ya cargadas. Son una primera pasada
-- razonable (pastas/guisos/papas/arroz = hidratos; ensaladas/sopas/pescado a
-- la plancha = liviana) — revisenlas y ajústenlas libremente desde el
-- formulario de "Recetas" si no están de acuerdo con alguna.
update public.recipes set high_carb = true,  light = false where id = 'seed-1';
update public.recipes set high_carb = false, light = false where id = 'seed-2';
update public.recipes set high_carb = true,  light = false where id = 'seed-3';
update public.recipes set high_carb = true,  light = false where id = 'seed-4';
update public.recipes set high_carb = true,  light = false where id = 'seed-5';
update public.recipes set high_carb = true,  light = false where id = 'seed-6';
update public.recipes set high_carb = false, light = true  where id = 'seed-7';
update public.recipes set high_carb = false, light = true  where id = 'seed-8';
update public.recipes set high_carb = true,  light = false where id = 'seed-9';
update public.recipes set high_carb = true,  light = false where id = 'seed-10';
update public.recipes set high_carb = true,  light = false where id = 'seed-11';
update public.recipes set high_carb = true,  light = false where id = 'seed-12';
update public.recipes set high_carb = false, light = false where id = 'seed-13';
update public.recipes set high_carb = false, light = true  where id = 'seed-14';
update public.recipes set high_carb = true,  light = false where id = 'seed-15';
update public.recipes set high_carb = true,  light = false where id = 'seed-16';
update public.recipes set high_carb = true,  light = true  where id = 'seed-17';
update public.recipes set high_carb = true,  light = false where id = 'seed-18';
update public.recipes set high_carb = false, light = true  where id = 'seed-19';
update public.recipes set high_carb = false, light = true  where id = 'seed-20';
update public.recipes set high_carb = true,  light = false where id = 'seed-21';
