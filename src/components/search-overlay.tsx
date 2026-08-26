import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { money } from "@/lib/format";
import { useRelay } from "@/lib/store";

export function SearchOverlay() {
  const open = useRelay((s) => s.searchOpen);
  const close = useRelay((s) => s.closeSearch);
  const all = useRelay((s) => s.products);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) {
      setQ("");
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const results = useMemo(() => {
    const live = all.filter((p) => p.status !== "killed");
    const needle = q.trim().toLowerCase();
    if (!needle) return live.slice(0, 6);
    return live.filter((p) =>
      `${p.name} ${p.tagline} ${p.description}`.toLowerCase().includes(needle),
    );
  }, [all, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-ink/80"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative mx-auto mt-16 w-full max-w-lg px-4 sm:mt-24"
      >
        <div className="overflow-hidden rounded-xl bg-elevated shadow-[var(--shadow-border)]">
          <div className="flex items-center gap-2 border-b border-line px-3">
            <Search className="size-4 shrink-0 text-subtle" strokeWidth={1.75} />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the line"
              className="h-14 border-0 bg-transparent shadow-none focus:shadow-none"
              aria-label="Search the line"
            />
            <button
              type="button"
              aria-label="Close"
              className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-bone"
              onClick={close}
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          </div>
          <ul className="max-h-[60dvh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-muted">No pieces match.</li>
            ) : (
              results.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    onClick={close}
                    className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-panel"
                  >
                    <img src={p.image} alt="" className="size-14 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="truncate text-sm text-muted">{p.tagline}</p>
                    </div>
                    <p className="tabular-nums text-sm">{money(p.price)}</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
