import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { JsonLd } from "@/components/json-ld";
import { StoreShell } from "@/components/store-shell";
import { Badge } from "@/components/ui/badge";
import { collections, merchFor, type ShopFilter } from "@/lib/catalog";
import { money } from "@/lib/format";
import { itemListJsonLd, pageHead } from "@/lib/seo";
import { useRelay } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () =>
    pageHead({
      title: "Shop patio lanterns and evening kit | Marlow",
      description:
        "Patio lanterns, solar string lights, picnic kit, and dusk pieces. Open. Card on Stripe. Free tracked US shipping.",
      path: "/shop",
    }),
  component: Shop,
});

function Shop() {
  const all = useRelay((s) => s.products);
  const live = all.filter((p) => p.status !== "killed");
  const [col, setCol] = useState<ShopFilter>("all");
  const products =
    col === "all"
      ? live
      : col === "now"
        ? live.filter((p) => merchFor(p.id).trending)
        : live.filter((p) => merchFor(p.id).collection === col);

  return (
    <StoreShell>
      <JsonLd data={itemListJsonLd()} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">The line</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Shop Marlow</h1>
        <p className="mt-3 max-w-lg text-muted">
          Patio lanterns, solar string lights, and dusk pieces for the yard and table. Open now.
          Card on Stripe. Free tracked US shipping.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {collections.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCol(c.id)}
              className={cn(
                "h-11 rounded-full px-4 text-sm",
                col === c.id ? "bg-bone text-ink" : "text-muted shadow-[var(--shadow-border)]",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const info = merchFor(p.id);
            return (
              <Link
                key={p.id}
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-xl bg-elevated"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  {info.trending ? (
                    <span className="absolute top-3 left-3">
                      <Badge tone="sage">Now</Badge>
                    </span>
                  ) : null}
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-medium">{p.name}</h2>
                    <p className="tabular-nums text-sm">{money(p.price)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{p.tagline}</p>
                  {p.compareAt && p.compareAt > p.price ? (
                    <p className="mt-2 text-xs text-subtle">
                      Typical{" "}
                      <span className="line-through tabular-nums">{money(p.compareAt)}</span>
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </StoreShell>
  );
}
