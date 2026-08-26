import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { cartCount, useRelay } from "@/lib/store";

export function StoreNav() {
  const cart = useRelay((s) => s.cart);
  const openBag = useRelay((s) => s.openBag);
  const openSearch = useRelay((s) => s.openSearch);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const count = ready ? cartCount(cart) : 0;

  return (
    <div className="border-b border-line bg-ink/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link to="/" className="font-display text-xl tracking-tight text-bone">
          Marlow
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          <Link
            to="/shop"
            className="flex h-11 items-center px-3 text-sm text-muted transition-colors duration-150 hover:text-bone"
          >
            Shop
          </Link>
          <Link
            to="/journal"
            className="flex h-11 items-center px-3 text-sm text-muted transition-colors duration-150 hover:text-bone"
          >
            Journal
          </Link>
          <Link
            to="/share"
            className="hidden h-11 items-center px-3 text-sm text-muted transition-colors duration-150 hover:text-bone sm:flex"
          >
            Pay links
          </Link>
          <button
            type="button"
            aria-label="Search"
            className="flex size-11 items-center justify-center text-muted transition-colors duration-150 hover:text-bone"
            onClick={openSearch}
          >
            <Search className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label={count ? `Bag, ${count} items` : "Bag"}
            className="relative flex size-11 items-center justify-center text-bone"
            onClick={openBag}
          >
            <ShoppingBag className="size-4" strokeWidth={1.75} />
            {count > 0 ? (
              <span className="absolute top-1.5 right-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-bone px-1 text-[10px] font-medium text-ink tabular-nums">
                {count}
              </span>
            ) : null}
          </button>
        </nav>
      </div>
    </div>
  );
}
