import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect } from "react";
import { QtyStepper } from "@/components/qty-stepper";
import { buttonVariants } from "@/components/ui/button";
import { merchFor } from "@/lib/catalog";
import { money, shippingFor } from "@/lib/format";
import { cartLines, useRelay } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const open = useRelay((s) => s.bagOpen);
  const close = useRelay((s) => s.closeBag);
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close bag"
        className="absolute inset-0 bg-ink/70"
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Bag"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ink shadow-[var(--shadow-border)]"
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-4 sm:h-16">
          <p className="font-display text-xl">Bag</p>
          <button
            type="button"
            aria-label="Close"
            className="flex size-11 items-center justify-center text-muted hover:text-bone"
            onClick={close}
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center px-6">
            <p className="text-muted">Nothing in the bag yet.</p>
            <Link
              to="/shop"
              onClick={close}
              className={cn("mt-6", buttonVariants())}
            >
              Shop the line
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {lines.map((l) => (
                <li key={l.productId} className="flex gap-3">
                  <img
                    src={l.product.image}
                    alt=""
                    className="size-20 rounded-md object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{l.product.name}</p>
                        <p className="mt-0.5 tabular-nums text-sm text-muted">
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
                    <QtyStepper
                      value={l.qty}
                      min={0}
                      onChange={(n) => setQty(l.productId, n)}
                    />
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
                          onClick={() => addToCart(p.id, 1, { openBag: true })}
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null}
            </ul>
            <div className="border-t border-line px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="tabular-nums">{money(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted">Shipping</span>
                <span className="tabular-nums">
                  {shipping === 0 ? "Free" : money(shipping)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Total</span>
                <span className="tabular-nums text-lg">{money(total)}</span>
              </div>
              <p className="mt-2 text-xs text-subtle">Free tracked US shipping.</p>
              <Link
                to="/checkout"
                onClick={close}
                className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
              >
                Checkout
              </Link>
              <Link
                to="/cart"
                onClick={close}
                className="mt-2 flex h-11 items-center justify-center text-sm text-muted hover:text-bone"
              >
                View bag
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
