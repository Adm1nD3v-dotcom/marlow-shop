import { extraMerch } from "./line";

export type Collection = "patio" | "table" | "travel";
export type ShopFilter = Collection | "all" | "now";

export type Merch = {
  collection: Collection;
  trending?: boolean;
  benefits: string[];
  faq: { q: string; a: string }[];
  relatedIds: string[];
  notes: { name: string; city: string; quote: string }[];
};

export const collections: { id: ShopFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "now", label: "Now" },
  { id: "patio", label: "Patio" },
  { id: "table", label: "Table" },
  { id: "travel", label: "Travel" },
];

const payFaq = {
  q: "How do I pay?",
  a: "Card on Stripe — Visa, Mastercard, American Express, and more. We pack when the charge clears.",
};

const shipFaq = {
  q: "How long does it take?",
  a: "Pieces from our US warehouse usually arrive in 5–9 days, tracked. A few travel pieces take 9–16 days. We pack when the card clears. Free tracked US shipping on every order.",
};

const returnFaq = {
  q: "What if it arrives wrong?",
  a: "Send a photo within 14 days of delivery. We reship or refund. We do not ask you to keep a defective piece as a partial.",
};

const priceFaq = {
  q: "Why is the other price crossed out?",
  a: "The strikethrough is a typical listing for this class of piece — not a countdown and not a made-up MSRP.",
};

