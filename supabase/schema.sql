-- Ejecutar este script en Supabase: Project > SQL Editor > New query > pegar todo > Run

create table if not exists public.recipes (
  id text primary key,
  name text not null,
  protein_type text not null,
  meal_type text not null,
  season text not null,
  high_protein boolean not null default false,
  ingredients jsonb not null default '[]',
  notes text not null default '',
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id text primary key,
  gym_days int[] not null default '{1,2,4}',
  season text not null default 'invierno'
);

create table if not exists public.weekly_menus (
  id text primary key,
  week_start text not null,
  season text not null,
  days jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.shopping_lists (
  week_id text primary key,
  items jsonb not null
);

alter table public.recipes enable row level security;
alter table public.settings enable row level security;
alter table public.weekly_menus enable row level security;
alter table public.shopping_lists enable row level security;

-- Esta app no tiene login: la usan solo Fede y su novia con el link.
-- Las políticas de abajo permiten leer/escribir con la clave pública (anon),
-- lo cual está bien para datos de bajo riesgo como recetas y compras.
drop policy if exists "allow all recipes" on public.recipes;
create policy "allow all recipes" on public.recipes for all using (true) with check (true);

drop policy if exists "allow all settings" on public.settings;
create policy "allow all settings" on public.settings for all using (true) with check (true);

drop policy if exists "allow all weekly_menus" on public.weekly_menus;
create policy "allow all weekly_menus" on public.weekly_menus for all using (true) with check (true);

drop policy if exists "allow all shopping_lists" on public.shopping_lists;
create policy "allow all shopping_lists" on public.shopping_lists for all using (true) with check (true);

insert into public.settings (id, gym_days, season) values ('default', '{1,2,4}', 'invierno')
on conflict (id) do nothing;

insert into public.recipes (id, name, protein_type, meal_type, season, high_protein, ingredients, notes, source, created_at) values
('seed-1', 'Milanesas de carne con puré', 'carne', 'cena', 'todo_el_anio', true,
  '[{"name":"Milanesas de carne","quantity":"4 unidades"},{"name":"Papas","quantity":"1 kg"},{"name":"Leche","quantity":"100 ml"},{"name":"Manteca","quantity":"50 g"}]', '', 'manual', '2026-01-01'),
('seed-2', 'Milanesas de pollo con ensalada', 'pollo', 'ambos', 'todo_el_anio', true,
  '[{"name":"Milanesas de pollo","quantity":"4 unidades"},{"name":"Lechuga","quantity":"1 planta"},{"name":"Tomate","quantity":"2 unidades"},{"name":"Cebolla","quantity":"1/2 unidad"}]', '', 'manual', '2026-01-01'),
('seed-3', 'Pollo al horno con papas', 'pollo', 'cena', 'todo_el_anio', true,
  '[{"name":"Pollo (presas)","quantity":"1 kg"},{"name":"Papas","quantity":"1 kg"},{"name":"Cebolla","quantity":"1 unidad"},{"name":"Ajo","quantity":"2 dientes"}]', '', 'manual', '2026-01-01'),
('seed-4', 'Guiso de lentejas', 'legumbre', 'cena', 'invierno', false,
  '[{"name":"Lentejas","quantity":"500 g"},{"name":"Panceta","quantity":"150 g"},{"name":"Chorizo colorado","quantity":"1 unidad"},{"name":"Zanahoria","quantity":"2 unidades"},{"name":"Cebolla","quantity":"1 unidad"},{"name":"Papa","quantity":"2 unidades"}]', '', 'manual', '2026-01-01'),
('seed-5', 'Tarta de acelga y ricota', 'vegetariano', 'ambos', 'todo_el_anio', false,
  '[{"name":"Tapas de tarta","quantity":"2 unidades"},{"name":"Acelga","quantity":"1 atado"},{"name":"Ricota","quantity":"400 g"},{"name":"Huevo","quantity":"2 unidades"},{"name":"Queso rallado","quantity":"100 g"}]', '', 'manual', '2026-01-01'),
('seed-6', 'Fideos con salsa bolognesa', 'pasta', 'ambos', 'todo_el_anio', true,
  '[{"name":"Fideos","quantity":"500 g"},{"name":"Carne picada","quantity":"400 g"},{"name":"Salsa de tomate","quantity":"1 frasco"},{"name":"Cebolla","quantity":"1 unidad"},{"name":"Queso rallado","quantity":"100 g"}]', '', 'manual', '2026-01-01'),
('seed-7', 'Ensalada César con pollo', 'pollo', 'almuerzo', 'verano', true,
  '[{"name":"Pechuga de pollo","quantity":"400 g"},{"name":"Lechuga","quantity":"1 planta"},{"name":"Pan para croutones","quantity":"4 rebanadas"},{"name":"Queso parmesano","quantity":"50 g"},{"name":"Aderezo césar","quantity":"1 pote"}]', '', 'manual', '2026-01-01'),
('seed-8', 'Merluza a la plancha con ensalada', 'pescado', 'cena', 'todo_el_anio', true,
  '[{"name":"Filetes de merluza","quantity":"4 unidades"},{"name":"Limón","quantity":"1 unidad"},{"name":"Ensalada mixta","quantity":"1 bolsa"}]', '', 'manual', '2026-01-01'),
('seed-9', 'Tortilla de papas', 'huevo', 'cena', 'todo_el_anio', false,
  '[{"name":"Huevos","quantity":"6 unidades"},{"name":"Papas","quantity":"500 g"},{"name":"Cebolla","quantity":"1 unidad"}]', '', 'manual', '2026-01-01'),
('seed-10', 'Locro', 'carne', 'cena', 'invierno', true,
  '[{"name":"Maíz para locro","quantity":"500 g"},{"name":"Porotos","quantity":"300 g"},{"name":"Zapallo","quantity":"500 g"},{"name":"Chorizo colorado","quantity":"2 unidades"},{"name":"Panceta","quantity":"150 g"},{"name":"Carne para guiso","quantity":"300 g"}]', '', 'manual', '2026-01-01'),
('seed-11', 'Ensalada de fideos fría con atún', 'pasta', 'almuerzo', 'verano', true,
  '[{"name":"Fideos tirabuzón","quantity":"400 g"},{"name":"Atún","quantity":"2 latas"},{"name":"Choclo","quantity":"1 lata"},{"name":"Tomate","quantity":"2 unidades"},{"name":"Mayonesa","quantity":"1 pote chico"}]', '', 'manual', '2026-01-01'),
('seed-12', 'Wok de pollo y vegetales con arroz', 'pollo', 'cena', 'todo_el_anio', true,
  '[{"name":"Pechuga de pollo","quantity":"400 g"},{"name":"Morrón","quantity":"1 unidad"},{"name":"Cebolla","quantity":"1 unidad"},{"name":"Zanahoria","quantity":"2 unidades"},{"name":"Brócoli","quantity":"1 unidad"},{"name":"Salsa de soja","quantity":"1 botella chica"},{"name":"Arroz","quantity":"300 g"}]', '', 'manual', '2026-01-01'),
('seed-13', 'Hamburguesas caseras con ensalada', 'carne', 'cena', 'todo_el_anio', true,
  '[{"name":"Carne picada","quantity":"500 g"},{"name":"Pan de hamburguesa","quantity":"4 unidades"},{"name":"Lechuga","quantity":"1 planta"},{"name":"Tomate","quantity":"2 unidades"},{"name":"Queso","quantity":"4 fetas"}]', '', 'manual', '2026-01-01'),
('seed-14', 'Revuelto de zapallitos con huevo', 'huevo', 'cena', 'verano', false,
  '[{"name":"Zapallitos","quantity":"4 unidades"},{"name":"Huevo","quantity":"4 unidades"},{"name":"Cebolla","quantity":"1 unidad"},{"name":"Queso","quantity":"100 g"}]', '', 'manual', '2026-01-01'),
('seed-15', 'Ñoquis con salsa', 'pasta', 'cena', 'todo_el_anio', false,
  '[{"name":"Ñoquis","quantity":"1 kg"},{"name":"Salsa de tomate o crema","quantity":"1 frasco"},{"name":"Queso rallado","quantity":"100 g"}]', '', 'manual', '2026-01-01'),
('seed-16', 'Pechuga de pollo grillada con arroz y brócoli', 'pollo', 'almuerzo', 'todo_el_anio', true,
  '[{"name":"Pechuga de pollo","quantity":"500 g"},{"name":"Arroz","quantity":"300 g"},{"name":"Brócoli","quantity":"1 unidad"}]', 'Ideal para día de gimnasio', 'manual', '2026-01-01'),
('seed-17', 'Ensalada de garbanzos', 'legumbre', 'almuerzo', 'verano', false,
  '[{"name":"Garbanzos","quantity":"400 g"},{"name":"Tomate","quantity":"2 unidades"},{"name":"Cebolla","quantity":"1/2 unidad"},{"name":"Morrón","quantity":"1 unidad"},{"name":"Atún","quantity":"1 lata (opcional)"}]', '', 'manual', '2026-01-01'),
('seed-18', 'Carbonada', 'carne', 'cena', 'invierno', true,
  '[{"name":"Carne para guiso","quantity":"500 g"},{"name":"Zapallo","quantity":"500 g"},{"name":"Choclo","quantity":"2 unidades"},{"name":"Papa","quantity":"2 unidades"},{"name":"Batata","quantity":"2 unidades"},{"name":"Durazno","quantity":"2 unidades"}]', '', 'manual', '2026-01-01'),
('seed-19', 'Sopa de verduras con pollo', 'pollo', 'cena', 'invierno', false,
  '[{"name":"Pollo (presas)","quantity":"500 g"},{"name":"Zapallo","quantity":"300 g"},{"name":"Zanahoria","quantity":"2 unidades"},{"name":"Apio","quantity":"1 rama"},{"name":"Fideos chicos","quantity":"200 g"}]', '', 'manual', '2026-01-01'),
('seed-20', 'Bife a la plancha con ensalada', 'carne', 'cena', 'todo_el_anio', true,
  '[{"name":"Bife de carne","quantity":"4 unidades"},{"name":"Ensalada mixta","quantity":"1 bolsa"},{"name":"Limón","quantity":"1 unidad"}]', 'Ideal para día de gimnasio', 'manual', '2026-01-01'),
('seed-21', 'Pizza casera', 'otro', 'cena', 'todo_el_anio', false,
  '[{"name":"Masa de pizza","quantity":"2 discos"},{"name":"Salsa de tomate","quantity":"1 frasco"},{"name":"Muzzarella","quantity":"400 g"},{"name":"Orégano","quantity":"al gusto"}]', '', 'manual', '2026-01-01')
on conflict (id) do nothing;
