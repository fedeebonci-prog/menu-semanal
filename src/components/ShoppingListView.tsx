"use client";

import { useState } from "react";
import { ShoppingList } from "@/lib/types";

interface Props {
  list: ShoppingList;
  onToggle: (name: string) => void;
  onAdd: (name: string, quantity: string) => void;
  onDelete: (name: string) => void;
}

export default function ShoppingListView({ list, onToggle, onAdd, onDelete }: Props) {
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const pending = list.items.filter((i) => !i.haveIt);
  const have = list.items.filter((i) => i.haveIt);

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName, newQuantity);
    setNewName("");
    setNewQuantity("");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddSubmit} className="flex gap-2 rounded-lg border border-brand-light bg-white p-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Agregar producto (ej: Servilletas)"
          className="flex-1 rounded-md border border-neutral-200 p-2 text-sm"
        />
        <input
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          placeholder="Cantidad"
          className="w-24 rounded-md border border-neutral-200 p-2 text-sm"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          + agregar
        </button>
      </form>

      <section>
        <h2 className="mb-2 text-sm font-medium text-brand-dark">
          Falta comprar ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-neutral-400">Ya tenés todo lo de esta semana.</p>
        ) : (
          <ul className="divide-y divide-brand-light rounded-lg border border-brand-light bg-white">
            {pending.map((item) => (
              <li key={item.name} className="flex items-center gap-3 p-3">
                <input
                  type="checkbox"
                  checked={item.haveIt}
                  onChange={() => onToggle(item.name)}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.name}</p>
                  {item.quantities.length > 0 && (
                    <p className="text-xs text-neutral-400">{item.quantities.join(" + ")}</p>
                  )}
                </div>
                <button
                  onClick={() => onDelete(item.name)}
                  className="px-1 text-sm text-neutral-400 hover:text-red-500"
                  aria-label={`Eliminar ${item.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {have.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-neutral-400">
            Ya tenemos ({have.length})
          </h2>
          <ul className="divide-y divide-brand-light rounded-lg border border-brand-light bg-white opacity-60">
            {have.map((item) => (
              <li key={item.name} className="flex items-center gap-3 p-3">
                <input
                  type="checkbox"
                  checked={item.haveIt}
                  onChange={() => onToggle(item.name)}
                  className="h-4 w-4"
                />
                <p className="flex-1 text-sm text-neutral-500 line-through">{item.name}</p>
                <button
                  onClick={() => onDelete(item.name)}
                  className="px-1 text-sm text-neutral-400 hover:text-red-500"
                  aria-label={`Eliminar ${item.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
