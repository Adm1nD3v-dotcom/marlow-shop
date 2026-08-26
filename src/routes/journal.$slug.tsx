import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { StoreShell } from "@/components/store-shell";
import { buttonVariants } from "@/components/ui/button";
import { posts } from "@/lib/journal";
import { articleJsonLd, pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journal/$slug")({
  head: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    return pageHead({
      title: post ? `${post.title} | Marlow` : "Note not found | Marlow",
      description: post?.dek ?? "A note from Marlow.",
      path: `/journal/${params.slug}`,
      noindex: !post,
    });
  },
  component: JournalPost,
});

function JournalPost() {
  const { slug } = Route.useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <StoreShell>
        <p className="px-6 py-20 text-muted">That note is gone.</p>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <JsonLd data={articleJsonLd(post)} />
      <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <Link to="/journal" className="flex h-11 w-fit items-center text-sm text-muted hover:text-bone">
          Journal
        </Link>
        <h1 className="mt-4 font-display text-4xl tracking-tight">{post.title}</h1>
        <p className="mt-3 text-lg text-muted">{post.dek}</p>
        {post.body.map((para) => (
          <p key={para} className="mt-6 leading-relaxed text-muted">
            {para}
          </p>
        ))}
        {"productSlug" in post && post.productSlug ? (
          <Link
            to="/product/$slug"
            params={{ slug: post.productSlug }}
            className={cn("mt-10", buttonVariants())}
          >
            Shop the piece
          </Link>
        ) : null}
      </article>
    </StoreShell>
  );
}
