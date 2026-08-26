import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreShell } from "@/components/store-shell";
import { posts } from "@/lib/journal";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/journal")({
  head: () =>
    pageHead({
      title: "Journal — living with the pieces | Marlow",
      description:
        "How to live with a patio lantern, solar string lights, and the evening kit. Notes from Marlow, not a coupon blast.",
      path: "/journal",
    }),
  component: JournalPage,
});

function JournalPage() {
  return (
    <StoreShell>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs tracking-[0.22em] text-sage uppercase">Notes</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Journal</h1>
        <p className="mt-3 max-w-lg text-muted">
          How to live with the pieces. Not a coupon blast.
        </p>
        <ul className="mt-10 space-y-4">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                to="/journal/$slug"
                params={{ slug: p.slug }}
                className="block rounded-xl bg-elevated p-5"
              >
                <h2 className="font-display text-2xl tracking-tight">{p.title}</h2>
                <p className="mt-2 text-sm text-muted">{p.dek}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </StoreShell>
  );
}
