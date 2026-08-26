import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { StoreShell } from "@/components/store-shell";
import { buttonVariants } from "@/components/ui/button";
import { merchFor } from "@/lib/catalog";
import { money } from "@/lib/format";
import { organizationJsonLd, pageHead, SITE, websiteJsonLd } from "@/lib/seo";
import { useRelay } from "@/lib/store";
import { stripePayUrl } from "@/lib/stripe-catalog";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Marlow — patio lanterns and dusk living",
      description: SITE.description,
      path: "/",
    }),
  component: Home,
});

function Home() {
  const all = useRelay((s) => s.products);
  const products = all.filter((p) => p.status !== "killed");
  const halo = products.find((p) => p.id === "halo") ?? products[0];
  const kit = products.find((p) => p.id === "kit");
  const movers = products
    .filter((p) => merchFor(p.id).trending)
    .sort((a, b) => b.launchedAt - a.launchedAt)
    .slice(0, 6);


  return (
    <StoreShell>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <section className="relative isolate min-h-[88dvh] overflow-hidden">
        {halo ? (
          <img
            src={halo.image}
            alt="Halo rechargeable patio lantern on a table at dusk"
            className="absolute inset-0 size-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="relative mx-auto flex min-h-[88dvh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
          <p className="text-xs tracking-[0.22em] text-bone/80 uppercase">Marlow · open</p>
          <h1 className="mt-4 max-w-xl font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            Light the yard.
            <br />
            Keep the night.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-bone/80 sm:text-lg">
            Rechargeable patio lanterns, solar string lights, and the few things that belong beside
            them. Open now. Card on Stripe.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={cn(buttonVariants({ size: "lg" }))}
              onClick={() => {
                const url = stripePayUrl({ productId: "halo", qty: 1 });
                if (url) window.location.assign(url);
              }}
            >
              Buy Halo {halo ? money(halo.price) : ""}
            </button>
            {kit ? (
              <Link
                to="/product/$slug"
                params={{ slug: kit.slug }}
                className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}
              >
                Evening kit {money(kit.price)}
              </Link>
            ) : (
              <Link to="/shop" className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}>
                The line
              </Link>
            )}
          </div>
        </div>
      </section>

      {kit ? (
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
            <Link
              to="/product/$slug"
              params={{ slug: kit.slug }}
              className="overflow-hidden rounded-xl bg-elevated"
            >
              <img src={kit.image} alt={kit.name} className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]" />
            </Link>
            <div>
              <p className="text-xs tracking-[0.22em] text-sage uppercase">The pair</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">Evening kit · {money(kit.price)}</h2>
              <p className="mt-4 max-w-md text-muted leading-relaxed">{kit.description}</p>
              <p className="mt-3 text-xs text-subtle">
                Typical apart {money(kit.compareAt ?? 6700)}. Not a countdown.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className={cn(buttonVariants({ size: "lg" }))}
                  onClick={() => {
                    const url = stripePayUrl({ productId: "kit", qty: 1 });
                    if (url) window.location.assign(url);
                  }}
                >
                  Buy the kit {money(kit.price)}
                </button>
                <Link
                  to="/product/$slug"
                  params={{ slug: kit.slug }}
                  className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">The evening kit</h2>
          <Link to="/shop" className="flex h-11 items-center text-sm text-muted hover:text-bone">
            All pieces
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              to="/product/$slug"
              params={{ slug: p.slug }}
              className="group overflow-hidden rounded-xl bg-elevated"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-baseline justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="mt-1 text-sm text-muted">{p.tagline}</p>
                </div>
                <p className="tabular-nums text-sm">{money(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {movers.length > 0 ? (
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.22em] text-sage uppercase">Now</p>
                <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
                  This week
                </h2>
                <p className="mt-2 max-w-lg text-sm text-muted">
                  New in the line. Priced under a typical listing. No fake countdowns.
                </p>
              </div>
              <Link to="/shop" className="flex h-11 items-center text-sm text-muted hover:text-bone">
                Shop Now
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {movers.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="group overflow-hidden rounded-xl bg-elevated"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="tabular-nums text-sm">{money(p.price)}</p>
                    </div>
                    {p.compareAt && p.compareAt > p.price ? (
                      <p className="mt-1 text-xs text-subtle">
                        Typical{" "}
                        <span className="line-through tabular-nums">{money(p.compareAt)}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-muted">{p.tagline}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs tracking-[0.22em] text-sage uppercase">Open</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              Pay, then the warehouse.
            </h2>
            <p className="mt-4 max-w-md text-muted leading-relaxed">
              Card on Stripe. We pack when the charge clears. Tracked in 5–9 days from the US
              warehouse. Free shipping on every order.
            </p>
            <Link to="/policies" className={cn("mt-8", buttonVariants({ variant: "ghost" }))}>
              Shipping & returns
            </Link>
          </div>
          <ul className="space-y-4">
            {[
              ["01", "You pay", "Card on Stripe. Address collected there."],
              ["02", "We pack", "Ships from a US warehouse when the charge clears."],
              ["03", "Tracked, 5–9 days", "Free US shipping. 14-day photo-to-reship."],
            ].map(([n, t, d]) => (
              <li key={n} className="flex gap-4 rounded-lg bg-elevated p-4">
                <span className="tabular-nums text-sm text-sage">{n}</span>
                <div>
                  <p className="font-medium">{t}</p>
                  <p className="mt-1 text-sm text-muted">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </StoreShell>
  );
}
