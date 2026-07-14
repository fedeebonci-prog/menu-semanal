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
  const [manualInput, setManualInput] = useState("");
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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = manualInput.trim();
    if (!trimmedName) return;

    const base: ShoppingList = list ?? { weekId, items: [] };
    const key = trimmedName.toLowerCase();
    const existing = base.items.find((i) => i.name.trim().toLowerCase() === key);
    const items = existing ? base.items : [...base.items, { name: trimmedName, haveIt: false, fromRecipes: [], quantities: [] }];

    const updated: ShoppingList = { ...base, items: sortShoppingItems(items) };
    setList(updated);
    setManualInput("");
    await saveShoppingList(updated);
  }

  async function handleDeleteItem(name: string) {
    if (!list) return;
    const updated: ShoppingList = { ...list, items: list.items.filter((i) => i.name !== name) };
    setList(updated);
    await saveShoppingList(updated);
  }

  if (loading) {
    return <main className="flex flex-1 items-center justify-center text-sm text-muted">Cargando…</main>;
  }

  const items = list?.items ?? [];
  const checkedCount = items.filter((i) => i.haveIt).length;
  const progress = items.length > 0 ? `${checkedCount} de ${items.length} tildados` : "Generá el menú para armar la lista";

  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-border-app px-5 pb-[18px] pt-7">
        <h1 className="font-serif text-[26px] font-semibold tracking-tight text-foreground-brand">
          Lista de compras
        </h1>
        <p className="mt-1 text-sm text-muted">{progress}</p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => goToWeek(addDays(weekId, -7))}
            className="rounded-full border border-border-app px-2 py-0.5 text-sm text-muted"
            aria-label="Semana anterior"
          >
            ←
          </button>
          <span className="text-sm text-muted">Semana del {formatWeekRange(weekId)}</span>
          <button
            onClick={() => goToWeek(addDays(weekId, 7))}
            className="rounded-full border border-border-app px-2 py-0.5 text-sm text-muted"
            aria-label="Semana siguiente"
          >
            →
          </button>
        </div>

        <form onSubmit={handleAdd} className="mt-3.5 flex gap-2">
          <input
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Agregar producto suelto…"
            className="flex-1 rounded-xl border p-3 text-sm"
            style={{ borderColor: "var(--border-input)", background: "var(--card)", color: "var(--foreground)" }}
          />
          <button
            type="submit"
            disabled={!manualInput.trim()}
            className="rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50"
            style={{ background: "var(--brand)", color: "var(--card)" }}
          >
            Agregar
          </button>
        </form>
      </header>

      {!list && (
        <p className="px-5 pt-4 text-sm text-muted">
          Todavía no generaste el menú de esta semana. Podés generarlo desde la pestaña Menú, o
          agregar productos sueltos igual.
        </p>
      )}

      <div className="flex-1 px-3.5 pb-24 pt-3.5">
        <ShoppingListView
          list={list ?? { weekId, items: [] }}
          onToggle={handleToggle}
          onDelete={handleDeleteItem}
        />
      </div>
    </main>
  );
}

export default function ComprasPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center text-sm text-muted">Cargando…</main>}>
      <ComprasContent />
    </Suspense>
  );
}
