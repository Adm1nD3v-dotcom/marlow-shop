import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useMemo, useState } from "react";
import { StoreShell } from "@/components/store-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { useRelay } from "@/lib/store";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/order")({
  head: () =>
    pageHead({
      title: "Order lookup | Marlow",
      description: "Look up a Marlow order.",
      path: "/order",
      noindex: true,
    }),
  component: OrderLookup,
});

function OrderLookup() {
  const myOrders = useRelay((s) => s.myOrders);
  const lastEmail = useRelay((s) => s.lastEmail);
  const [email, setEmail] = useState(lastEmail);
  const [number, setNumber] = useState("");
  const [found, setFound] = useState<Order | null | undefined>(undefined);

  const recent = useMemo(() => myOrders.slice(0, 5), [myOrders]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const n = number.trim().replace(/^#/, "").toLowerCase();
    const em = email.trim().toLowerCase();
    const match = myOrders.find((o) => {
      const num = o.number.replace(/^#/, "").toLowerCase();
      const mail = o.email.toLowerCase();
      return (num === n || o.number.toLowerCase() === `#${n}`) && mail === em;
    });
    setFound(match ?? null);
  }

  return (
    <StoreShell>
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-4xl tracking-tight">Order lookup</h1>
        <p className="mt-3 text-muted">
          Email and order number. Paid orders also arrive as a Stripe receipt.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm text-muted">Email</span>
            <Input
              className="mt-2"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Order number</span>
            <Input
              className="mt-2"
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="#M10421"
            />
          </label>
          <Button type="submit" size="lg" className="w-full">
            Look up
          </Button>
        </form>

        {found === null ? (
          <p className="mt-8 text-sm text-muted">No order on this device with that email and number.</p>
        ) : null}

        {found ? (
          <div className="mt-8 rounded-xl bg-elevated p-5">
            <p className="font-medium">{found.number}</p>
            <p className="mt-1 text-sm text-muted">{found.email}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {found.items.map((item) => (
                <li key={item.productId} className="flex justify-between gap-3">
                  <span>
                    {item.name}
                    {item.qty > 1 ? ` × ${item.qty}` : ""}
                  </span>
                  <span className="tabular-nums">{money(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-subtle">
              Status: {found.status}. Tracking, if any, is on the Stripe receipt.
            </p>
          </div>
        ) : null}

        {recent.length > 0 ? (
          <div className="mt-12">
            <p className="text-sm font-medium">On this device</p>
            <ul className="mt-3 space-y-2">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between text-sm">
                  <span>{o.number}</span>
                  <span className="text-muted">{o.status}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Link to="/shop" className={cn(buttonVariants({ variant: "ghost" }), "mt-10")}>
          Shop the line
        </Link>
      </main>
    </StoreShell>
  );
}
