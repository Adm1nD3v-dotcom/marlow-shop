import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { type FormEvent, useState } from "react";
import { StoreShell } from "@/components/store-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cartLines, useRelay } from "@/lib/store";
import { stripePayUrl } from "@/lib/stripe-catalog";

export const Route = createFileRoute("/checkout")({
  head: () =>
    pageHead({
      title: "Checkout | Marlow",
      description: "Pay with card on Stripe.",
      path: "/checkout",
      noindex: true,
    }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useRelay((s) => s.cart);
  const products = useRelay((s) => s.products);
  const checkout = useRelay((s) => s.checkout);
  const lastEmail = useRelay((s) => s.lastEmail);
  const rememberEmail = useRelay((s) => s.rememberEmail);
  const lines = cartLines(cart, products);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const [email, setEmail] = useState(lastEmail);
  const [payingId, setPayingId] = useState<string | null>(null);

  if (lines.length === 0) {
    return (
      <StoreShell>
        <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <h1 className="font-display text-4xl tracking-tight">Checkout</h1>
          <p className="mt-4 text-muted">The bag is empty.</p>
          <Link to="/shop" className="mt-6 flex h-11 items-center text-sm text-muted hover:text-bone">
            Shop the line
          </Link>
        </main>
      </StoreShell>
    );
  }

  function payLine(productId: string, qty: number, name: string) {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    rememberEmail(trimmed);
    const order = checkout(
      { customer: "Guest", email: trimmed, city: "US" },
      { productId },
    );
    const url = stripePayUrl({
      productId,
      qty,
      email: trimmed,
      clientReferenceId: order?.number,
    });
    if (url) {
      setPayingId(productId);
      window.location.assign(url);
      return;
    }
    if (order) navigate({ to: "/order" });
    void name;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const first = lines[0];
    if (!first) return;
    payLine(first.productId, first.qty, first.product.name);
  }

  return (
    <StoreShell>
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-4xl tracking-tight">Checkout</h1>
        <p className="mt-3 text-muted">
          Email, then pay with card on Stripe. Address is collected there.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <label className="block">
            <span className="text-sm text-muted">Email</span>
            <Input
              className="mt-2"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </label>

          <div className="rounded-xl bg-elevated p-5">
            <p className="text-sm font-medium">Order</p>
            <ul className="mt-4 space-y-3">
              {lines.map((l) => (
                <li key={l.productId} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    {l.product.name}
                    {l.qty > 1 ? ` × ${l.qty}` : ""}
                  </span>
                  <span className="tabular-nums">{money(l.product.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="tabular-nums">{money(subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted">Shipping</span>
              <span>Free</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span>Total</span>
              <span className="tabular-nums text-lg">{money(subtotal)}</span>
            </div>
          </div>

          {lines.map((l) => (
            <Button
              key={l.productId}
              type={l === lines[0] ? "submit" : "button"}
              size="lg"
              className="w-full"
              disabled={payingId != null || !email.includes("@")}
              onClick={
                l === lines[0]
                  ? undefined
                  : () => payLine(l.productId, l.qty, l.product.name)
              }
            >
              <Lock className="size-3.5" strokeWidth={1.75} />
              Pay {l.product.name} · {money(l.product.price * l.qty)}
            </Button>
          ))}

          <p className="text-center text-xs text-subtle">
            Stripe hosts the card form. We never see the number.
          </p>
          <p className="flex flex-wrap items-center justify-center gap-2 text-[11px] tracking-wide text-subtle uppercase">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>Discover</span>
            <span>Link</span>
          </p>
        </form>
      </main>
    </StoreShell>
  );
}
