import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  agents as seedAgents,
  campaigns as seedCampaigns,
  creatives as seedCreatives,
  flows as seedFlows,
  hunts as seedHunts,
  inbox as seedInbox,
  logs as seedLogs,
  orders as seedOrders,
  products as seedProducts,
  returns as seedReturns,
} from "./seed";
import type {
  Agent,
  Campaign,
  CartItem,
  HuntCandidate,
  Order,
  Product,
  SimEvent,
} from "./types";
import {
  approveAgent,
  cloneState,
  launchHunt,
  openReturn,
  placeOrder,
  promoteCreative,
  rejectAgent,
  resolveReturn,
  runTick,
  toggleAgent,
  type EngineState,
} from "./engine";

function engineOf(s: EngineState): EngineState {
  return cloneState({
    products: s.products,
    orders: s.orders,
    flows: s.flows,
    campaigns: s.campaigns,
    inbox: s.inbox,
    logs: s.logs,
    hunts: s.hunts,
    creatives: s.creatives,
    agents: s.agents,
    returns: s.returns,
    orderSeq: s.orderSeq,
  });
}

function seedEngine(): EngineState {
  return {
    products: cloneState(seedProducts),
    orders: cloneState(seedOrders),
    flows: cloneState(seedFlows),
    campaigns: cloneState(seedCampaigns),
    inbox: cloneState(seedInbox),
    logs: cloneState(seedLogs),
    hunts: cloneState(seedHunts),
    creatives: cloneState(seedCreatives),
    agents: cloneState(seedAgents),
    returns: cloneState(seedReturns),
    orderSeq: seedOrders.length + 6,
  };
}

export type CheckoutInfo = {
  customer: string;
  email: string;
  phone?: string;
  street?: string;
  apt?: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string;
};


export type ShopState = EngineState & {
  cart: CartItem[];
  live: boolean;
  lastEvent?: SimEvent;
  bagOpen: boolean;
  searchOpen: boolean;
  myOrders: Order[];
  lastEmail: string;
  addToCart: (productId: string, qty?: number, opts?: { openBag?: boolean }) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  checkout: (info: CheckoutInfo, opts?: { productId?: string }) => Order | null;
  rememberEmail: (email: string) => void;
  openBag: () => void;
  closeBag: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleFlow: (id: string) => void;
  addFlowStep: (flowId: string, title: string, detail: string) => void;
  setCampaignStatus: (id: string, status: Campaign["status"]) => void;
  setProductStatus: (id: string, status: Product["status"]) => void;
  launch: (hunt: HuntCandidate) => void;
  tick: (forced?: SimEvent) => void;
  nightShift: () => void;
  setLive: (live: boolean) => void;
  reset: () => void;
  approve: (id: Agent["id"]) => void;
  reject: (id: Agent["id"]) => void;
  toggleBot: (id: Agent["id"]) => void;
  fileReturn: (orderId: string, reason: string) => void;
  settleReturn: (id: string, status: "reship" | "refunded") => void;
  pickCreative: (id: string) => void;
};


