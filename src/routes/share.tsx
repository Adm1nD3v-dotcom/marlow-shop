import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StoreShell } from "@/components/store-shell";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { stripeLinks } from "@/lib/stripe-catalog";

const posts = [
  {
    id: "halo",
    name: "Halo lantern",
    price: "$39",
    url: stripeLinks.halo,
    caption:
      "Halo — rechargeable patio lantern for the table. USB-C, eight-hour burn, amber field. $39. Free tracked US shipping.",
  },
  {
    id: "kit",
    name: "Evening kit",
    price: "$62",
    url: stripeLinks.kit,
    caption:
      "The evening kit: Halo lantern + 10m solar filament lights. $62 for the pair. Table and pergola. Free tracked US shipping.",
  },
  {
    id: "filament",
    name: "Filament lights",
    price: "$28",
    url: stripeLinks.filament,
    caption:
      "Filament — 10m solar string lights, dusk-to-dawn, no outdoor outlet. $28. Free tracked US shipping.",
  },
  {
    id: "kiln",
    name: "Kiln tumbler",
    price: "$24",
    url: stripeLinks.kiln,
    caption:
      "Kiln — 32oz insulated sip bottle. Unbranded bone steel. $24. Free tracked US shipping.",
  },
  {
    id: "stake",
    name: "Stake path lights",
    price: "$24",
    url: stripeLinks.stake,
    caption:
      "Stake — six solar pathway lights, warm amber. $24. Free tracked US shipping.",
  },
  {
    id: "wick",
    name: "Wick LED candles",
    price: "$24",
    url: stripeLinks.wick,
    caption:
      "Wick — three rechargeable LED candles. Indoor dusk, no wax. $24. Free tracked US shipping.",
  },
];

export const Route = createFileRoute("/share")({
  head: () =>
    pageHead({
      title: "Share Marlow — live pay links",
      description: "Live Stripe links for Halo, the evening kit, Filament, and Kiln. Card checkout. US shipping.",
      path: "/share",
    }),
  component: SharePage,
});

function SharePage() {
  const [copied, setCopied] = useState<string | null>(null);

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
        <p className="text-xs tracking-[0.22em] text-sage uppercase">Open · pay links</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Share these. They take cards.</h1>
        <p className="mt-3 text-muted leading-relaxed">
          These go straight to Stripe. No cart, no preview. Send Halo or the kit. We pack when the
          charge clears.
        </p>
        <ul className="mt-10 space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="rounded-xl bg-elevated p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl tracking-tight">{p.name}</h2>
                <p className="tabular-nums">{p.price}</p>
              </div>
              <a
                href={p.url}
                className="mt-2 block break-all text-sm text-sage underline-offset-4 hover:underline"
              >
                {p.url}
              </a>
              <p className="mt-4 text-sm leading-relaxed text-muted">{p.caption}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={() => copy(`${p.id}-url`, p.url)}>
                  {copied === `${p.id}-url` ? "Copied link" : "Copy pay link"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => copy(`${p.id}-cap`, `${p.caption}\n${p.url}`)}
                >
                  {copied === `${p.id}-cap` ? "Copied post" : "Copy post"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </StoreShell>
  );
}
