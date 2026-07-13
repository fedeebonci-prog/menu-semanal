"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingList } from "@/lib/types";
import { addDays, defaultWeekStart, formatWeekRange } from "@/lib/dateUtils";
import { getShoppingList, saveShoppingList } from "@/lib/store";
import { sortShoppingItems } from "@/lib/shoppingList";
import ShoppingListView from "@/components/ShoppingListView";

function ComprasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekId = searchParams.get("week") ?? defaultWeekStart();

  const [list, setList] = useState<ShoppingList | null>(null);
  const [loadedWeekId, setLoadedWeekId] = useState<string | null>(null);
  const loading = loadedWeekId !== weekId;

  useEffect(() => {
    getShoppingList(weekId).then((l) => {
      setList(l);
      setLoadedWeekId(weekId);
    });
  }, [weekId]);

  function goToWeek(newWeekId: string) {
    router.push(`/compras?week=${newWeekId}`);
  }

  async function handleToggle(name: string) {
    if (!list) return;
    const updated: ShoppingList = {
      ...list,
      items: list.items.map((i) => (i.name === name ? { ...i, haveIt: !i.haveIt } : i)),
    };
    setList(updated);
    await saveShoppingList(updated);
  }

  async function handleAdd(name: string, quantity: string) {
    const trimmedName = name.trim();
    const trimmedQuantity = quantity.trim();
    if (!trimmedName) return;

    const base: ShoppingList = list ?? { weekId, items: [] };
    const key = trimmedName.toLowerCase();
    const existing = base.items.find((i) => i.name.trim().toLowerCase() === key);

    const items = existing
      ? base.items.map((i) =>
          i === existing
            ? { ...i, quantities: trimmedQuantity ? [...i.quantities, trimmedQuantity] : i.quantities }
            : i
        )
      : [
          ...base.items,
          { name: trimmedName, haveIt: false, fromRecipes: [], quantities: trimmedQuantity ? [trimmedQuantity] : [] },
        ];

    const updated: ShoppingList = { ...base, items: sortShoppingItems(items) };
    setList(updated);
    await saveShoppingList(updated);
  }

  async function handleDeleteItem(name: string) {
    if (!list) return;
    const updated: ShoppingList = { ...list, items: list.items.filter((i) => i.name !== name) };
    setList(updated);
    await saveShoppingList(updated);
  }

  if (loading) {
    return <main className="mx-auto max-w-2xl p-4 sm:p-6">Cargando...</main>;
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-brand-dark">Lista de compras</h1>
      </header>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => goToWeek(addDays(weekId, -7))}
          className="rounded-full border border-brand-light px-2 py-1 text-sm text-brand-dark"
          aria-label="Semana anterior"
        >
          ←
        </button>
        <p className="text-center text-sm text-neutral-500">Semana del {formatWeekRange(weekId)}</p>
        <button
          onClick={() => goToWeek(addDays(weekId, 7))}
          className="rounded-full border border-brand-light px-2 py-1 text-sm text-brand-dark"
          aria-label="Semana siguiente"
        >
          →
        </button>
      </div>

      {!list && (
        <p className="text-sm text-neutral-500">
          Todavía no generaste el menú de esta semana. Podés generarlo desde la pestaña Menú, o
          agregar productos sueltos igual.
        </p>
      )}
      <ShoppingListView
        list={list ?? { weekId, items: [] }}
        onToggle={handleToggle}
        onAdd={handleAdd}
        onDelete={handleDeleteItem}
      />
    </main>
  );
}

export default function ComprasPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl p-4 sm:p-6">Cargando...</main>}>
      <ComprasContent />
    </Suspense>
  );
}
