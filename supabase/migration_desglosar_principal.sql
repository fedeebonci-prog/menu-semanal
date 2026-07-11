-- Migración: separa la categoría genérica 'principal' en 5 categorías
-- específicas por proteína.
-- Ejecutar en Supabase: Project > SQL Editor > New query > pegar todo > Run.
-- Seguro de correr más de una vez.

update public.recipes set category = 'principal_vaca' where id = 'seed-1';
update public.recipes set category = 'principal_pollo' where id = 'seed-2';
update public.recipes set category = 'principal_pollo' where id = 'seed-3';
update public.recipes set category = 'principal_pescado' where id = 'seed-8';
update public.recipes set category = 'principal_veggie' where id = 'seed-9';
update public.recipes set category = 'principal_pollo' where id = 'seed-12';
update public.recipes set category = 'principal_veggie' where id = 'seed-14';
update public.recipes set category = 'principal_pollo' where id = 'seed-16';
update public.recipes set category = 'principal_vaca' where id = 'seed-20';

-- Por si hay alguna receta nueva (cargada por vos o Fede) que haya quedado
-- con la categoría vieja 'principal': la mapea según su proteína.
update public.recipes set category = 'principal_vaca' where category = 'principal' and protein_type = 'carne';
update public.recipes set category = 'principal_cerdo' where category = 'principal' and protein_type = 'cerdo';
update public.recipes set category = 'principal_pollo' where category = 'principal' and protein_type = 'pollo';
update public.recipes set category = 'principal_pescado' where category = 'principal' and protein_type = 'pescado';
update public.recipes set category = 'principal_veggie' where category = 'principal';
