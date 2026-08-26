import { merchFor } from "./catalog";
import { posts } from "./journal";
import { extraSeo } from "./line";
import { products } from "./seed";

export const SITE = {
  name: "Marlow",
  tagline: "Light the yard. Keep the night.",
  description:
    "Rechargeable patio lanterns, solar string lights, and evening kit. Open. Card on Stripe. Free tracked US shipping.",
  locale: "en_US",
  region: "Danville, Kentucky",
};

export type PageHead = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
};

function env(key: string): string {
  try {
    if (typeof process === "undefined" || !process.env) return "";
    return process.env[key]?.trim() ?? "";
  } catch {
    return "";
  }
}

export function resolveOrigin(requestUrl?: string): string {
  if (requestUrl) {
    try {
      const u = new URL(requestUrl);
      if (u.origin && u.origin !== "null") return u.origin;
    } catch {
      /* ignore */
    }
  }
  const viteSite = env("VITE_SITE_URL").replace(/\/$/, "");
  const vercelProd = env("VERCEL_PROJECT_PRODUCTION_URL");
  const authUrl = env("BETTER_AUTH_URL").replace(/\/$/, "");
  const envOrigin = viteSite || (vercelProd ? `https://${vercelProd}` : "") || authUrl;
  if (envOrigin) return envOrigin;
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "";
}