export const useRelay = create<ShopState>()(
  persist(
    (set) => ({
      ...seedEngine(),
      cart: [],
      live: false,
      bagOpen: false,
      searchOpen: false,
      myOrders: [],
      lastEmail: "",
      addToCart: (productId, qty = 1, opts) =>
        set((s) => {
          const add = Math.max(1, qty);
          const existing = s.cart.find((c) => c.productId === productId);
          const cart = existing
            ? s.cart.map((c) =>
                c.productId === productId ? { ...c, qty: c.qty + add } : c,
              )
            : [...s.cart, { productId, qty: add }];
          const openBag = opts?.openBag !== false;
          return { cart, bagOpen: openBag, searchOpen: false };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((c) => c.productId !== productId)
              : s.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
        })),
      clearCart: () => set({ cart: [] }),
      checkout: (info, opts) => {
        let created: Order | null = null;
        set((s) => {
          const items = opts?.productId
            ? s.cart.filter((c) => c.productId === opts.productId)
            : s.cart;
          if (!items.length) return s;
          const next = engineOf(s);
          const city = [info.city, info.state].filter(Boolean).join(", ") || "US";
          created = placeOrder(next, {
            items,
            customer: info.customer || "Guest",
            email: info.email,
            phone: info.phone,
            street: info.street,
            apt: info.apt,
            city,
            state: info.state,
            zip: info.zip,
            country: info.country || "United States",
            source: "storefront",
          });
          const cart = opts?.productId
            ? s.cart.filter((c) => c.productId !== opts.productId)
            : [];
          const myOrders = created ? [created, ...s.myOrders].slice(0, 40) : s.myOrders;
          return {
            ...next,
            cart,
            bagOpen: false,
            searchOpen: false,
            myOrders,
            lastEmail: info.email || s.lastEmail,
          };
        });
        return created;
      },
      rememberEmail: (email) => set({ lastEmail: email }),
      openBag: () => set({ bagOpen: true, searchOpen: false }),
      closeBag: () => set({ bagOpen: false }),
      openSearch: () => set({ searchOpen: true, bagOpen: false }),
      closeSearch: () => set({ searchOpen: false }),
      toggleFlow: (id) =>
        set((s) => ({
          flows: s.flows.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
        })),
      addFlowStep: (flowId, title, detail) =>
        set((s) => ({
          flows: s.flows.map((f) =>
            f.id === flowId
              ? {
                  ...f,
                  steps: [
                    ...f.steps,
                    {
                      id: `s${f.steps.length + 1}`,
                      type: "email" as const,
                      title,
                      detail,
                    },
                  ],
                }
              : f,
          ),
        })),
      setCampaignStatus: (id, status) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status } : c)),
        })),
      setProductStatus: (id, status) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, status } : p)),
        })),
      launch: (hunt) =>
        set((s) => {
          const next = engineOf(s);
          launchHunt(next, hunt);
          return next;
        }),
      tick: (forced) =>
        set((s) => {
          const next = engineOf(s);
          const ev = runTick(next, forced);
          return { ...next, lastEvent: ev };
        }),
      nightShift: () =>
        set((s) => {
          const next = engineOf(s);
          for (let i = 0; i < 24; i++) runTick(next);
          return { ...next, lastEvent: "purchase" as const };
        }),
      setLive: (live) => set({ live }),
      reset: () =>
        set({
          ...seedEngine(),
          cart: [],
          live: false,
          lastEvent: undefined,
          bagOpen: false,
          searchOpen: false,
          myOrders: [],
          lastEmail: "",
        }),
      approve: (id) =>
        set((s) => {
          const next = engineOf(s);
          approveAgent(next, id);
          return next;
        }),
      reject: (id) =>
        set((s) => {
          const next = engineOf(s);
          rejectAgent(next, id);
          return next;
        }),
      toggleBot: (id) =>
        set((s) => {
          const next = engineOf(s);
          toggleAgent(next, id);
          return next;
        }),
      fileReturn: (orderId, reason) =>
        set((s) => {
          const next = engineOf(s);
          openReturn(next, orderId, reason);
          return next;
        }),
      settleReturn: (id, status) =>
        set((s) => {
          const next = engineOf(s);
          resolveReturn(next, id, status);
          return next;
        }),
      pickCreative: (id) =>
        set((s) => {
          const next = engineOf(s);
          promoteCreative(next, id);
          return next;
        }),
    }),
    {
      name: "marlow-bag",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ cart: s.cart, myOrders: s.myOrders, lastEmail: s.lastEmail }),
      skipHydration: true,
    },
  ),
);

export function cartCount(cart: CartItem[]) {
  return cart.reduce((s, c) => s + c.qty, 0);
}

export function cartLines(cart: CartItem[], products: Product[]) {
  return cart
    .map((c) => {
      const product = products.find((p) => p.id === c.productId);
      return product ? { ...c, product } : null;
    })
    .filter((x): x is { productId: string; qty: number; product: Product } => Boolean(x));
}
