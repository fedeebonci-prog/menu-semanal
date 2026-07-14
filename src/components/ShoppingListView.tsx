"use client";

import { useRef, useState } from "react";
import { ShoppingListItem } from "@/lib/types";

interface Props {
  items: ShoppingListItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: { name: string; quantity: string }) => void;
  onReorder: (newItems: ShoppingListItem[]) => void;
}

export default function ShoppingListView({ items, onToggle, onDelete, onUpdate, onReorder }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftQuantity, setDraftQuantity] = useState("");

  const [workingItems, setWorkingItems] = useState<ShoppingListItem[] | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  const baseItems = workingItems ?? items;
  const orderedItems = [...baseItems.filter((i) => !i.haveIt), ...baseItems.filter((i) => i.haveIt)];

  if (items.length === 0) {
    return <p className="px-1 text-sm text-muted">Todavía no hay nada en la lista.</p>;
  }

  function startEdit(item: ShoppingListItem) {
    setEditingId(item.id);
    setDraftName(item.name);
    setDraftQuantity(item.quantity);
  }

  function commitEdit() {
    if (!editingId) return;
    const trimmedName = draftName.trim();
    if (trimmedName) {
      onUpdate(editingId, { name: trimmedName, quantity: draftQuantity.trim() });
    }
    setEditingId(null);
  }

  function handlePointerDown(e: React.PointerEvent, id: string) {
    e.preventDefault();
    draggingIdRef.current = id;
    setWorkingItems(items);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const draggingId = draggingIdRef.current;
    if (!draggingId || !workingItems) return;

    let targetId: string | null = null;
    for (const [id, el] of rowRefs.current) {
      const rect = el.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        targetId = id;
        break;
      }
    }
    if (!targetId || targetId === draggingId) return;

    const draggingItem = workingItems.find((i) => i.id === draggingId);
    const targetItem = workingItems.find((i) => i.id === targetId);
    if (!draggingItem || !targetItem || draggingItem.haveIt !== targetItem.haveIt) return;

    setWorkingItems((prev) => {
      if (!prev) return prev;
      const without = prev.filter((i) => i.id !== draggingId);
      const targetIdx = without.findIndex((i) => i.id === targetId);
      without.splice(targetIdx, 0, draggingItem);
      return without;
    });
  }

  function handlePointerUp() {
    if (draggingIdRef.current && workingItems) {
      onReorder(workingItems);
    }
    draggingIdRef.current = null;
    setWorkingItems(null);
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-border-app bg-card">
      {orderedItems.map((item, idx) => (
        <div
          key={item.id}
          ref={(el) => {
            if (el) rowRefs.current.set(item.id, el);
            else rowRefs.current.delete(item.id);
          }}
          className="flex items-center gap-2 p-3"
          style={idx > 0 ? { borderTop: "1px solid oklch(0.92 0.015 85)" } : undefined}
        >
          <button
            onPointerDown={(e) => handlePointerDown(e, item.id)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            aria-label={`Reordenar ${item.name}`}
            className="shrink-0 touch-none px-1 text-base text-muted-light"
            style={{ cursor: "grab" }}
          >
            ⠿
          </button>

          <button
            onClick={() => onToggle(item.id)}
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

          {editingId === item.id ? (
            <div
              className="flex min-w-0 flex-1 gap-2"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) commitEdit();
              }}
            >
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="min-w-0 flex-1 rounded-lg border px-2 py-1 text-[14.5px]"
                style={{ borderColor: "var(--border-input)", background: "var(--background)" }}
              />
              <input
                value={draftQuantity}
                onChange={(e) => setDraftQuantity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                placeholder="Cantidad"
                className="w-20 shrink-0 rounded-lg border px-2 py-1 text-[13px]"
                style={{ borderColor: "var(--border-input)", background: "var(--background)" }}
              />
            </div>
          ) : (
            <button
              onClick={() => startEdit(item)}
              className="min-w-0 flex-1 truncate text-left text-[14.5px]"
              style={{
                color: item.haveIt ? "var(--muted-light)" : "var(--foreground)",
                textDecoration: item.haveIt ? "line-through" : "none",
              }}
            >
              {item.name}
              {item.quantity && <span className="text-muted-light"> · {item.quantity}</span>}
            </button>
          )}

          <button
            onClick={() => onDelete(item.id)}
            className="shrink-0 px-1 text-base text-muted-light"
            aria-label={`Eliminar ${item.name}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
