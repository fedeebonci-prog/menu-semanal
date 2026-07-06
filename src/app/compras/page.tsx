"use client";

import { useEffect, useState } from "react";
import { ShoppingList } from "@/lib/types";
import { currentWeekId } from "@/lib/dateUtils";
import { getShoppingList, saveShoppingList } from "@/lib/store";
import ShoppingListView from "@/components/ShoppingListView";

export default function ComprasPage() {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const weekId = currentWeekId();

  useEffect(() => {
    getShoppingList(weekId).then((l) => {
      setList(l);
      setLoading(false);
    });
  }, [weekId]);

  async function handleToggle(name: string) {
    if (!list) return;
    const updated: ShoppingList = {
      ...list,
      items: list.items.map((i) => (i.name === name ? { ...i, haveIt: !i.haveIt } : i)),
    };
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
        <p className="text-sm text-neutral-500">Semana del {weekId}</p>
      </header>

      {!list ? (
        <p className="text-sm text-neutral-500">
          Todavía no generaste el menú de esta semana. Andá a la pestaña Menú para generarlo.
        </p>
      ) : (
        <ShoppingListView list={list} onToggle={handleToggle} />
      )}
    </main>
  );
}
