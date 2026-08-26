import { useEffect } from "react";
import { AnnounceBar } from "./announce-bar";
import { CartDrawer } from "./cart-drawer";
import { SearchOverlay } from "./search-overlay";
import { StoreFooter } from "./store-footer";
import { StoreNav } from "./store-nav";
import { useRelay } from "@/lib/store";

export function StoreShell({ children }: { children: React.ReactNode }) {
  const bagOpen = useRelay((s) => s.bagOpen);
  const searchOpen = useRelay((s) => s.searchOpen);

  useEffect(() => {
    void useRelay.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!bagOpen && !searchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [bagOpen, searchOpen]);

  return (
    <div className="min-h-dvh bg-ink text-bone">
      <div inert={bagOpen || searchOpen ? true : undefined}>
        <header className="sticky top-0 z-30">
          <AnnounceBar />
          <StoreNav />
        </header>
        {children}
        <StoreFooter />
      </div>
      <CartDrawer />
      <SearchOverlay />
    </div>
  );
}
