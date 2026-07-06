import { Recipe, WeeklyMenu, ShoppingListItem, ShoppingList } from "./types";

export function buildShoppingList(
  menu: WeeklyMenu,
  recipes: Recipe[],
  previous?: ShoppingList | null
): ShoppingList {
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));
  const itemsMap = new Map<string, ShoppingListItem>();

  const addIngredientsFrom = (recipeId: string | null) => {
    if (!recipeId) return;
    const recipe = recipeMap.get(recipeId);
    if (!recipe) return;

    for (const ing of recipe.ingredients) {
      const key = ing.name.trim().toLowerCase();
      const existing = itemsMap.get(key);
      if (existing) {
        if (!existing.fromRecipes.includes(recipe.name)) {
          existing.fromRecipes.push(recipe.name);
        }
        if (ing.quantity && !existing.quantities.includes(ing.quantity)) {
          existing.quantities.push(ing.quantity);
        }
      } else {
        const previousItem = previous?.items.find(
          (i) => i.name.trim().toLowerCase() === key
        );
        itemsMap.set(key, {
          name: ing.name.trim(),
          haveIt: previousItem?.haveIt ?? false,
          fromRecipes: [recipe.name],
          quantities: ing.quantity ? [ing.quantity] : [],
        });
      }
    }
  };

  for (const day of menu.days) {
    addIngredientsFrom(day.almuerzoId);
    addIngredientsFrom(day.cenaId);
  }

  const items = Array.from(itemsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es")
  );

  return { weekId: menu.id, items };
}