export const merch: Record<string, Merch> = {
  halo: {
    collection: "patio",
    benefits: [
      "Amber field meant for a table, not a party strobe",
      "USB-C, eight-hour burn, IPX4 sealed",
      "Ships from a US warehouse when you order",
      "Pairs with Filament lights and Vesper oil",
    ],
    faq: [
      {
        q: "Is this a bug zapper?",
        a: "No. Halo is a patio lantern with a low amber field. We do not sell pesticides or make kill-claims.",
      },
      payFaq,
      shipFaq,
      returnFaq,
    ],
    relatedIds: ["kit", "ember", "filament", "vesper"],
    notes: [
      { name: "Milo", city: "Nashville", quote: "On the table, not the rail. It reads like a fire without the smoke." },
      { name: "Rowan", city: "Portland", quote: "Charged over lunch. Lasted the whole dusk." },
    ],
  },
  filament: {
    collection: "patio",
    benefits: ["Ten metres, solar, dusk-to-dawn", "No outdoor outlet", "The natural second piece next to Halo"],
    faq: [
      {
        q: "Will it run in shade?",
        a: "It wants a few hours of sky. A covered porch with a sliver of sun is enough; a north well is not.",
      },
      payFaq,
      shipFaq,
      returnFaq,
    ],
    relatedIds: ["kit", "halo", "ember"],
    notes: [{ name: "Eden", city: "Denver", quote: "The pergola finally looks finished." }],
  },
  kit: {
    collection: "patio",
    trending: true,
    benefits: [
      "Halo on the table, Filament on the pergola",
      "$62 for the pair — $5 under buying them apart",
      "Two boxes, US warehouse, tracked",
    ],
    faq: [
      {
        q: "Is this one box?",
        a: "No. Two pieces, two boxes, same order. Halo and Filament ship from the US warehouse when the card clears.",
      },
      priceFaq,
      payFaq,
      shipFaq,
      returnFaq,
    ],
    relatedIds: ["vesper", "ember"],
    notes: [],
  },
  drift: {
    collection: "travel",
    benefits: ["10L roll-top", "180g — light in the kit", "Welded seams"],
    faq: [payFaq, shipFaq, returnFaq],
    relatedIds: ["meadow", "kiln"],
    notes: [{ name: "Sasha", city: "Austin", quote: "Lake bag. Stayed dry." }],
  },
  shore: {
    collection: "table",
    benefits: ["Insulated for two", "Collapses flat", "The bag that sits next to the lantern"],
    faq: [shipFaq, returnFaq, priceFaq],
    relatedIds: ["meadow", "halo"],
    notes: [
      { name: "Jules", city: "Brooklyn", quote: "Two people, one evening. That is the whole pitch and it is true." },
    ],
  },
  vesper: {
    collection: "patio",
    benefits: ["Two-pack amber glass", "The consumable — the thing that returns", "Sits on the Halo tray"],
    faq: [
      {
        q: "Is this a pesticide?",
        a: "No. Patio oil for scent and atmosphere. No kill-claims, no unsourced medical copy.",
      },
      payFaq,
      shipFaq,
      returnFaq,
    ],
    relatedIds: ["halo", "ember"],
    notes: [{ name: "Noor", city: "Chicago", quote: "Reorder. That is the whole review." }],
  },
  kiln: {
    collection: "travel",
    trending: true,
    benefits: [
      "32oz insulated, sip lid",
      "Bone steel, sage lid — no logo to defend",
      "Priced under a typical listing for this class",
    ],
    faq: [
      {
        q: "Is this a branded tumbler?",
        a: "No. Kiln is our 32oz bottle — unbranded, insulated, sip lid. We do not sell anyone else’s name.",
      },
      priceFaq,
      payFaq,
      shipFaq,
      returnFaq,
    ],
    relatedIds: ["pulse", "drift"],
    notes: [{ name: "Ira", city: "Seattle", quote: "Holds the evening walk. No logo to defend." }],
  },
  pulse: {
    collection: "table",
    trending: true,
    benefits: [
      "USB-C personal blender, 22oz cup",
      "Twenty seconds on the counter",
      "Priced under a typical listing for this class",
    ],
    faq: [
      {
        q: "Is this a branded blender?",
        a: "No. Pulse is an unbranded bottle blender. We do not list trademarked names.",
      },
      priceFaq,
      payFaq,
      shipFaq,
      returnFaq,
    ],
    relatedIds: ["kiln", "shore"],
    notes: [{ name: "Kai", city: "Asheville", quote: "Twenty seconds. The lemon survived." }],
  },
  meadow: {
    collection: "patio",
    trending: true,
    benefits: ["Waterproof picnic cloth, folds into itself", "Bone canvas, sage stitch", "Pairs with Shore tote and Halo"],
    faq: [priceFaq, shipFaq, returnFaq],
    relatedIds: ["shore", "halo"],
    notes: [{ name: "Pia", city: "Minneapolis", quote: "Grass side down. The bone side is the table." }],
  },
  ember: {
    collection: "patio",
    trending: true,
    benefits: [
      "LED flame in smoked glass — indoor sibling to Halo",
      "No heat, no oil, no open flame",
      "USB-C, sits on a side table",
    ],
    faq: [
      {
        q: "Is this a real fire?",
        a: "No. A flame-shaped LED in glass. It is a lamp. We do not sell heaters or fireplaces.",
      },
      priceFaq,
      payFaq,
      shipFaq,
      returnFaq,
    ],
    relatedIds: ["halo", "filament"],
    notes: [{ name: "Wren", city: "Boise", quote: "The indoor dusk. Halo stays on the patio." }],
  },
  field: {
    collection: "travel",
    trending: true,
    benefits: ["Silicone grooming glove, right-hand", "For the couch, after the shed", "Light enough to toss in Drift"],
    faq: [priceFaq, shipFaq, returnFaq],
    relatedIds: ["drift", "shore"],
    notes: [{ name: "Eden", city: "Denver", quote: "The couch, after the shed. That is the whole ad." }],
  },
  ...extraMerch,
};

export function merchFor(id: string): Merch {
  const fallback: Merch = {
    collection: "patio",
    benefits: [],
    faq: [payFaq, shipFaq, returnFaq],
    relatedIds: ["halo"],
    notes: [],
  };
  const m = merch[id];
  if (!m) return fallback;
  if (m.faq.length === 0) return { ...m, faq: [priceFaq, payFaq, shipFaq, returnFaq] };
  return m;
}
