import type { ReactNode } from "react";
import { Breadcrumbs } from "../../components/Common";
import { Seo } from "../../components/Seo";

export function InfoPage({ title, description, updated, children }: { title: string; description: string; updated?: string; children: ReactNode }) {
  return (
    <div className="shell py-6 sm:py-10">
      <Seo title={title} description={description} />
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: title }]} />
      <article className="mt-4 max-w-[68ch]">
        <h1 className="type-display text-4xl text-ink-950 sm:text-5xl">{title}</h1>
        {updated && <p className="mt-2 text-sm text-text-muted">Last updated {updated}</p>}
        <div className="mt-6 space-y-4 leading-relaxed text-text [&_a]:font-medium [&_a]:text-ink-700 [&_a]:underline [&_h2]:type-title [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:text-ink-950 [&_li]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>
      </article>
    </div>
  );
}
