import { getMerchants } from "../data/catalog";
import { useAsync } from "../hooks/useAsync";
import { Breadcrumbs, PageTitle } from "../components/Common";
import { MerchantList } from "../components/MerchantList";
import { Seo } from "../components/Seo";
import { ErrorState } from "../components/States";

export default function Stores() {
  const merchants = useAsync(() => getMerchants(200), []);
  return (
    <div className="shell py-6 sm:py-8">
      <Seo title="All stores" description="Every independent store selling on GUGU, from across Ghana." />
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Stores" }]} />
      <div className="mt-3">
        <PageTitle sub="Independent businesses selling on GUGU.">All stores</PageTitle>
      </div>
      {merchants.error ? (
        <ErrorState error={merchants.error} onRetry={merchants.reload} title="Stores didn't load" />
      ) : merchants.loading ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="skeleton h-20" />
          ))}
        </ul>
      ) : (
        <MerchantList merchants={merchants.data ?? []} />
      )}
    </div>
  );
}
