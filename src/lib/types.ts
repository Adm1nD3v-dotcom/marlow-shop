export type ProductStatus = "live" | "testing" | "killed";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAt?: number;
  cost: number;
  shipCost: number;
  weightG: number;
  supplierId: string;
  supplierSku: string;
  processing: string;
  score: number;
  status: ProductStatus;
  image: string;
  details: string[];
  launchedAt: number;
};

export type Supplier = {
  id: string;
  name: string;
  network: "CJ Dropshipping" | "AliExpress" | "Zendrop";
  role: "primary" | "backup" | "sampling";
  rating: number;
  processing: string;
  shipping: string;
  defectPolicy: string;
  privateLabel: boolean;
  notes: string;
};

export type OrderStatus =
  | "paid"
  | "routed"
  | "processing"
  | "shipped"
  | "delivered"
  | "refunded";

export type OrderItem = {
  productId: string;
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  number: string;
  createdAt: number;
  customer: string;
  city: string;
  email: string;
  phone?: string;
  street?: string;
  apt?: string;
  state?: string;
  zip?: string;
  country?: string;
  items: OrderItem[];
  status: OrderStatus;
  supplierId: string;
  tracking?: string;
  source: "storefront" | "sim";
  campaignId?: string;
  recovered?: boolean;
};

export type CartItem = { productId: string; qty: number };

export type StepType =
  | "trigger"
  | "wait"
  | "condition"
  | "email"
  | "sms"
  | "tag"
  | "route"
  | "discount"
  | "pause_ad"
  | "notify";

export type FlowStep = {
  id: string;
  type: StepType;
  title: string;
  detail: string;
};

export type Flow = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: string;
  steps: FlowStep[];
  fired: number;
  converted: number;
  revenue: number;
};

export type CampaignStatus = "active" | "paused" | "killed";

export type Campaign = {
  id: string;
  name: string;
  channel: "Meta" | "TikTok" | "Google";
  productId: string;
  dailyBudget: number;
  spend: number;
  clicks: number;
  purchases: number;
  revenue: number;
  status: CampaignStatus;
  launchedAt: number;
  angle: string;
  utm: string;
};

export type Creative = {
  id: string;
  campaignId: string;
  hook: string;
  format: "static" | "ugc" | "search";
  status: "testing" | "winner" | "killed";
  spend: number;
  purchases: number;
};

export type AgentRole = "catalog" | "marketing" | "fulfillment" | "support";

export type AgentPending = {
  kind: "kill_ad" | "raise_budget" | "request_sample" | "draft_mail";
  targetId: string;
  title: string;
  detail: string;
};

export type Agent = {
  id: AgentRole;
  name: string;
  brief: string;
  enabled: boolean;
  lastAction: string;
  pending: AgentPending | null;
};

export type ReturnCase = {
  id: string;
  orderId: string;
  number: string;
  reason: string;
  status: "open" | "reship" | "refunded";
  at: number;
};

export type InboxItem = {
  id: string;
  at: number;
  channel: "email" | "sms" | "ops";
  to: string;
  subject: string;
  body: string;
  flowId: string;
};

export type LogItem = {
  id: string;
  at: number;
  flowId?: string;
  message: string;
  tone: "info" | "ok" | "warn";
};

export type HuntCandidate = {
  id: string;
  name: string;
  niche: string;
  cost: number;
  retail: number;
  weightG: number;
  score: number;
  angle: string;
  why: string[];
  risks: string[];
  launched: boolean;
  sample: "locked" | "inbound" | "needed";
  competition: "low" | "medium" | "high";
  restricted: boolean;
  marketplace?: number;
  cjSku?: string;
};

export type SimEvent =
  | "purchase"
  | "abandon"
  | "ad_click"
  | "ship"
  | "deliver"
  | "refund";
