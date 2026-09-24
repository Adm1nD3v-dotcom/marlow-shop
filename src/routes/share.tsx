import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StoreShell } from "@/components/store-shell";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { stripeLinks, stripePayUrl } from "@/lib/stripe-catalog";

const posts = [
  {
    id: "halo",
    name: "Halo lantern",
    price: "$39",
    caption:
      "Halo patio lantern. USB-C recharge, eight-hour amber. Sit it on the table tonight. $39. Free tracked US shipping.",
  },
  {
    id: "kit",
    name: "Evening kit",
    price: "$62",
    caption:
      "Evening kit: Halo lantern + 10m solar filament. Table and pergola in one order. $62. Free tracked US shipping.",
  },
  {
    id: "filament",
    name: "Filament lights",
    price: "$28",
    caption:
      "Filament — 10m solar string lights. Dusk-to-dawn, no outdoor outlet. $28. Free tracked US shipping.",
  },
  {
    id: "meadow",
    name: "Meadow picnic cloth",
    price: "$24",
    caption:
      "Meadow — waterproof picnic cloth. Bone canvas, folds into itself. $24. Free tracked US shipping.",
  },
  {
    id: "kiln",
    name: "Kiln tumbler",
    price: "$24",
    caption:
      "Kiln — 32oz insulated sip bottle. Unbranded bone steel. $24. Free tracked US shipping.",
  },
  {
    id: "stake",
    name: "Stake path lights",
    price: "$24",
    caption:
      "Stake — six solar pathway lights, warm amber. $24. Free tracked US shipping.",
  },
  {
    id: "wick",
    name: "Wick LED candles",
    price: "$24",
    caption:
      "Wick — three rechargeable LED candles. Indoor dusk, no wax. $24. Free tracked US shipping.",
  },
  {
    id: "globe",
    name: "Globe lantern",
    price: "$34",
    caption:
      "Globe — hanging solar lantern for the hook by the door. $34. Free tracked US shipping.",
  },
  {
    id: "sconce",
    name: "Sconce wall light",
    price: "$29",
    caption:
      "Sconce — solar wall wash for the fence or stoop. $29. Free tracked US shipping.",
  },
  {
    id: "torch",
    name: "Torch",
    price: "$32",
    caption:
      "Torch — solar stake flame for the path edge. $32. Free tracked US shipping.",
  },
];

export const Route = createFileRoute("/share")({
  head: () =>
    pageHead({
      title: "Share Marlow — live pay links",
      description: "Live Stripe links for Halo, the evening kit, Filament, Meadow, and patio pieces. Card checkout. US shipping.",
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
        <h1 className="mt-3 font-display text-4xl tracking-tight">Share these. They take cards.</h1>
        <p className="mt-3 text-muted leading-relaxed">
          These go straight to Stripe. No cart, no preview. Send Halo or the kit. We pack when the
          charge clears.
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
                <a
                  href={url}
                  className="mt-2 block break-all text-sm text-sage underline-offset-4 hover:underline"
                >
                  {url}
                </a>
                <p className="mt-4 text-sm leading-relaxed text-muted">{p.caption}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => copy(`${p.id}-url`, url)}>
                    {copied === `${p.id}-url` ? "Copied link" : "Copy pay link"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => copy(`${p.id}-cap`, `${p.caption}\n${url}`)}
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
