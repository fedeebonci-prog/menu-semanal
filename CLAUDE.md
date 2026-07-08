# Menú semanal — contexto del proyecto

App privada (sin login) para que Fede y su novia planifiquen el menú semanal y la
lista de compras. Generan un menú a partir de un banco de recetas, con reglas de
variedad, más proteína en días de gimnasio, y modo verano/invierno. La lista de
compras se arma sola a partir del menú y se puede tildar lo que ya tienen.

Deploy: https://menu-semanal-three.vercel.app/ (Vercel, auto-deploy on push a `main`)

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres) como única fuente de datos — no hay backend propio
- Sin autenticación: es un hobby project de dos personas, datos de baja
  sensibilidad (recetas y compras). Decisión consciente, ver "Seguridad" abajo.

## Cómo correrlo localmente

1. `npm install`
2. Crear `.env.local` en la raíz con:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   Pedile estos valores a Fede o a Supabase (Project Settings → API). Son las
   mismas credenciales para todo el mundo: la base de datos es compartida, así
   que los cambios que hagas localmente pegan contra los mismos datos reales.
3. `npm run dev` → http://localhost:3000

Antes de dar algo por terminado: `npx tsc --noEmit` y `npm run lint` no deben
tener errores.

## Estructura

- `src/lib/types.ts` — tipos centrales (Recipe, Settings, WeeklyMenu, ShoppingList)
- `src/lib/store.ts` — toda la lectura/escritura a Supabase (funciones async,
  una por entidad: getRecipes/saveRecipe, getSettings/saveSettings,
  getMenu/saveMenu, getShoppingList/saveShoppingList). Es la única capa que
  conoce Supabase; el resto de la app no importa `supabaseClient` directamente.
- `src/lib/menuGenerator.ts` — lógica pura (sin I/O) que arma el menú semanal:
  evita repetir receta/proteína, prioriza `highProtein` en días de gimnasio,
  filtra por estación. `regenerateDay` hace lo mismo para un solo día.
- `src/lib/shoppingList.ts` — agrega ingredientes del menú en una lista de
  compras, sumando cantidades cuando la unidad coincide (normaliza plurales
  tipo "unidades"/"unidad" vía `UNIT_ALIASES`).
- `src/lib/instagramParser.ts` — heurística para extraer ingredientes de un
  texto pegado (caption de Instagram). No hay scraping real, es texto pegado
  a mano.
- `src/lib/dateUtils.ts` — todo lo de semanas: `defaultWeekStart()` muestra la
  semana que viene si es sábado/domingo (así planifican el finde para la
  semana que arranca el lunes, no la que termina).
- `src/app/page.tsx` — tablero: menú semanal, navegación entre semanas (query
  param `?week=YYYY-MM-DD`, Lunes como inicio), botón "Recambiar" por día.
- `src/app/recetas/page.tsx` — alta/edición/borrado de recetas.
- `src/app/compras/page.tsx` — lista de compras de la semana seleccionada.
- `supabase/schema.sql` — script de referencia de las tablas y las 21 recetas
  semilla (ya ejecutado en el proyecto de Supabase real; solo hace falta
  volver a correrlo si se recrea la base desde cero).

## Convenciones

- Todo en español (UI, nombres de campos de negocio como `proteinType`,
  `mealType`). Los campos técnicos en inglés (camelCase en TS, snake_case en
  las columnas de Supabase — el mapeo está en `store.ts`).
- Diseño minimalista, paleta verde (ver variables `--brand*` en
  `globals.css`), mobile-first.
- No agregar dependencias ni abstracciones nuevas sin necesidad real: el
  proyecto se mantiene chico a propósito.
- Antes de dar un cambio de UI por terminado, probarlo corriendo el dev
  server y mirándolo en el navegador, no alcanza con que compile.

## Seguridad (decisión ya conversada con Fede, no volver a preguntar salvo que algo cambie)

- Repo de GitHub público, sin datos sensibles adentro.
- RLS de Supabase permite lectura/escritura a cualquiera con la anon key (que
  es pública por diseño, viaja en el bundle del sitio). No hay login.
- Se le ofreció a Fede pasar el repo a privado y/o agregar una contraseña
  compartida; eligió dejarlo como está porque el contenido (recetas, lista de
  compras) es de bajísima sensibilidad. Si se llega a guardar algo más
  sensible en esta app, replantear esta decisión.
