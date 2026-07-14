"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingList, ShoppingListItem } from "@/lib/types";
import { addDays, defaultWeekStart, formatWeekRange } from "@/lib/dateUtils";
import { getShoppingList, saveShoppingList, newId } from "@/lib/store";
import ShoppingListView from "@/components/ShoppingListView";

function ComprasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekId = searchParams.get("week") ?? defaultWeekStart();

  const [list, setList] = useState<ShoppingList | null>(null);
  const [loadedWeekId, setLoadedWeekId] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);
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

  async function persist(items: ShoppingListItem[]) {
    const updated: ShoppingList = { weekId, items };
    setList(updated);
    await saveShoppingList(updated);
  }

  async function handleToggle(id: string) {
    if (!list) return;
    await persist(list.items.map((i) => (i.id === id ? { ...i, haveIt: !i.haveIt } : i)));
  }

  async function handleUpdate(id: string, changes: { name: string; quantity: string }) {
    if (!list) return;
    await persist(list.items.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }

  async function handleDelete(id: string) {
    if (!list) return;
    await persist(list.items.filter((i) => i.id !== id));
  }

  async function handleReorder(newItems: ShoppingListItem[]) {
    await persist(newItems);
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = manualInput.trim();
    if (!trimmedName) return;

    const base = list ?? { weekId, items: [] };
    const newItem: ShoppingListItem = { id: newId(), name: trimmedName, quantity: "", haveIt: false, fromRecipes: [] };
    await persist([...base.items, newItem]);
    setManualInput("");
    addInputRef.current?.focus();
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

        <form onSubmit={handleAddSubmit} className="mt-3.5">
          <input
            ref={addInputRef}
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Agregar producto y apretar Enter…"
            className="w-full rounded-xl border p-3 text-sm"
            style={{ borderColor: "var(--border-input)", background: "var(--card)", color: "var(--foreground)" }}
          />
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
          items={items}
          onToggle={handleToggle}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onReorder={handleReorder}
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
