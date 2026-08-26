export function QtyStepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="flex size-11 items-center justify-center rounded-sm shadow-[var(--shadow-border)]"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="min-w-6 text-center tabular-nums text-sm">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="flex size-11 items-center justify-center rounded-sm shadow-[var(--shadow-border)]"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
