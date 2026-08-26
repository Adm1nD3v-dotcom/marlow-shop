import { createFileRoute, Link } from "@tanstack/react-router";
import { QtyStepper } from "@/components/qty-stepper";
import { StoreShell } from "@/components/store-shell";
import { buttonVariants } from "@/components/ui/button";
import { merchFor } from "@/lib/catalog";
import { money, shippingFor } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cartLines, useRelay } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  head: () =>
    pageHead({
      title: "Bag | Marlow",
      description: "Your Marlow bag.",
      path: "/cart",
      noindex: true,
    }),
  component: CartPage,
});

function CartPage() {
  const cart = useRelay((s) => s.cart);
  const products = useRelay((s) => s.products);
  const setQty = useRelay((s) => s.setQty);
  const addToCart = useRelay((s) => s.addToCart);
  const lines = cartLines(cart, products);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const inBag = new Set(lines.map((l) => l.productId));
  const upsell = lines
    .flatMap((l) => merchFor(l.productId).relatedIds)
    .map((id) => products.find((p) => p.id === id && p.status !== "killed"))
    .filter((p): p is NonNullable<typeof p> => p != null && !inBag.has(p.id))
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 2);

  return (
    <StoreShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="font-display text-4xl tracking-tight">Bag</h1>
        {lines.length === 0 ? (
          <div className="mt-10">
            <p className="text-muted">Nothing in the bag yet.</p>
            <Link to="/shop" className={cn("mt-6", buttonVariants())}>
              Shop the line
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
            <ul className="space-y-4">
              {lines.map((l) => (
                <li key={l.productId} className="flex gap-4 rounded-xl bg-elevated p-4">
                  <img
                    src={l.product.image}
                    alt={l.product.name}
                    className="size-24 rounded-md object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{l.product.name}</p>
                        <p className="mt-1 tabular-nums text-sm text-muted">
                          {money(l.product.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="h-11 shrink-0 text-sm text-muted hover:text-bone"
                        onClick={() => setQty(l.productId, 0)}
                      >
                        Remove
                      </button>
                    </div>
                    <QtyStepper value={l.qty} min={0} onChange={(n) => setQty(l.productId, n)} />
                  </div>
                </li>
              ))}
              {upsell.length > 0 ? (
                <li className="rounded-xl bg-elevated p-4">
                  <p className="text-sm font-medium">With this</p>
                  <ul className="mt-3 space-y-3">
                    {upsell.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm">{p.name}</p>
                          <p className="text-xs text-muted tabular-nums">{money(p.price)}</p>
                        </div>
                        <button
                          type="button"
                          className="h-11 shrink-0 px-3 text-sm text-bone"
                          onClick={() => addToCart(p.id, 1, { openBag: false })}
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null}
            </ul>
            <aside className="h-fit rounded-xl bg-elevated p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="tabular-nums">{money(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted">Shipping</span>
                <span className="tabular-nums">{shipping === 0 ? "Free" : money(shipping)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Total</span>
                <span className="tabular-nums text-lg">{money(total)}</span>
              </div>
              <p className="mt-2 text-xs text-subtle">Free tracked US shipping.</p>
              <Link to="/checkout" className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}>
                Checkout
              </Link>
              <Link
                to="/shop"
                className="mt-2 flex h-11 items-center justify-center text-sm text-muted hover:text-bone"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </StoreShell>
  );
}
