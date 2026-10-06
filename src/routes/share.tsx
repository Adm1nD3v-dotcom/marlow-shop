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
      "Evening kit — Halo lantern + 10m Filament solar lights. $62 for the pair, $5 under buying them apart. Free tracked US shipping. Card on Stripe. If this clears, pack 1 Halo rechargeable lantern and 1 Filament 10m solar string to the Stripe address.",
  },
  {
    id: "halo",
    name: "Halo lantern",
    price: "$39",
    sku: "marlow_halo",
    caption:
      "Halo — rechargeable patio lantern for the table. USB-C, eight-hour amber, IPX4. $39. Free tracked US shipping. Card on Stripe.",
  },
  {
    id: "filament",
    name: "Filament lights",
    price: "$28",
    sku: "marlow_filament",
    caption:
      "Filament — 10m solar string lights. Dusk-to-dawn, no outdoor outlet. $28. Free tracked US shipping.",
  },
  {
    id: "drift",
    name: "Drift dry bag",
    price: "$24",
    sku: "marlow_drift",
    caption:
      "Drift — 10L roll-top dry bag in matte sage. Keep the night kit dry. $24. Free tracked US shipping. Card on Stripe.",
  },
  {
    id: "shore",
    name: "Shore picnic tote",
    price: "$42",
    sku: "marlow_shore",
    caption:
      "Shore — insulated picnic tote. Two people, one evening. $42. Free tracked US shipping. Card on Stripe.",
  },
  {
    id: "vesper",
    name: "Vesper patio oil",
    price: "$16",
    sku: "marlow_vesper",
    caption:
      "Vesper — amber glass patio oil, two-pack. A quieter table. $16. Free tracked US shipping. Card on Stripe.",
  },
  {
    id: "kiln",
    name: "Kiln tumbler",
    price: "$24",
    sku: "marlow_kiln",
    caption:
      "Kiln — 32oz insulated sip bottle. Unbranded bone steel. $24. Free tracked US shipping.",
  },
  {
    id: "pulse",
    name: "Pulse blender bottle",
    price: "$28",
    sku: "marlow_pulse",
    caption:
      "Pulse — USB-C personal blender, 22oz cup. Breakfast in twenty seconds. $28. Free tracked US shipping. Card on Stripe.",
  },
  {
    id: "meadow",
    name: "Meadow picnic cloth",
    price: "$24",
    sku: "marlow_meadow",
    caption:
      "Meadow — waterproof picnic cloth. Bone canvas, folds into itself. $24. Free tracked US shipping.",
  },
  {
    id: "ember",
    name: "Ember flame lamp",
    price: "$34",
    sku: "marlow_ember",
    caption:
      "Ember — LED flame in smoked glass. No heat, no oil. The indoor dusk. $34. Free tracked US shipping. Card on Stripe.",
  },
  {
    id: "field",
    name: "Field grooming glove",
    price: "$14",
    sku: "marlow_field",
    caption:
      "Field — sage silicone grooming glove, right-hand. $14. Free tracked US shipping. Card on Stripe.",
  },
  {
    id: "stake",
    name: "Stake path lights",
    price: "$24",
    sku: "marlow_stake",
    caption:
      "Stake — six solar pathway lights, warm amber. $24. Free tracked US shipping.",
  },
  {
    id: "wick",
    name: "Wick LED candles",
    price: "$24",
    sku: "marlow_wick",
    caption:
      "Wick — three rechargeable LED candles. Indoor dusk, no wax. $24. Free tracked US shipping.",
  },
  {
    id: "globe",
    name: "Globe solar lights",
    price: "$22",
    sku: "marlow_globe",
    caption:
      "Globe — two cracked-glass solar globes for the table. $22. Free tracked US shipping.",
  },
  {
    id: "sconce",
    name: "Sconce wall lights",
    price: "$28",
    sku: "marlow_sconce",
    caption:
      "Sconce — two solar wall lights for the fence or stoop. $28. Free tracked US shipping.",
  },
  {
    id: "torch",
    name: "Torch solar stakes",
    price: "$32",
    sku: "marlow_torch",
    caption:
      "Torch — four solar flicker stakes for the path edge. No open fire. $32. Free tracked US shipping.",
  },
];

export const Route = createFileRoute("/share")({
  head: () =>
    pageHead({
      title: "Share Marlow — live pay links",
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
        <h1 className="mt-3 font-display text-4xl tracking-tight">Share the kit first.</h1>
        <p className="mt-3 text-muted leading-relaxed">
          These go straight to Stripe. No cart. The evening kit is marlow_kit at $62 — Halo lantern plus 10m Filament. Shown links are the live Payment Links. We pack when the charge clears.
        </p>
        <ul className="mt-10 space-y-4">
          {posts.map((p) => {
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
