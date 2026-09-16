import { Link } from "react-router";
import { LuChevronRight, LuPackage } from "react-icons/lu";
import { listOrders } from "../../data/account";
import { useAuth } from "../../context/auth";
import { useAsync } from "../../hooks/useAsync";
import { amountDueOnDelivery, formatDate, formatMoney, plural } from "../../lib/format";
import { PaymentBadge, StatusBadge } from "../../components/OrderBits";
import { Seo } from "../../components/Seo";
import { EmptyState, ErrorState } from "../../components/States";

export default function Orders() {
  const { user } = useAuth();
  const orders = useAsync(() => listOrders(user!.uid), [user?.uid]);

  return (
    <section aria-labelledby="orders-title">
      <Seo title="Your orders" noindex />
      <h2 id="orders-title" className="sr-only">
        Orders
      </h2>
      {orders.error ? (
        <ErrorState error={orders.error} onRetry={orders.reload} title="Your orders didn't load" />
      ) : orders.loading ? (
        <div className="space-y-3" aria-hidden>
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
        </div>
      ) : !orders.data?.length ? (
        <EmptyState
          icon={<LuPackage />}
          title="No orders yet"
          action={
            <Link to="/" className="btn btn-primary">
              Start shopping
            </Link>
          }
        >
          When you place an order, you can follow it here.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {orders.data.map((o) => (
            <li key={o.id}>
              <Link to={`/account/orders/${o.id}`} className="panel group flex items-center gap-4 p-4 hover:border-ink-700">
                <div className="flex -space-x-3" aria-hidden>
                  {o.lines.slice(0, 3).map((l, i) =>
                    l.imageUrl ? (
                      <img key={i} src={l.imageUrl} alt="" width={48} height={48} loading="lazy" className="h-12 w-12 rounded-md border-2 border-white bg-paper-deep object-cover" />
                    ) : (
                      <span key={i} className="grid h-12 w-12 place-items-center rounded-md border-2 border-white bg-paper-deep">
                        <LuPackage className="h-5 w-5 text-text-muted" />
                      </span>
                    ),
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tabular font-bold tracking-wide text-serial">{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {formatDate(o.createdAt)} · {plural(o.lines.reduce((n, l) => n + l.quantity, 0), "item")}
                  </p>
                  <PaymentBadge status={o.paymentStatus} />
                </div>
                <div className="text-right">
                  {amountDueOnDelivery(o) == null ? (
                    <p className="type-title tabular">{formatMoney(o.orderTotal)}</p>
                  ) : (
                    <>
                      <p className="tabular text-xs text-text-muted">
                        <s>{formatMoney(o.orderTotal)}</s>
                      </p>
                      <p className="type-title tabular">
                        <span className="sr-only">{o.paymentStatus === "paid" ? "Amount paid on delivery " : "Amount due on delivery "}</span>
                        {formatMoney(amountDueOnDelivery(o) as number)}
                      </p>
                      <p className="text-xs text-text-muted" aria-hidden>
                        {o.paymentStatus === "paid" ? "paid on delivery" : "due on delivery"}
                      </p>
                    </>
                  )}
                  <LuChevronRight aria-hidden className="ml-auto mt-1 h-5 w-5 text-text-muted group-hover:text-ink-700" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
