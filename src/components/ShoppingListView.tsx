"use client";

import { ShoppingList } from "@/lib/types";
import { groupShoppingItems } from "@/lib/shoppingList";

interface Props {
  list: ShoppingList;
  onToggle: (name: string) => void;
  onDelete: (name: string) => void;
}

export default function ShoppingListView({ list, onToggle, onDelete }: Props) {
  const groups = groupShoppingItems(list.items);

  if (groups.length === 0) {
    return <p className="px-1 text-sm text-muted">Todavía no hay nada en la lista.</p>;
  }

  return (
    <div className="flex flex-col gap-4.5">
      {groups.map((group) => (
        <div key={group.name}>
          <div
            className="mb-2 text-xs font-bold uppercase tracking-wide"
            style={{ color: "var(--foreground-brand)" }}
          >
            {group.name}
          </div>
          <div className="overflow-hidden rounded-[14px] border border-border-app bg-card">
            {group.items.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center gap-2.5 p-3"
                style={idx > 0 ? { borderTop: "1px solid oklch(0.92 0.015 85)" } : undefined}
              >
                <button
                  onClick={() => onToggle(item.name)}
                  aria-label={`Marcar ${item.name}`}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] text-[13px]"
                  style={{
                    border: `1.6px solid ${item.haveIt ? "var(--brand)" : "var(--border-input)"}`,
                    background: item.haveIt ? "var(--brand)" : "transparent",
                    color: "var(--card)",
                  }}
                >
                  {item.haveIt ? "✓" : ""}
                </button>
                <div
                  className="min-w-0 flex-1 truncate text-[14.5px]"
                  style={{
                    color: item.haveIt ? "var(--muted-light)" : "var(--foreground)",
                    textDecoration: item.haveIt ? "line-through" : "none",
                  }}
                >
                  {item.name}
                </div>
                {item.quantities.length > 0 && (
                  <div className="shrink-0 whitespace-nowrap text-[13px] text-muted-light">
                    {item.quantities.join(" + ")}
                  </div>
                )}
                <button
                  onClick={() => onDelete(item.name)}
                  className="shrink-0 px-1 text-base text-muted-light"
                  aria-label={`Eliminar ${item.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
