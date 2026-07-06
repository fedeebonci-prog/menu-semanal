import { Recipe, Settings, WeeklyMenu, ShoppingList, ProteinType, MealType, Season } from "./types";
import { supabase } from "./supabaseClient";

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface RecipeRow {
  id: string;
  name: string;
  protein_type: string;
  meal_type: string;
  season: string;
  high_protein: boolean;
  ingredients: Recipe["ingredients"];
  notes: string;
  source: string;
  created_at: string;
}

function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    name: row.name,
    proteinType: row.protein_type as ProteinType,
    mealType: row.meal_type as MealType,
    season: row.season as Season,
    highProtein: row.high_protein,
    ingredients: row.ingredients,
    notes: row.notes ?? "",
    source: row.source as Recipe["source"],
    createdAt: row.created_at,
  };
}

function recipeToRow(recipe: Recipe): RecipeRow {
  return {
    id: recipe.id,
    name: recipe.name,
    protein_type: recipe.proteinType,
    meal_type: recipe.mealType,
    season: recipe.season,
    high_protein: recipe.highProtein,
    ingredients: recipe.ingredients,
    notes: recipe.notes,
    source: recipe.source,
    created_at: recipe.createdAt,
  };
}

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase.from("recipes").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(rowToRecipe);
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const { error } = await supabase.from("recipes").upsert(recipeToRow(recipe));
  if (error) throw error;
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}

interface SettingsRow {
  id: string;
  gym_days: number[];
  season: string;
}

const DEFAULT_SETTINGS: Settings = { gymDays: [1, 2, 4], season: "invierno" };

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle<SettingsRow>();
  if (error) throw error;
  if (!data) return DEFAULT_SETTINGS;
  return { gymDays: data.gym_days, season: data.season as Season };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({ id: "default", gym_days: settings.gymDays, season: settings.season });
  if (error) throw error;
}

interface WeeklyMenuRow {
  id: string;
  week_start: string;
  season: string;
  days: WeeklyMenu["days"];
  created_at: string;
}

function rowToMenu(row: WeeklyMenuRow): WeeklyMenu {
  return {
    id: row.id,
    weekStart: row.week_start,
    season: row.season as Season,
    days: row.days,
    createdAt: row.created_at,
  };
}

export async function getMenus(): Promise<Record<string, WeeklyMenu>> {
  const { data, error } = await supabase.from("weekly_menus").select("*");
  if (error) throw error;
  const menus: Record<string, WeeklyMenu> = {};
  for (const row of (data ?? []) as WeeklyMenuRow[]) {
    menus[row.id] = rowToMenu(row);
  }
  return menus;
}

export async function getMenu(weekId: string): Promise<WeeklyMenu | null> {
  const { data, error } = await supabase
    .from("weekly_menus")
    .select("*")
    .eq("id", weekId)
    .maybeSingle<WeeklyMenuRow>();
  if (error) throw error;
  return data ? rowToMenu(data) : null;
}

export async function saveMenu(menu: WeeklyMenu): Promise<void> {
  const { error } = await supabase.from("weekly_menus").upsert({
    id: menu.id,
    week_start: menu.weekStart,
    season: menu.season,
    days: menu.days,
    created_at: menu.createdAt,
  });
  if (error) throw error;
}

interface ShoppingListRow {
  week_id: string;
  items: ShoppingList["items"];
}

export async function getShoppingList(weekId: string): Promise<ShoppingList | null> {
  const { data, error } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("week_id", weekId)
    .maybeSingle<ShoppingListRow>();
  if (error) throw error;
  return data ? { weekId: data.week_id, items: data.items } : null;
}

export async function saveShoppingList(list: ShoppingList): Promise<void> {
  const { error } = await supabase
    .from("shopping_lists")
    .upsert({ week_id: list.weekId, items: list.items });
  if (error) throw error;
}
