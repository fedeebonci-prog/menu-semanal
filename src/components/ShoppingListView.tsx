"use client";

import { ShoppingList } from "@/lib/types";

interface Props {
  list: ShoppingList;
  onToggle: (name: string) => void;
}

export default function ShoppingListView({ list, onToggle }: Props) {
  const pending = list.items.filter((i) => !i.haveIt);
  const have = list.items.filter((i) => i.haveIt);

  return (
    <div className="space-y-4">
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
                <div>
                  <p className="text-sm text-foreground">{item.name}</p>
                  {item.quantities.length > 0 && (
                    <p className="text-xs text-neutral-400">{item.quantities.join(" + ")}</p>
                  )}
                </div>
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
                <p className="text-sm text-neutral-500 line-through">{item.name}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
