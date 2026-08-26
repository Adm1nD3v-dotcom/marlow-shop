import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { JsonLd } from "@/components/json-ld";
import { QtyStepper } from "@/components/qty-stepper";
import { StoreShell } from "@/components/store-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { merchFor } from "@/lib/catalog";
import { money } from "@/lib/format";
import { breadcrumbJsonLd, faqJsonLd, pageHead, productJsonLd, seoForProduct } from "@/lib/seo";
import { useRelay } from "@/lib/store";
import { stripePayUrl } from "@/lib/stripe-catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => pageHead(seoForProduct(params.slug)),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const products = useRelay((s) => s.products);
  const product = products.find((p) => p.slug === slug);
  const addToCart = useRelay((s) => s.addToCart);
  const info = product ? merchFor(product.id) : null;
  const related = products.filter((p) => info?.relatedIds.includes(p.id) && p.status !== "killed");
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <StoreShell>
        <p className="px-6 py-20 text-muted">That piece is no longer in the line.</p>
      </StoreShell>
    );
  }

  function add(openBag: boolean) {
    if (!product) return;
    addToCart(product.id, qty, { openBag });
  }

  function buyNow() {
    if (!product) return;
    const url = stripePayUrl({ productId: product.id, qty });
    if (url) window.location.assign(url);
  }

  const priceBlock = (
    <>
      <p className="tabular-nums text-2xl">
        {money(product.price)}
        {product.compareAt ? (
          <span className="ml-3 text-base text-subtle line-through">
            {money(product.compareAt)}
          </span>
        ) : null}
      </p>
      {product.compareAt ? (
        <p className="mt-1 text-xs text-subtle">
          Typical listing {money(product.compareAt)}. Not a countdown, not a fake MSRP.
        </p>
      ) : null}
    </>
  );

  return (
    <StoreShell>
      <JsonLd data={productJsonLd(slug)} />
      <JsonLd data={faqJsonLd(slug)} />
      <JsonLd data={breadcrumbJsonLd(slug)} />
      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:py-16 lg:pb-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="overflow-hidden rounded-xl bg-elevated">
            <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center lg:py-4">
            <nav className="flex h-11 items-center gap-2 text-sm text-muted">
              <Link to="/shop" className="hover:text-bone">
                Shop
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-bone">{product.name}</span>
            </nav>
            <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{product.name}</h1>
            <p className="mt-3 text-lg text-muted">{product.tagline}</p>
            <div className="mt-6">{priceBlock}</div>
            <p className="mt-6 max-w-md leading-relaxed text-muted">{product.description}</p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              {(info?.benefits.length ? info.benefits : product.details).map((d) => (
                <li key={d}>— {d}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-sage">In stock · ships 5–9 days</p>
            <div className="mt-6 hidden lg:flex lg:flex-wrap lg:items-center lg:gap-3">
              <QtyStepper value={qty} onChange={setQty} />
              <Button size="lg" onClick={() => add(true)}>
                Add to bag
              </Button>
              <button
                type="button"
                className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}
                onClick={buyNow}
              >
                Buy now
              </button>
            </div>
            <p className="mt-4 text-xs text-subtle">
              Pay with card on Stripe. Free tracked US shipping. 14-day photo-to-reship.
            </p>
          </div>
        </div>

        {info && info.faq.length > 0 ? (
          <section className="mt-16 max-w-2xl">
            <h2 className="font-display text-2xl tracking-tight">Questions</h2>
            <dl className="mt-6 space-y-6">
              {info.faq.map((f) => (
                <div key={f.q}>
                  <dt className="font-medium">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {info && info.notes.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-display text-2xl tracking-tight">From delivered orders</h2>
            <p className="mt-2 text-sm text-subtle">Real notes. Not purchased stars.</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {info.notes.map((n) => (
                <li key={n.name} className="rounded-xl bg-elevated p-5">
                  <p className="text-sm leading-relaxed">{n.quote}</p>
                  <p className="mt-3 text-xs text-subtle">
                    {n.name} · {n.city}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-display text-2xl tracking-tight">With this</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="flex gap-4 overflow-hidden rounded-xl bg-elevated p-3"
                >
                  <img src={p.image} alt={p.name} className="size-24 rounded-md object-cover" />
                  <div className="flex flex-col justify-center">
                    <p className="font-medium">{p.name}</p>
                    <p className="mt-1 text-sm text-muted tabular-nums">{money(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-ink/95 p-3 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <QtyStepper value={qty} onChange={setQty} />
          <Button size="lg" className="flex-1" onClick={buyNow}>
            Buy now · {money(product.price)}
          </Button>
        </div>
      </div>
    </StoreShell>
  );
}
