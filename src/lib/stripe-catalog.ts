export const stripeLinks: Record<string, string> = {
  halo: "https://buy.stripe.com/9B600iezq0wZ9vfc4XfAc00",
  filament: "https://buy.stripe.com/8x2eVcezq5RjdLv8SLfAc01",
  drift: "https://buy.stripe.com/bJefZgajaa7zgXH8SLfAc02",
  shore: "https://buy.stripe.com/5kQ5kCezq93v8rb4CvfAc03",
  vesper: "https://buy.stripe.com/aFa3cucri5Rj9vfd91fAc04",
  kiln: "https://buy.stripe.com/9B600ibnebbDePzgldfAc05",
  pulse: "https://buy.stripe.com/14AfZg62U93v5eZfh9fAc06",
  meadow: "https://buy.stripe.com/dRmeVcbne4Nf9vffh9fAc07",
  ember: "https://buy.stripe.com/9B66oG4YQcfH8rb9WPfAc08",
  field: "https://buy.stripe.com/00wdR8ezq1B3cHr2unfAc09",
  kit: "https://buy.stripe.com/fZu9AS8b2enPbDnb0TfAc0a",
  stake: "https://buy.stripe.com/bJe9AS2QI6Vn0YJ0mffAc0b",
  sconce: "https://buy.stripe.com/5kQ28qdvmbbD36R8SLfAc0c",
  globe: "https://buy.stripe.com/4gM8wOdvm0wZ4aVed5fAc0d",
  puck: "https://buy.stripe.com/dRm14m8b26VngXHb0TfAc0e",
  torch: "https://buy.stripe.com/7sYbJ0aja7ZrbDn5GzfAc0f",
  canopy: "https://buy.stripe.com/3cI00iezq2F7azj4CvfAc0g",
  wick: "https://buy.stripe.com/aFa4gy0IA6Vn4aVd91fAc0h",
  well: "https://buy.stripe.com/fZu14m0IA1B322Nd91fAc0i",
  grove: "https://buy.stripe.com/5kQ8wO2QI93vdLv1qjfAc0j",
  loom: "https://buy.stripe.com/cNieVc3UMbbDfTD4CvfAc0k",
  quill: "https://buy.stripe.com/8x200i3UM7ZrePzc4XfAc0l",
  noon: "https://buy.stripe.com/eVq5kC9f66VnbDn1qjfAc0m",
  ledge: "https://buy.stripe.com/4gM8wO62U93v22N3yrfAc0n",
  reed: "https://buy.stripe.com/aFa9AS9f62F7azj5GzfAc0o",
  nimbus: "https://buy.stripe.com/00w14m1MEcfHcHr2unfAc0p",
};

export function stripePayUrl(args: {
  productId: string;
  qty?: number;
  email?: string;
  clientReferenceId?: string;
}) {
  const base = stripeLinks[args.productId];
  if (!base) return null;
  const url = new URL(base);
  const qty = Math.max(1, args.qty ?? 1);
  if (qty > 1) url.searchParams.set("quantity", String(qty));
  if (args.email) url.searchParams.set("prefilled_email", args.email);
  if (args.clientReferenceId) url.searchParams.set("client_reference_id", args.clientReferenceId);
  return url.toString();
}
