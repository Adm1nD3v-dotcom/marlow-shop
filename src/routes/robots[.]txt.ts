import { createFileRoute } from "@tanstack/react-router";
import { resolveOrigin, robotsTxt } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = resolveOrigin(request.url);
        return new Response(robotsTxt(origin), {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
