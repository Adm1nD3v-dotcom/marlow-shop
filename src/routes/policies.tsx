import { createFileRoute } from "@tanstack/react-router";
import { StoreShell } from "@/components/store-shell";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/policies")({
  head: () =>
    pageHead({
      title: "Shipping, returns, privacy | Marlow",
      description:
        "Free tracked US shipping. 14-day photo-to-reship. Checkout on Stripe. Marlow, Danville, Kentucky.",
      path: "/policies",
    }),
  component: PoliciesPage,
});

function PoliciesPage() {
  return (
    <StoreShell>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">The rules</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Shipping, returns, privacy</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Written so you can follow them without guessing. No fake stock counts. No purchased
          reviews.
        </p>

        <section className="mt-10">
          <h2 className="font-display text-2xl">Shipping</h2>
          <p className="mt-3 text-muted leading-relaxed">
            We do not hold inventory. Pay with card on Stripe. The warehouse packs when the
            charge clears. Most of the line leaves a US warehouse and arrives in 5–9 days,
            tracked. A few travel pieces take 9–16 days. Free tracked US shipping on every
            order. Duties, if any, are stated at checkout — we do not hide them in the product
            title.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="font-display text-2xl">Returns</h2>
          <p className="mt-3 text-muted leading-relaxed">
            14 days from delivery. Photo of the issue. We reship or refund. Cosmetic-only defects
            can take a partial with your consent — never as a default. Chargebacks are a last
            resort; write us first. Address: Marlow, Danville, Kentucky.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="font-display text-2xl">Privacy</h2>
          <p className="mt-3 text-muted leading-relaxed">
            Checkout is hosted by Stripe. We receive name, email, and shipping address from the
            payment so we can send the order. We do not sell the list. You can ask to be
            forgotten; we keep the Stripe record for tax.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="font-display text-2xl">Ads & endorsements</h2>
          <p className="mt-3 text-muted leading-relaxed">
            Paid creative is marked paid. We do not buy comments, stars, or followers. Halo is a
            lantern, not a pesticide. Vesper is patio oil, not a drug. Health and kill-claims are
            out of the catalog.
          </p>
        </section>
      </main>
    </StoreShell>
  );
}
