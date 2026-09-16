import { useId } from "react";
import { LuStar } from "react-icons/lu";

export function Stars({ value, count, size = "sm" }: { value?: number; count?: number; size?: "sm" | "md" }) {
  if (!value || value <= 0) {
    return size === "md" ? <span className="text-sm text-text-muted">No reviews yet</span> : null;
  }
  const rounded = Math.round(value * 10) / 10;
  const icon = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <LuStar
            key={i}
            className={`${icon} ${i <= Math.round(value) ? "fill-thread-500 text-thread-700" : "text-paper-line"}`}
          />
        ))}
      </span>
      <span className={`tabular ${size === "md" ? "text-base font-semibold" : "text-xs font-medium"} text-text`}>
        <span className="sr-only">Rated </span>
        {rounded.toFixed(1)}
        <span className="sr-only"> out of 5</span>
        {count != null && count > 0 && <span className="font-normal text-text-muted"> ({count}<span className="sr-only"> reviews</span>)</span>}
      </span>
    </span>
  );
}

/** Accessible 1–5 rating input built from native radios. */
export function StarInput({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const name = useId();
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <fieldset disabled={disabled}>
      <legend className="field-label">Your rating</legend>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <label key={i} className="cursor-pointer rounded p-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-ink-700">
            <input
              type="radio"
              name={name}
              value={i}
              checked={value === i}
              onChange={() => onChange(i)}
              className="sr-only"
            />
            <LuStar aria-hidden className={`h-8 w-8 ${i <= value ? "fill-thread-500 text-thread-700" : "text-paper-line"}`} />
            <span className="sr-only">
              {i} star{i > 1 ? "s" : ""}, {labels[i - 1]}
            </span>
          </label>
        ))}
        {value > 0 && <span className="ml-2 text-sm text-text-muted">{labels[value - 1]}</span>}
      </div>
    </fieldset>
  );
}