export function absoluteUrl(path: string, origin = resolveOrigin()): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${p}` : p;
}

const productSeo: Record<string, { title: string; description: string }> = {
  halo: {
    title: "Halo lantern — rechargeable patio lantern | Marlow",
    description:
      "USB-C rechargeable patio lantern with a low amber field. Eight-hour burn, weather-sealed. $39. Free tracked US shipping.",
  },
  filament: {
    title: "Filament string lights — 10m solar patio lights | Marlow",
    description:
      "Solar filament string lights, ten metres, dusk-to-dawn sensor. No outdoor outlet. $28. Free tracked US shipping.",
  },
  drift: {
    title: "Drift dry bag — 10L roll-top | Marlow",
    description: "10L matte sage roll-top dry bag. Lake, boat, rain. $24. Free tracked US shipping.",
  },
  shore: {
    title: "Shore picnic tote — insulated for two | Marlow",
    description:
      "Insulated collapsible picnic tote in bone canvas. Two people, one evening. $42. Free tracked US shipping.",
  },
  vesper: {
    title: "Vesper patio oil — two-pack amber glass | Marlow",
    description:
      "Two-pack patio oil in amber glass for the Halo tray. Atmosphere, not a pesticide. $16. Free tracked US shipping.",
  },
  kiln: {
    title: "Kiln tumbler — 32oz insulated sip bottle | Marlow",
    description:
      "32oz insulated sip bottle in bone steel. Unbranded. Typical listing near $34. Kiln is $24. Free tracked US shipping.",
  },
  pulse: {
    title: "Pulse blender bottle — USB-C 22oz | Marlow",
    description:
      "USB-C personal blender bottle, 22oz cup. Twenty seconds on the counter. $28. Free tracked US shipping.",
  },
  meadow: {
    title: "Meadow picnic cloth — waterproof bone canvas | Marlow",
    description:
      "Waterproof picnic cloth that folds into itself. Bone canvas, sage stitch. $24. Free tracked US shipping.",
  },
  ember: {
    title: "Ember flame lamp — indoor LED flame | Marlow",
    description:
      "LED flame in smoked glass. Indoor dusk without heat or oil. $34. Free tracked US shipping.",
  },
  field: {
    title: "Field grooming glove — sage silicone | Marlow",
    description:
      "Sage silicone grooming glove for the couch after the shed. $14. Free tracked US shipping.",
  },
  kit: {
    title: "Evening kit — patio lantern + solar string lights | Marlow",
    description:
      "Halo lantern plus 10m Filament solar lights. $62 for the pair, $5 under buying them apart. Free tracked US shipping.",
  },
  ...extraSeo,
};

export function productBySlug(slug: string) {
  return products.find((p) => p.slug === slug && p.status !== "killed");
}

export function seoForProduct(slug: string) {
  const product = productBySlug(slug);
  if (!product) {
    return {
      title: "Piece not found | Marlow",
      description: SITE.description,
      path: `/product/${slug}`,
      noindex: true,
    } satisfies PageHead;
  }
  const extra = productSeo[product.id];
  return {
    title: extra?.title ?? `${product.name} | Marlow`,
    description: extra?.description ?? product.description.slice(0, 155),
    path: `/product/${product.slug}`,
    image: product.image,
  } satisfies PageHead;
}

export function pageHead(page: PageHead) {
  const origin = resolveOrigin();
  const canonical = absoluteUrl(page.path, origin);
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      {
        name: "robots",
        content: page.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
      },
      { name: "author", content: SITE.name },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}

export function liveProducts() {
  return products.filter((p) => p.status !== "killed");
}

export function publicPaths(): { path: string; changefreq: string; priority: string }[] {
  return [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/shop", changefreq: "daily", priority: "0.9" },
    ...liveProducts().map((p) => ({
      path: `/product/${p.slug}`,
      changefreq: "weekly",
      priority: "0.8",
    })),
    { path: "/journal", changefreq: "weekly", priority: "0.6" },
    ...posts.map((p) => ({
      path: `/journal/${p.slug}`,
      changefreq: "monthly",
      priority: "0.5",
    })),
    { path: "/policies", changefreq: "monthly", priority: "0.3" },
  ];
}

export function robotsTxt(origin: string) {
  const sitemap = absoluteUrl("/sitemap.xml", origin);
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /cart",
    "Disallow: /checkout",
    "Disallow: /order",
    "Disallow: /ops",
    "Disallow: /__grok/",
    "",
    `Sitemap: ${sitemap}`,
    "",
  ].join("\n");
}

export function sitemapXml(origin: string, lastmod = new Date().toISOString().slice(0, 10)) {
  const urls = publicPaths()
    .map((u) => {
      const loc = escapeXml(absoluteUrl(u.path, origin));
      return [
        "  <url>",
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${u.changefreq}</changefreq>`,
        `    <priority>${u.priority}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "\u0026amp;")
    .replaceAll("<", "\u0026lt;")
    .replaceAll(">", "\u0026gt;")
    .replaceAll('"', "\u0026quot;");
}

export function organizationJsonLd(origin = resolveOrigin()) {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: SITE.name,
    description: SITE.description,
    url: origin || undefined,
    image: origin ? `${origin}/og.jpg` : "/og.jpg",
    priceRange: "$14–$42",
    currenciesAccepted: "USD",
    paymentAccepted: "Credit Card",
    areaServed: { "@type": "Country", name: "United States" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Danville",
      addressRegion: "KY",
      addressCountry: "US",
    },
  };
}

export function websiteJsonLd(origin = resolveOrigin()) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: origin || undefined,
    description: SITE.description,
    inLanguage: "en-US",
    publisher: { "@type": "Organization", name: SITE.name },
  };
}

export function productJsonLd(slug: string, origin = resolveOrigin()) {
  const product = productBySlug(slug);
  if (!product) return null;
  const info = merchFor(product.id);
  const url = absoluteUrl(`/product/${product.slug}`, origin);
  const image = product.image.startsWith("http")
    ? product.image
    : absoluteUrl(product.image, origin);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [image],
    sku: product.id,
    brand: { "@type": "Brand", name: SITE.name },
    category: info.collection,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: (product.price / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 5, maxValue: 9, unitCode: "DAY" },
        },
      },
    },
  };
}

export function faqJsonLd(slug: string) {
  const product = productBySlug(slug);
  if (!product) return null;
  const faq = merchFor(product.id).faq;
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(slug: string, origin = resolveOrigin()) {
  const product = productBySlug(slug);
  if (!product) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/", origin) },
      { "@type": "ListItem", position: 2, name: "Shop", item: absoluteUrl("/shop", origin) },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: absoluteUrl(`/product/${product.slug}`, origin),
      },
    ],
  };
}

export function itemListJsonLd(origin = resolveOrigin()) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Marlow evening kit",
    itemListElement: liveProducts().map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/product/${p.slug}`, origin),
      name: p.name,
    })),
  };
}

export function articleJsonLd(
  post: { slug: string; title: string; dek: string; body: string[] },
  origin = resolveOrigin(),
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.dek,
    articleBody: post.body.join(" "),
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    url: absoluteUrl(`/journal/${post.slug}`, origin),
    mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`, origin),
  };
}
