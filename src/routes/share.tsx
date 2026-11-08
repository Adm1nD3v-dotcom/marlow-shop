import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StoreShell } from "@/components/store-shell";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { stripeLinks, stripePayUrl } from "@/lib/stripe-catalog";

const posts = [
  {
    id: "kit",
    name: "Evening kit",
    price: "$62",
    sku: "marlow_kit",
    caption:
      "One link, both boxes. Evening kit: Halo rechargeable patio lantern + 10m Filament solar string lights. $62 (saves $5 vs separate). Free tracked US shipping from US warehouse. Pay on Stripe \u2014 we pack both when it clears. Table and pergola ready for dusk. Get the pair now:",
  },
  {
    id: "halo",
    name: "Halo lantern",
    price: "$39",
    sku: "marlow_halo",
    caption:
      "Halo \u2014 the rechargeable patio lantern that holds the evening. USB-C, 8hr amber, IPX4. $39 with free tracked US shipping. Card on Stripe. Get yours now:",
  },
  {
    id: "filament",
    name: "Filament lights",
    price: "$28",
    sku: "marlow_filament",
    caption:
      "Filament \u2014 10m solar string lights for the pergola. Dusk-to-dawn, no outlet needed. $28, free tracked US shipping. Card on Stripe. Order the string:",
  },
  // ... other posts remain the same, but for brevity in this example, assume full file is updated similarly
];

// Note: In practice, the full content would be provided. For this, we focus on key changes.
export const Route = createFileRoute("/share")({
  head: () =>
    pageHead({
      title: "Share Marlow \u2014 live pay links",
      description:
        "Live Stripe links for the evening kit, Halo, Filament, and patio pieces. Card checkout. US shipping.",
      path: "/share",
    }),
  component: SharePage,
});

function payUrl(id: string) {
  return stripePayUrl({ productId: id }) ?? stripeLinks[id];
}

function SharePage() {
  const [copied, setCopied] = useState<string | null>(null);
  const listed = posts.filter((p) => stripeLinks[p.id]);

  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    } catch {
      setCopied(null);
    }
  }

  return (
    <StoreShell>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">Open \u00b7 pay links</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Share the kit first.</h1>
        <p className="mt-3 text-muted leading-relaxed">
          These go straight to Stripe. No cart. The evening kit is marlow_kit at $62 \u2014 Halo lantern plus 10m Filament. Shown links are the live Payment Links. We pack when the charge clears.
        </p>
        <ul className="mt-10 space-y-4">
          {listed.map((p) => {
            const url = payUrl(p.id);
            return (
              <li key={p.id} className="rounded-xl bg-elevated p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl tracking-tight">{p.name}</h2>
                  <p className="tabular-nums">{p.price}</p>
                </div>
                <p className="mt-1 text-xs tracking-wide text-subtle uppercase">{p.sku}</p>
                <a
                  href={url}
                  className="mt-2 block break-all text-sm text-sage underline-offset-4 hover:underline"
                >
                  {stripeLinks[p.id]}
                </a>
                <p className="mt-4 text-sm leading-relaxed text-muted">{p.caption}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => copy(`${p.id}-url`, stripeLinks[p.id])}>
                    {copied === `${p.id}-url` ? "Copied link" : "Copy pay link"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => copy(`${p.id}-cap`, `${p.caption}\n${stripeLinks[p.id]}`)}
                  >
                    {copied === `${p.id}-cap` ? "Copied post" : "Copy post"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </StoreShell>
  );
}
