import type {
  Agent,
  Campaign,
  Creative,
  Flow,
  HuntCandidate,
  InboxItem,
  LogItem,
  Order,
  Product,
  ReturnCase,
  SimEvent,
} from "./types";
import { contribution, paymentFee, uid } from "./format";
import { products as catalogSeed } from "./seed";

export function orderTotal(order: Order) {
  return order.items.reduce((s, i) => s + i.price * i.qty, 0);
}

export function productCogs(order: Order, products: Product[]) {
  return order.items.reduce((s, i) => {
    const p = products.find((x) => x.id === i.productId);
    if (!p) return s;
    return s + (p.cost + p.shipCost) * i.qty;
  }, 0);
}

export function campaignHealth(c: Campaign, products: Product[]) {
  const p = products.find((x) => x.id === c.productId);
  const cogsPer = p ? p.cost + p.shipCost : 0;
  const cogs = cogsPer * c.purchases;
  const fees = paymentFee(c.revenue);
  const contrib = contribution({
    revenue: c.revenue,
    cost: cogs,
    shipCost: 0,
    ad: c.spend,
  });
  const roas = c.spend > 0 ? c.revenue / c.spend : 0;
  const cpa = c.purchases > 0 ? c.spend / c.purchases : c.spend;
  const ageH = (Date.now() - c.launchedAt) / 3600_000;
  const shouldKill =
    c.status === "active" && ageH >= 36 && contrib < 0 && c.spend >= 2000;
  return { contrib, roas, cpa, fees, shouldKill, ageH };
}

const BUYERS = [
  ["Rowan Hale", "Portland, OR", "rowan.h@example.com"],
  ["Sasha Quinn", "Austin, TX", "sasha.q@example.com"],
  ["Eden Park", "Denver, CO", "eden.p@example.com"],
  ["Milo Hart", "Nashville, TN", "milo.h@example.com"],
  ["Ira Bennett", "Seattle, WA", "ira.b@example.com"],
  ["Noor Ellison", "Chicago, IL", "noor.e@example.com"],
  ["Jules Abram", "Brooklyn, NY", "jules.a@example.com"],
  ["Wren Solis", "Boise, ID", "wren.s@example.com"],
  ["Kai Morel", "Asheville, NC", "kai.m@example.com"],
  ["Pia Voss", "Minneapolis, MN", "pia.v@example.com"],
];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function liveProducts(products: Product[]) {
  return products.filter((p) => p.status !== "killed");
}

export type EngineState = {
  products: Product[];
  orders: Order[];
  flows: Flow[];
  campaigns: Campaign[];
  inbox: InboxItem[];
  logs: LogItem[];
  hunts: HuntCandidate[];
  creatives: Creative[];
  agents: Agent[];
  returns: ReturnCase[];
  orderSeq: number;
};

function pushLog(
  state: EngineState,
  message: string,
  tone: LogItem["tone"],
  flowId?: string,
) {
  state.logs = [
    { id: uid("log"), at: Date.now(), message, tone, flowId },
    ...state.logs,
  ].slice(0, 80);
}

function fireFlow(
  state: EngineState,
  flowId: string,
  extras?: { revenue?: number; convert?: boolean },
) {
  state.flows = state.flows.map((f) =>
    f.id === flowId
      ? {
          ...f,
          fired: f.fired + 1,
          converted: f.converted + (extras?.convert ? 1 : 0),
          revenue: f.revenue + (extras?.revenue ?? 0),
        }
      : f,
  );
}

function sendMail(
  state: EngineState,
  flowId: string,
  to: string,
  subject: string,
  body: string,
  channel: InboxItem["channel"] = "email",
) {
  const flow = state.flows.find((f) => f.id === flowId);
  if (flow && !flow.enabled) return;
  state.inbox = [
    {
      id: uid("msg"),
      at: Date.now(),
      channel,
      to,
      subject,
      body,
      flowId,
    },
    ...state.inbox,
  ].slice(0, 60);
}

