export function money(cents: number) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${(abs / 100).toFixed(2)}`;
}

export function moneyShort(cents: number) {
  const abs = Math.abs(cents);
  if (abs >= 100000) return `${cents < 0 ? "-" : ""}$${Math.round(abs / 100000)}k`;
  return money(cents);
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export function orderNumber(n: number) {
  return `#M${String(10420 + n).padStart(5, "0")}`;
}

export function timeAgo(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function paymentFee(subtotal: number) {
  return Math.round(subtotal * 0.029) + 30;
}

export function contribution(args: {
  revenue: number;
  cost: number;
  shipCost: number;
  ad: number;
}) {
  return args.revenue - args.cost - args.shipCost - paymentFee(args.revenue) - args.ad;
}

export function unitEconomics(args: {
  price: number;
  cost: number;
  shipCost: number;
  cpa?: number;
}) {
  const cpa = args.cpa ?? 0;
  const landed = args.cost + args.shipCost;
  const fees = paymentFee(args.price);
  const returnsReserve = Math.round(args.price * 0.04);
  const afterCost = args.price - landed - fees;
  const contrib = afterCost - returnsReserve - cpa;
  const beCpa = Math.max(0, afterCost - returnsReserve);
  const beRoas = beCpa > 0 ? args.price / beCpa : 0;
  const multiple = args.cost > 0 ? args.price / args.cost : 0;
  return { landed, fees, returnsReserve, afterCost, contrib, beCpa, beRoas, multiple };
}

export const FREE_SHIP = 0;
export const SHIP_RATE = 0;

export function shippingFor(_subtotal: number) {
  return 0;
}

