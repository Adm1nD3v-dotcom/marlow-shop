import { Link } from "@tanstack/react-router";

export function StoreFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-xl">Marlow</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Evening pieces for the yard and table. Open. Paid on Stripe. Honest timing.
          </p>
          <p className="mt-3 text-xs text-subtle">Marlow · Danville, Kentucky</p>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <Link to="/shop" className="flex h-11 items-center text-muted hover:text-bone">
            Shop
          </Link>
          <Link to="/journal" className="flex h-11 items-center text-muted hover:text-bone">
            Journal
          </Link>
          <Link to="/share" className="flex h-11 items-center text-muted hover:text-bone">
            Pay links
          </Link>
          <Link to="/policies" className="flex h-11 items-center text-muted hover:text-bone">
            Shipping & returns
          </Link>
          <Link to="/order" className="flex h-11 items-center text-muted hover:text-bone">
            Order lookup
          </Link>
        </nav>
      </div>
      <p className="border-t border-line px-4 py-4 text-center text-xs text-subtle">
        Marlow · dusk living · open
      </p>
    </footer>
  );
}