export function routeOrder(state: EngineState, order: Order) {
  const flow = state.flows.find((f) => f.id === "flow-route");
  if (flow && !flow.enabled) return order;
  const next: Order = { ...order, status: "routed" };
  fireFlow(state, "flow-route", { convert: true });
  const sku = order.items
    .map((i) => i.name)
    .join(" + ");
  pushLog(
    state,
    `PO opened for ${order.number} · ${sku} → supplier`,
    "ok",
    "flow-route",
  );
  sendMail(
    state,
    "flow-route",
    order.email,
    `${order.items[0]?.name ?? "Your order"} is with the warehouse`,
    `${order.customer.split(" ")[0]} — we sent this to the supplier the moment it paid. Tracked shipping usually lands in 5–9 days. No warehouse of ours. No delay waiting on a person.`,
  );
  return next;
}

export function placeOrder(
  state: EngineState,
  args: {
    items: { productId: string; qty: number }[];
    customer: string;
    city: string;
    email: string;
    phone?: string;
    street?: string;
    apt?: string;
    state?: string;
    zip?: string;
    country?: string;
    source: Order["source"];
    campaignId?: string;
    recovered?: boolean;
  },
) {
  const lines = args.items
    .map((i) => {
      const p = state.products.find((x) => x.id === i.productId);
      if (!p) return null;
      return { productId: p.id, name: p.name, qty: i.qty, price: p.price };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  if (!lines.length) return null;

  const primary = state.products.find((p) => p.id === lines[0]!.productId);
  state.orderSeq += 1;
  let order: Order = {
    id: uid("ord"),
    number: `#M${String(10420 + state.orderSeq)}`,
    createdAt: Date.now(),
    customer: args.customer,
    city: args.city,
    email: args.email,
    phone: args.phone,
    street: args.street,
    apt: args.apt,
    state: args.state,
    zip: args.zip,
    country: args.country,
    items: lines,
    status: "paid",
    supplierId: primary?.supplierId ?? "cj",
    source: args.source,
    campaignId: args.campaignId,
    recovered: args.recovered,
  };
  order = routeOrder(state, order);
  state.orders = [order, ...state.orders].slice(0, 80);

  if (args.campaignId) {
    const total = orderTotal(order);
    state.campaigns = state.campaigns.map((c) =>
      c.id === args.campaignId
        ? {
            ...c,
            purchases: c.purchases + 1,
            revenue: c.revenue + total,
          }
        : c,
    );
  }

  const total = orderTotal(order);
  if (args.recovered) {
    fireFlow(state, "flow-abandon", { convert: true, revenue: total });
    pushLog(
      state,
      `Recovered cart ${order.number} · ${total / 100} closed`,
      "ok",
      "flow-abandon",
    );
  }

  const ltv = total;
  const vip = state.flows.find((f) => f.id === "flow-vip");
  if (vip?.enabled && ltv >= 8000) {
    fireFlow(state, "flow-vip", { convert: true });
    sendMail(
      state,
      "flow-vip",
      order.email,
      "You’re on the dusk list",
      "Future Marlow pieces go to you first. No punch card. Just the next table.",
    );
  }
  return order;
}

export function recoverAbandon(state: EngineState) {
  const flow = state.flows.find((f) => f.id === "flow-abandon");
  if (!flow?.enabled) return;
  const p = pick(liveProducts(state.products));
  fireFlow(state, "flow-abandon");
  sendMail(
    state,
    "flow-abandon",
    "guest.cart@example.com",
    "The table is still set",
    `You left ${p.name} in the bag. It will be here when the evening is. A quiet 10% sits on the order for the next two dusks.`,
  );
  pushLog(state, `Recovery note · ${p.name} still in a cart`, "info", "flow-abandon");
  if (Math.random() < 0.32) {
    const buyer = pick(BUYERS);
    placeOrder(state, {
      items: [{ productId: p.id, qty: 1 }],
      customer: buyer[0],
      city: buyer[1],
      email: buyer[2],
      source: "sim",
      recovered: true,
    });
  }
}

export function tickShip(state: EngineState) {
  const idx = state.orders.findIndex((o) => o.status === "routed" || o.status === "processing");
  if (idx < 0) return;
  const o = state.orders[idx]!;
  const next: Order =
    o.status === "routed"
      ? { ...o, status: "processing" }
      : {
          ...o,
          status: "shipped",
          tracking: `9400 ${Math.floor(1000 + Math.random() * 8999)} ${Math.floor(1000 + Math.random() * 8999)}`,
        };
  state.orders = state.orders.map((x) => (x.id === o.id ? next : x));
  if (next.status === "shipped") {
    pushLog(state, `Tracking on ${next.number}`, "info", "flow-route");
  }
}

export function tickDeliver(state: EngineState) {
  const o = state.orders.find((x) => x.status === "shipped");
  if (!o) return;
  state.orders = state.orders.map((x) =>
    x.id === o.id ? { ...x, status: "delivered" } : x,
  );
  const welcome = state.flows.find((f) => f.id === "flow-welcome");
  if (welcome?.enabled) {
    fireFlow(state, "flow-welcome");
    sendMail(
      state,
      "flow-welcome",
      o.email,
      "Place it low",
      `${o.customer.split(" ")[0]} — set the lantern at table height. Charge over lunch. It is meant to burn through a long dusk, not a party strobe.`,
    );
  }
  const review = state.flows.find((f) => f.id === "flow-review");
  if (review?.enabled && Math.random() < 0.45) {
    fireFlow(state, "flow-review", { convert: true });
    sendMail(
      state,
      "flow-review",
      o.email,
      "Send a still from the table",
      "If the evening looked the way you hoped, a single photo is enough. No star lecture.",
    );
  }
}

export function tickAds(state: EngineState) {
  state.campaigns = state.campaigns.map((c) => {
    if (c.status !== "active") return c;
    const spend = 40 + Math.floor(Math.random() * Math.max(80, c.dailyBudget / 20));
    const clicks = 2 + Math.floor(Math.random() * 12);
    return { ...c, spend: c.spend + spend, clicks: c.clicks + clicks };
  });

  const kill = state.flows.find((f) => f.id === "flow-kill");
  if (!kill?.enabled) return;
  for (const c of state.campaigns) {
    if (c.status !== "active") continue;
    const health = campaignHealth(c, state.products);
    if (health.shouldKill) {
      state.campaigns = state.campaigns.map((x) =>
        x.id === c.id ? { ...x, status: "killed" as const } : x,
      );
      const sku = state.products.find((p) => p.id === c.productId);
      if (sku?.status === "testing") {
        state.products = state.products.map((p) =>
          p.id === sku.id ? { ...p, status: "killed" as const } : p,
        );
      }
      fireFlow(state, "flow-kill", { convert: true });
      pushLog(
        state,
        `Killed ${c.name} · contribution ${Math.round(health.contrib) / 100} after ads`,
        "warn",
        "flow-kill",
      );
      sendMail(
        state,
        "flow-kill",
        "ops@marlow",
        `${c.name} paused by the 48-hour rule`,
        `Contribution after product, shipping, fees, and ads went negative. Campaign killed. Rewrite the angle or bury the SKU.`,
        "ops",
      );
    }
  }
}

export function simulatedPurchase(state: EngineState) {
  const activeAds = state.campaigns.filter((c) => c.status === "active");
  const campaign = activeAds.length ? pick(activeAds) : undefined;
  const productId = campaign?.productId ?? pick(liveProducts(state.products)).id;
  const product = state.products.find((p) => p.id === productId);
  if (!product || product.status === "killed") return;
  const buyer = pick(BUYERS);
  const extra =
    Math.random() < 0.28
      ? liveProducts(state.products).find((p) => p.id !== product.id)
      : undefined;
  const items = [{ productId: product.id, qty: 1 }];
  if (extra) items.push({ productId: extra.id, qty: 1 });
  placeOrder(state, {
    items,
    customer: buyer[0],
    city: buyer[1],
    email: buyer[2],
    source: "sim",
    campaignId: campaign?.id,
  });
}

export function runTick(state: EngineState, forced?: SimEvent) {
  const roll = forced ?? (pick(["purchase", "purchase", "abandon", "ad_click", "ship", "deliver"] as SimEvent[]));
  if (roll === "purchase") simulatedPurchase(state);
  else if (roll === "abandon") recoverAbandon(state);
  else if (roll === "ship") tickShip(state);
  else if (roll === "deliver") tickDeliver(state);
  else if (roll === "refund") {
    const o = state.orders.find((x) => x.status !== "refunded");
    if (o) {
      state.orders = state.orders.map((x) =>
        x.id === o.id ? { ...x, status: "refunded" } : x,
      );
      pushLog(state, `Refund ${o.number}`, "warn");
    }
  }
  tickAds(state);
  tickAgents(state);
  return roll;
}

export function tickAgents(state: EngineState) {
  const mkt = state.agents.find((a) => a.id === "marketing");
  if (mkt?.enabled && !mkt.pending) {
    const weak = state.campaigns.find(
      (c) => c.status === "active" && campaignHealth(c, state.products).shouldKill,
    );
    if (weak) {
      setAgentPending(state, "marketing", {
        kind: "kill_ad",
        targetId: weak.id,
        title: `Pause ${weak.name}`,
        detail: "Contribution negative past 36h. Human checkpoint — the agent does not spend or kill alone.",
      });
    }
  }
  const cat = state.agents.find((a) => a.id === "catalog");
  if (cat?.enabled && !cat.pending) {
    const unsampled = state.hunts.find((h) => !h.launched && h.sample === "needed" && !h.restricted);
    if (unsampled) {
      setAgentPending(state, "catalog", {
        kind: "request_sample",
        targetId: unsampled.id,
        title: `Sample ${unsampled.name} before a $20 test`,
        detail: "No locked sample. Skill 121–150: do not scale spend on a photograph.",
      });
    }
  }
}

function setAgentPending(
  state: EngineState,
  id: Agent["id"],
  pending: NonNullable<Agent["pending"]>,
) {
  state.agents = state.agents.map((a) =>
    a.id === id ? { ...a, pending, lastAction: `Proposed: ${pending.title}` } : a,
  );
}

export function approveAgent(state: EngineState, id: Agent["id"]) {
  const agent = state.agents.find((a) => a.id === id);
  if (!agent?.pending) return;
  const p = agent.pending;
  if (p.kind === "kill_ad") {
    state.campaigns = state.campaigns.map((c) =>
      c.id === p.targetId ? { ...c, status: "paused" as const } : c,
    );
    pushLog(state, `Human approved · paused ${p.title}`, "warn", "flow-kill");
  } else if (p.kind === "raise_budget") {
    state.campaigns = state.campaigns.map((c) =>
      c.id === p.targetId ? { ...c, dailyBudget: c.dailyBudget + 1000 } : c,
    );
    pushLog(state, `Human approved · ${p.title}`, "ok");
  } else if (p.kind === "request_sample") {
    state.hunts = state.hunts.map((h) =>
      h.id === p.targetId ? { ...h, sample: "inbound" as const } : h,
    );
    pushLog(state, `Sample ordered · ${p.title}`, "ok");
  } else if (p.kind === "draft_mail") {
    sendMail(
      state,
      "flow-welcome",
      "ops@marlow",
      p.title,
      p.detail,
      "ops",
    );
    pushLog(state, `Support draft filed`, "info");
  }
  state.agents = state.agents.map((a) =>
    a.id === id ? { ...a, pending: null, lastAction: `Approved: ${p.title}` } : a,
  );
}

export function rejectAgent(state: EngineState, id: Agent["id"]) {
  const agent = state.agents.find((a) => a.id === id);
  if (!agent?.pending) return;
  const title = agent.pending.title;
  state.agents = state.agents.map((a) =>
    a.id === id ? { ...a, pending: null, lastAction: `Rejected: ${title}` } : a,
  );
  pushLog(state, `Human rejected · ${title}`, "info");
}

export function toggleAgent(state: EngineState, id: Agent["id"]) {
  state.agents = state.agents.map((a) =>
    a.id === id ? { ...a, enabled: !a.enabled } : a,
  );
}

export function openReturn(state: EngineState, orderId: string, reason: string) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return;
  if (state.returns.some((r) => r.orderId === orderId && r.status === "open")) return;
  state.returns = [
    {
      id: uid("rma"),
      orderId,
      number: order.number,
      reason,
      status: "open",
      at: Date.now(),
    },
    ...state.returns,
  ];
  pushLog(state, `RMA opened ${order.number}`, "warn");
}

export function resolveReturn(state: EngineState, id: string, status: "reship" | "refunded") {
  const rma = state.returns.find((r) => r.id === id);
  if (!rma) return;
  state.returns = state.returns.map((r) => (r.id === id ? { ...r, status } : r));
  if (status === "refunded") {
    state.orders = state.orders.map((o) =>
      o.id === rma.orderId ? { ...o, status: "refunded" } : o,
    );
  }
  pushLog(state, `RMA ${rma.number} → ${status}`, status === "refunded" ? "warn" : "ok");
}

export function promoteCreative(state: EngineState, id: string) {
  const cr = state.creatives.find((c) => c.id === id);
  if (!cr) return;
  state.creatives = state.creatives.map((c) =>
    c.campaignId === cr.campaignId
      ? { ...c, status: c.id === id ? ("winner" as const) : ("killed" as const) }
      : c,
  );
  state.campaigns = state.campaigns.map((c) =>
    c.id === cr.campaignId ? { ...c, angle: cr.hook } : c,
  );
  pushLog(state, `Winner: “${cr.hook}”`, "ok");
}

export function launchHunt(state: EngineState, hunt: HuntCandidate) {
  if (hunt.launched) return;
  if (hunt.restricted) {
    pushLog(
      state,
      `${hunt.name} held — restricted claims. Do not launch until copy is cleared.`,
      "warn",
    );
    return;
  }
  if (hunt.sample === "needed") {
    pushLog(
      state,
      `${hunt.name} held — no sample lock. Order one before a $20/day test.`,
      "warn",
    );
    state.hunts = state.hunts.map((h) =>
      h.id === hunt.id ? { ...h, sample: "inbound" } : h,
    );
    return;
  }
  const existing = catalogSeed.find((p) => p.name === hunt.name);
  const id = hunt.id.replace("hunt-", "sku-");
  const product: Product = existing
    ? { ...existing, status: "testing", launchedAt: Date.now() }
    : {
        id,
        slug: hunt.name.toLowerCase().replace(/\s+/g, "-"),
        name: hunt.name,
        tagline: hunt.angle,
        description: hunt.why[0] ?? hunt.angle,
        price: hunt.retail,
        cost: hunt.cost,
        shipCost: Math.round(hunt.weightG * 0.8 + 180),
        weightG: hunt.weightG,
        supplierId: "cj",
        supplierSku: `CJ-${id.toUpperCase()}`,
        processing: "24–48h",
        score: hunt.score,
        status: "testing",
        image: "/products/halo.jpg",
        details: [`${hunt.weightG}g`, hunt.niche, "US warehouse"],
        launchedAt: Date.now(),
      };
  if (!state.products.some((p) => p.id === product.id || p.name === product.name)) {
    state.products = [product, ...state.products];
  } else {
    state.products = state.products.map((p) =>
      p.name === hunt.name ? { ...p, status: "testing", launchedAt: Date.now() } : p,
    );
  }
  const cid = uid("ad");
  state.campaigns = [
    {
      id: cid,
      name: `${hunt.name} · first test`,
      channel: "Meta",
      productId: product.id,
      dailyBudget: 2000,
      spend: 0,
      clicks: 0,
      purchases: 0,
      revenue: 0,
      status: "active",
      launchedAt: Date.now(),
      angle: hunt.angle,
      utm: `utm_source=meta&utm_medium=paid&utm_campaign=${hunt.id}`,
    },
    ...state.campaigns,
  ];
  state.hunts = state.hunts.map((h) =>
    h.id === hunt.id ? { ...h, launched: true } : h,
  );
  pushLog(state, `Launched ${hunt.name} · $20/day Meta test`, "ok");
}

export function cloneState<T>(s: T): T {
  return structuredClone(s);
}
