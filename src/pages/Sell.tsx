import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { LuFileText, LuUpload, LuX } from "react-icons/lu";
import {
  APPLICATION_MAX_FILES,
  getMerchantApplication,
  submitMerchantApplication,
  validateApplicationFile,
} from "../data/account";
import { getCities, getRegions } from "../data/catalog";
import { useAuth } from "../context/auth";
import { useAsync } from "../hooks/useAsync";
import { errorMessage } from "../lib/errors";
import { formatDate } from "../lib/format";
import type { MerchantApplication } from "../lib/types";
import { GHANA_REGIONS } from "../lib/address";
import { Guilloche } from "../components/Guilloche";
import { Seo } from "../components/Seo";
import { ErrorState, PageLoader } from "../components/States";

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  pending: { title: "Application received", body: "The GUGU team is reviewing your details. We'll contact you by phone or email." },
  approved: { title: "You're approved", body: "Sign in to the GUGU merchant dashboard with this account to set up your store." },
  rejected: { title: "Application not approved", body: "Your application wasn't approved this time. Contact us if you'd like to know more." },
};

function ApplicationStatus({ app }: { app: MerchantApplication }) {
  const copy = STATUS_COPY[app.status] ?? STATUS_COPY.pending;
  return (
    <div role="status" className="panel overflow-hidden">
      <div className="thread h-1" aria-hidden />
      <div className="p-6">
        <h2 className="type-title text-2xl text-ink-950">{copy.title}</h2>
        <p className="mt-2 text-text-muted">{copy.body}</p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Business</dt>
            <dd className="font-semibold">{app.businessName}</dd>
          </div>
          {app.createdAt && (
            <div>
              <dt className="text-text-muted">Submitted</dt>
              <dd className="font-semibold">{formatDate(app.createdAt)}</dd>
            </div>
          )}
        </dl>
        {app.note && <p className="mt-4 rounded-md bg-paper p-3 text-sm">{app.note}</p>}
        <Link to="/contact" className="link mt-4 inline-block text-sm">
          Contact GUGU
        </Link>
      </div>
    </div>
  );
}

function ApplicationForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { user } = useAuth();
  const regions = useAsync(getRegions, []);
  const regionOptions = regions.data?.length ? regions.data : GHANA_REGIONS.map((name) => ({ id: name, name }));
  const [regionId, setRegionId] = useState("");
  const cities = useAsync(async () => (regionId && regions.data?.length ? getCities(regionId) : []), [regionId, regions.data?.length]);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    const problems: string[] = [];
    for (const f of Array.from(list)) {
      const err = validateApplicationFile(f);
      if (err) problems.push(err);
      else if (next.length < APPLICATION_MAX_FILES) next.push(f);
      else problems.push(`You can attach up to ${APPLICATION_MAX_FILES} files.`);
    }
    setFiles(next);
    setErrors((e) => ({ ...e, documents: problems.join(" ") }));
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || inFlight.current) return;
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!v("businessName")) errs.businessName = "Enter your business name.";
    if (v("phone").replace(/\D/g, "").length < 9) errs.phone = "Enter a phone number we can call.";
    if (!/^\S+@\S+\.\S+$/.test(v("email"))) errs.email = "Enter a valid email address.";
    if (!regionId) errs.regionId = "Choose your region.";
    if (!v("cityId")) errs.cityId = "Enter your town or city.";
    if (v("description").length < 20) errs.description = "Tell us what you sell in at least 20 characters.";
    if (!files.length) errs.documents = "Attach at least one document, such as your business registration or Ghana Card.";
    if (!fd.get("consent")) errs.consent = "Confirm the details are correct.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      await submitMerchantApplication(
        user.uid,
        { businessName: v("businessName"), phone: v("phone"), email: v("email"), regionId, cityId: v("cityId"), description: v("description") },
        files,
      );
      toast.success("Application sent");
      onSubmitted();
    } catch (err) {
      toast.error(errorMessage(err, "We couldn't send your application. Try again."));
      inFlight.current = false;
      setBusy(false);
    }
  }

  const a11y = (id: string) => ({
    id,
    name: id,
    "aria-invalid": errors[id] ? true : undefined,
    "aria-describedby": errors[id] ? `${id}-error` : undefined,
    disabled: busy,
  });
  const err = (id: string) =>
    errors[id] ? (
      <p id={`${id}-error`} className="field-error">
        {errors[id]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="panel space-y-5 p-5 sm:p-8">
      <h2 className="type-title text-xl text-ink-950">Your business</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="businessName" className="field-label">Business name</label>
          <input className="input" autoComplete="organization" {...a11y("businessName")} />
          {err("businessName")}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">Phone</label>
          <input className="input" type="tel" autoComplete="tel" {...a11y("phone")} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input className="input" type="email" autoComplete="email" defaultValue={user?.email ?? ""} {...a11y("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="regionId" className="field-label">Region</label>
          <select className="input" value={regionId} onChange={(e) => setRegionId(e.target.value)} {...a11y("regionId")}>
            <option value="">Choose a region</option>
            {regionOptions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {err("regionId")}
        </div>
        <div>
          <label htmlFor="cityId" className="field-label">Town or city</label>
          {cities.data && cities.data.length > 0 ? (
            <select className="input" {...a11y("cityId")}>
              <option value="">Choose a town</option>
              {cities.data.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <input className="input" autoComplete="address-level2" {...a11y("cityId")} />
          )}
          {err("cityId")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="field-label">What do you sell?</label>
          <textarea className="input min-h-[120px]" maxLength={2000} {...a11y("description")} />
          {err("description")}
        </div>
      </div>

      <fieldset>
        <legend className="field-label">Documents</legend>
        <p className="field-hint mt-0">Business registration, Ghana Card or similar. Images or PDF, up to 10 MB each, {APPLICATION_MAX_FILES} files max.</p>
        <div className="mt-2">
          <label
            htmlFor="documents"
            className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-paper-line bg-paper px-4 py-4 text-center hover:border-ink-700 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-ink-700"
          >
            <LuUpload aria-hidden className="h-6 w-6 text-ink-700" />
            <span className="font-semibold text-ink-900">Choose files</span>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
              {...a11y("documents")}
            />
          </label>
          {err("documents")}
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-md bg-paper px-3 py-2 text-sm">
                  <LuFileText aria-hidden className="h-4 w-4 shrink-0 text-ink-700" />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="tabular text-text-muted">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button type="button" className="grid h-8 w-8 place-items-center rounded hover:bg-paper-deep" onClick={() => setFiles(files.filter((_, j) => j !== i))} disabled={busy}>
                    <LuX aria-hidden className="h-4 w-4" />
                    <span className="sr-only">Remove {f.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-ink-700" {...a11y("consent")} />
          <span>
            The details are correct, and I agree to the{" "}
            <Link to="/terms" className="link">Terms of use</Link>.
          </span>
        </label>
        {err("consent")}
      </div>

      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={busy}>
        {busy ? "Sending application…" : "Send application"}
      </button>
    </form>
  );
}

export default function Sell() {
  const { user, initializing } = useAuth();
  const app = useAsync(async () => (user ? getMerchantApplication(user.uid) : null), [user?.uid]);

  return (
    <div>
      <Seo
        title="Sell on GUGU"
        description="Apply to sell on GUGU, Ghana's multi-store marketplace. Reach shoppers across Ghana and get paid on delivery or online."
      />
      <section className="underprint-dark on-dark relative overflow-hidden text-white">
        <Guilloche className="absolute -right-24 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 text-ink-400 opacity-60" animate={false} />
        <div className="shell relative py-10 sm:py-16">
          <h1 className="type-display max-w-[16ch] text-4xl sm:text-6xl">Sell on GUGU</h1>
          <p className="mt-4 max-w-xl text-lg text-ink-100">
            List your products next to other independent Ghanaian stores. Apply here, and once approved, manage products and orders from the GUGU merchant dashboard.
          </p>
        </div>
      </section>
      <div className="shell grid gap-8 py-8 lg:grid-cols-[1fr_20rem]">
        <div>
          {initializing || (user && app.loading) ? (
            <PageLoader />
          ) : !user ? (
            <div className="panel p-6">
              <h2 className="type-title text-xl text-ink-950">Start with a GUGU account</h2>
              <p className="mt-2 text-text-muted">Your application is linked to your account, so you can check its status later.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/signup?next=%2Fsell" className="btn btn-primary">Create account</Link>
                <Link to="/signin?next=%2Fsell" className="btn btn-secondary">Sign in</Link>
              </div>
            </div>
          ) : app.error ? (
            <ErrorState error={app.error} onRetry={app.reload} />
          ) : app.data ? (
            <ApplicationStatus app={app.data} />
          ) : (
            <ApplicationForm onSubmitted={app.reload} />
          )}
        </div>
        <aside className="space-y-4 text-sm">
          <h2 className="text-base font-bold text-ink-950">How it works</h2>
          <ol className="space-y-3">
            {[
              "Send your business details and documents.",
              "The GUGU team reviews your application.",
              "Once approved, set up your store and add products in the merchant dashboard.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="type-title tabular grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-900 text-xs text-white">{i + 1}</span>
                <span className="pt-1 text-text">{t}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
