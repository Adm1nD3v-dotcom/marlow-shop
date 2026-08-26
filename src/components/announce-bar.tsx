import { Link } from "@tanstack/react-router";

export function AnnounceBar() {
  return (
    <div className="border-b border-line bg-elevated">
      <p className="mx-auto flex h-10 max-w-6xl items-center justify-center px-4 text-center text-xs text-muted sm:text-sm">
        Open · Evening kit $62 · Free tracked US shipping ·{" "}
        <Link to="/policies" className="ml-1 text-bone underline-offset-4 hover:underline">
          14-day returns
        </Link>
      </p>
    </div>
  );
}
