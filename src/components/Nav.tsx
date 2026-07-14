"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Menú", icon: "menu" as const },
  { href: "/recetas", label: "Recetas", icon: "recetas" as const },
  { href: "/categorias", label: "Categorías", icon: "categorias" as const },
  { href: "/compras", label: "Compras", icon: "compras" as const },
];

function TabIcon({ icon, active }: { icon: (typeof LINKS)[number]["icon"]; active: boolean }) {
  const stroke = active ? "var(--brand)" : "var(--muted-light)";

  if (icon === "menu") {
    return (
      <span className="relative block h-5 w-5 -rotate-2">
        <span
          className="absolute inset-0 rounded-[46%_54%_52%_48%/50%]"
          style={{ border: `1.6px solid ${stroke}` }}
        />
        <span
          className="absolute inset-1.5 rounded-[48%_52%_50%_50%/50%]"
          style={{ border: `1.4px solid ${stroke}` }}
        />
      </span>
    );
  }

  if (icon === "recetas") {
    return (
      <span className="relative block h-[19px] w-[18px] -rotate-1">
        <span
          className="absolute left-0 top-0 h-[19px] w-[18px] rounded-[2px_5px_5px_2px/2px_4px_4px_2px]"
          style={{ border: `1.6px solid ${stroke}` }}
        />
        <span
          className="absolute right-[3px] top-[-1px] h-[9px] w-[6px]"
          style={{
            background: stroke,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)",
          }}
        />
      </span>
    );
  }

  if (icon === "categorias") {
    return (
      <span className="grid h-[19px] w-[19px] -rotate-1 grid-cols-2 gap-[3px]">
        <span className="rounded-[3px_6px_3px_6px]" style={{ border: `1.6px solid ${stroke}` }} />
        <span className="rounded-[6px_3px_6px_3px]" style={{ border: `1.6px solid ${stroke}` }} />
        <span className="rounded-[6px_3px_6px_3px]" style={{ border: `1.6px solid ${stroke}` }} />
        <span className="rounded-[3px_6px_3px_6px]" style={{ border: `1.6px solid ${stroke}` }} />
      </span>
    );
  }

  return (
    <span className="relative block h-[19px] w-[18px] -rotate-1">
      <span
        className="absolute left-[3px] top-0 h-[7px] w-3 rounded-t-[12px]"
        style={{ border: `1.6px solid ${stroke}`, borderBottom: "none" }}
      />
      <span
        className="absolute left-0 top-[5px] h-[14px] w-[18px] rounded-[2px_4px_5px_3px/2px_3px_4px_3px]"
        style={{ border: `1.6px solid ${stroke}` }}
      />
    </span>
  );
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 flex border-t border-border-app bg-card px-1.5 py-2 [padding-bottom:calc(0.5rem+env(safe-area-inset-bottom))]">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-1 flex-col items-center gap-1 py-1.5"
            style={{ opacity: active ? 1 : 0.6 }}
          >
            <TabIcon icon={link.icon} active={active} />
            <span
              className="text-[11px] font-semibold"
              style={{ color: active ? "var(--brand)" : "var(--muted-light)" }}
            >
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
