import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "../lib/format";

const STATUS_STYLE: Record<string, string> = {
  awaiting_payment: "bg-thread-300/40 text-thread-700 ring-thread-500/50",
  placed: "bg-ink-100 text-ink-900 ring-ink-300",
  processing: "bg-ink-100 text-ink-900 ring-ink-300",
  shipped: "bg-ink-700 text-white ring-ink-700",
  delivered: "bg-leaf-soft text-leaf ring-leaf/40",
  cancelled: "bg-paper-deep text-text-muted ring-paper-line",
  payment_failed: "bg-serial-soft text-serial ring-serial/40",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${STATUS_STYLE[status] ?? STATUS_STYLE.placed}`}>
      {ORDER_STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const style =
    status === "paid"
      ? "text-leaf"
      : status === "failed"
        ? "text-serial"
        : status === "pending"
          ? "text-thread-700"
          : "text-text-muted";
  return <span className={`text-sm font-semibold ${style}`}>{PAYMENT_STATUS_LABEL[status] ?? status}</span>;
}
