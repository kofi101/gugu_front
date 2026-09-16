import { useParams } from "react-router";
import { getCategory, getSubCategories } from "../data/catalog";
import { useAsync } from "../hooks/useAsync";
import { Breadcrumbs } from "../components/Common";
import { ProductListing, useListingParams } from "../components/Listing";
import { Seo } from "../components/Seo";
import { ErrorState, PageLoader } from "../components/States";
import { NotFoundContent } from "./NotFound";

export default function Category() {
  const { categoryId = "" } = useParams();
  const { sub } = useListingParams();
  const data = useAsync(async () => {
    const [category, subcategories] = await Promise.all([getCategory(categoryId), getSubCategories(categoryId)]);
    return { category, subcategories };
  }, [categoryId]);

  if (data.loading && !data.data) return <PageLoader />;
  if (data.error) {
    return (
      <div className="shell py-8">
        <ErrorState error={data.error} onRetry={data.reload} />
      </div>
    );
  }
  const category = data.data?.category;
  if (!category) return <NotFoundContent />;
  const subcategories = data.data?.subcategories ?? [];
  const activeSub = subcategories.find((s) => s.id === sub);
  const title = activeSub ? `${activeSub.name} in ${category.name}` : category.name;

  return (
    <div className="shell py-6 sm:py-8">
      <Seo
        title={title}
        description={`Shop ${title.toLowerCase()} from independent stores across Ghana on GUGU. Prices in cedis, pay on delivery.`}
        canonicalPath={`/c/${category.id}${activeSub ? `?sub=${encodeURIComponent(activeSub.id)}` : ""}`}
      />
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: category.name, to: `/c/${category.id}` }, ...(activeSub ? [{ label: activeSub.name }] : [])]} />
      <h1 className="type-display mb-5 mt-3 text-3xl text-ink-950 sm:text-5xl">{activeSub ? activeSub.name : category.name}</h1>
      <ProductListing categoryId={category.id} subcategories={subcategories} heading={category.name} />
    </div>
  );
}
