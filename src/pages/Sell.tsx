import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { LuFileText, LuUpload, LuX } from "react-icons/lu";
import {
  APPLICATION_MAX_FILES,
  getMerchantApplication,
  submitMerchantApplication,
  validateApplicationFile,
  withdrawMerchantApplication,
} from "../data/account";
import { getCities, getRegions } from "../data/catalog";
import { useAuth } from "../context/auth";
import { useAsync } from "../hooks/useAsync";
import { errorMessage } from "../lib/errors";
import { formatDate } from "../lib/format";
import type { MerchantApplication } from "../lib/types";
import { Guilloche } from "../components/Guilloche";
import { Seo } from "../components/Seo";
import { ErrorState, PageLoader } from "../components/States";

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  pending: { title: "Application received", body: "The GUGU team is reviewing your details. We'll contact you by phone or email." },
  approved: { title: "You're approved", body: "Sign in to the GUGU merchant dashboard with this account to set up your store." },
  withdrawn: { title: "Application cancelled", body: "You cancelled this application. You can send a new one whenever you're ready." },
  rejected: {
    title: "Application not approved",
    body: "Your application wasn't approved this time. You can fix what's below and apply again, or contact us if you'd like to know more.",
  },
};

function ApplicationStatus({
  app,
  onReapply,
  onWithdraw,
  withdrawing = false,
}: {
  app: MerchantApplication;
  onReapply?: () => void;
  onWithdraw?: () => void;
  withdrawing?: boolean;
}) {
  const copy = STATUS_COPY[app.status] ?? STATUS_COPY.pending;
  const [confirming, setConfirming] = useState(false);
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
        {onReapply || onWithdraw ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {onReapply && (
              <button type="button" className="btn btn-primary" onClick={onReapply}>
                Apply again
              </button>
            )}
            {onWithdraw &&
              (confirming ? (
                <div role="group" aria-label="Confirm cancellation" className="flex flex-wrap items-center gap-2 rounded-md bg-serial-soft p-2">
                  <span className="px-1 text-sm font-semibold text-serial">Cancel this application? You can apply again later.</span>
                  <button type="button" className="btn btn-sm bg-serial text-white hover:bg-serial/90" onClick={onWithdraw} disabled={withdrawing}>
                    {withdrawing ? "Cancelling…" : "Yes, cancel it"}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)} disabled={withdrawing}>
                    Keep application
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
                  Cancel application
                </button>
              ))}
            <Link to="/contact" className="link py-1.5 text-sm">
              Contact GUGU
            </Link>
          </div>
        ) : (
          <Link to="/contact" className="link mt-3 inline-block py-1.5 text-sm">
            Contact GUGU
          </Link>
        )}
      </div>
    </div>
  );
}

function ApplicationForm({
  onSubmitted,
  onCancel,
  previous,
}: {
  onSubmitted: () => void;
  /** Back to the status panel. Absent for a first application: there is nothing to go back to. */
  onCancel?: () => void;
  /** A rejected or withdrawn application being submitted again: its values prefill the form. */
  previous?: MerchantApplication;
}) {
  const { user } = useAuth();
  const regions = useAsync(getRegions, []);
  // A rejected getRegions() is its own state, not an empty catalogue — the same
  // distinction the towns draw below. Left as a plain `?? []` the select
  // rendered enabled with only its placeholder, and submit blamed `regionId`, a
  // field holding nothing the applicant could choose. There was no retry and no
  // second-submit escape either, so only a page reload cleared it.
  const regionsFailed = Boolean(regions.error);
  const regionOptions = regions.loading || regionsFailed ? [] : regions.data ?? [];
  // No region list yet, for a reason no field can fix. Blocks the submit on its
  // own so validation never has to invent a field error for it.
  const regionsPending = regions.loading;
  // Controlled, not defaultValue: the towns are fetched after the region is
  // known, so at mount the previous town is not yet an option and the browser
  // would silently drop it — leaving a prefilled form that fails validation.
  const [regionId, setRegionId] = useState(previous?.regionId ?? "");
  const [cityId, setCityId] = useState(previous?.cityId ?? "");
  // The picks, narrowed to what is actually on the list. A stored id the
  // catalogue no longer has cannot be shown by a <select>, which falls back to
  // "" — so reading the raw state anywhere else let the form validate a region
  // the applicant could not see, and enabled a town select with no options that
  // then blamed the wrong field. Everything below reads these instead, so the
  // form and the screen cannot disagree.
  const region = regionOptions.some((r) => r.id === regionId) ? regionId : "";
  const cities = useAsync(async () => (region ? getCities(region) : []), [region]);
  // A rejected fetch is its own state, not an empty list: with `cities.data`
  // undefined and `loading` false the town select used to render enabled with
  // nothing in it, and submit then blamed `cityId` — a field the applicant had
  // no way to fill. It now says what happened and offers a retry.
  const citiesFailed = Boolean(region) && Boolean(cities.error);
  // `cities.data` is the previous region's list while the next one loads.
  const cityOptions = cities.loading || citiesFailed ? [] : cities.data ?? [];
  const city = cityOptions.some((c) => c.id === cityId) ? cityId : "";
  // No town list yet, for a reason no field can fix. Blocks the submit on its
  // own so validation never has to invent a field error for it.
  const townsPending = Boolean(region) && cities.loading;
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  /** Why the last chosen file was refused. See addFiles. */
  const [fileProblem, setFileProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    // Kept apart from the validated errors: "notes.txt: use a JPG, PNG, WebP or
    // PDF file." is a reason validate() cannot re-derive from the form, and the
    // clearing pass below re-reads every message from validate(). Merged at
    // render, so the applicant sees why their file was refused rather than a
    // generic "attach a document" immediately after attaching one.
    setFileProblem(problems.join(" "));
    if (fileInput.current) fileInput.current.value = "";
  }

  /**
   * The one validation pass. Both submit() and the as-you-fix clearing below
   * call it, so a message on screen cannot disagree with what submit decides —
   * and `region`/`city` here are the same derived values the payload sends, in
   * the same render, so an unlisted id can never reach Firestore.
   */
  function validate(fd: FormData): Record<string, string> {
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!v("businessName")) errs.businessName = "Enter your business name.";
    if (v("phone").replace(/\D/g, "").length < 9) errs.phone = "Enter a phone number we can call.";
    if (!/^\S+@\S+\.\S+$/.test(v("email"))) errs.email = "Enter a valid email address.";
    // Same three-way split for both selects: still loading, failed, or simply
    // not chosen. Only the last is the applicant's to fix, so only the last
    // names the field. A failed list renders its own message and retry beside
    // the control, so adding one here would blame a disabled select twice.
    if (regionsPending) errs.regionId = "The regions are still loading. Try again in a moment.";
    else if (!region && !regionsFailed) errs.regionId = "Choose your region.";
    // Without a region the town select is disabled and says why, so a town
    // error here would point at a control that cannot be used until the field
    // above is settled — and when the regions failed, that is not a block the
    // town field has any part in.
    if (!regionsFailed && !regionsPending) {
      if (townsPending) errs.cityId = "The towns are still loading. Try again in a moment.";
      else if (!city && !citiesFailed) errs.cityId = "Choose your town or city.";
    }
    if (v("description").length < 20) errs.description = "Tell us what you sell in at least 20 characters.";
    if (!files.length) errs.documents = "Attach at least one document, such as your business registration or Ghana Card.";
    if (!fd.get("consent")) errs.consent = "Confirm the details are correct.";
    return errs;
  }

  /**
   * Keeps the shown errors in step with validate(), so a message cannot outlive
   * the problem it describes. A field can stay invalid while the *reason*
   * changes under it — submit during the town fetch says the towns are still
   * loading, and once they land with nothing chosen the honest message is
   * "Choose your town or city." — so this re-reads the current reason rather
   * than keeping the string captured at submit. It still only narrows: a field
   * with no current error is dropped, and one that never had an error is not
   * added while the applicant is still typing.
   */
  function clearFixedErrors() {
    const form = formRef.current;
    if (!form || !Object.keys(errors).length) return;
    const still = validate(new FormData(form));
    setErrors((prev) => {
      const next: Record<string, string> = {};
      for (const k of Object.keys(prev)) if (still[k]) next[k] = still[k];
      const same =
        Object.keys(next).length === Object.keys(prev).length && Object.keys(next).every((k) => next[k] === prev[k]);
      return same ? prev : next;
    });
  }

  // The towns arriving is not a change event — it re-renders the select from an
  // async result — so the submit-time errors have to be re-examined here too.
  // A no-op unless something actually became valid, so it cannot loop.
  useEffect(clearFixedErrors);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || inFlight.current) return;
    // The refusal belongs to the choosing, not to this attempt.
    setFileProblem("");
    // One read of the form, validated and sent — the payload cannot describe a
    // different form state than the one that was just checked.
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const errs = validate(fd);
    setErrors(errs);
    // A failed list names no field, so it has to block here on its own —
    // otherwise an application with no region could pass validation clean.
    if (Object.keys(errs).length || regionsFailed || citiesFailed) {
      // With a list missing its select is disabled, so fall back to the retry
      // that can actually undo the block — the region's first, since a missing
      // region is what leaves the town field unusable.
      const target = Object.keys(errs)[0] ?? (regionsFailed ? "regionId-retry" : "cityId-retry");
      document.getElementById(target)?.focus();
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      await submitMerchantApplication(
        user.uid,
        { businessName: v("businessName"), phone: v("phone"), email: v("email"), regionId: region, cityId: city, description: v("description") },
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

  // A refused file explains itself better than validate() can ("notes.txt: use a
  // JPG, PNG, WebP or PDF file." versus "Attach at least one document"), so it
  // wins for that field while it stands.
  const messageFor = (id: string) => (id === "documents" && fileProblem ? fileProblem : errors[id]);
  const a11y = (id: string) => ({
    id,
    name: id,
    "aria-invalid": messageFor(id) ? true : undefined,
    "aria-describedby": messageFor(id) ? `${id}-error` : undefined,
    disabled: busy,
  });
  const err = (id: string) => {
    const message = messageFor(id);
    return message ? (
      <p id={`${id}-error`} className="field-error">
        {message}
      </p>
    ) : null;
  };

  return (
    <form ref={formRef} onSubmit={submit} onChange={clearFixedErrors} noValidate className="panel space-y-5 p-5 sm:p-8">
      <h2 className="type-title text-xl text-ink-950">Your business</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="businessName" className="field-label">Business name</label>
          <input className="input" autoComplete="organization" defaultValue={previous?.businessName ?? ""} {...a11y("businessName")} />
          {err("businessName")}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">Phone</label>
          <input className="input" type="tel" autoComplete="tel" defaultValue={previous?.phone ?? ""} {...a11y("phone")} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input className="input" type="email" autoComplete="email" defaultValue={previous?.email ?? user?.email ?? ""} {...a11y("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="regionId" className="field-label">Region</label>
          <select
            className="input"
            value={region}
            onChange={(e) => {
              setRegionId(e.target.value);
              setCityId("");
            }}
            {...a11y("regionId")}
            aria-invalid={errors.regionId || regionsFailed ? true : undefined}
            aria-describedby={errors.regionId || regionsFailed ? "regionId-error" : undefined}
            disabled={busy || regionsPending || regionsFailed}
          >
            <option value="">
              {regionsFailed ? "Regions couldn't be loaded" : regionsPending ? "Loading regions…" : "Choose a region"}
            </option>
            {regionOptions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {regionsFailed ? (
            <p id="regionId-error" role="alert" className="field-error">
              We couldn't load the regions.{" "}
              <button type="button" id="regionId-retry" className="link font-semibold" onClick={regions.reload}>
                Try again
              </button>
            </p>
          ) : (
            err("regionId")
          )}
        </div>
        <div>
          <label htmlFor="cityId" className="field-label">Town or city</label>
          <select
            className="input"
            value={city}
            onChange={(e) => setCityId(e.target.value)}
            {...a11y("cityId")}
            aria-invalid={errors.cityId || citiesFailed ? true : undefined}
            aria-describedby={errors.cityId || citiesFailed ? "cityId-error" : undefined}
            disabled={busy || !region || townsPending || citiesFailed}
          >
            <option value="">
              {!region
                ? "Choose a region first"
                : citiesFailed
                  ? "Towns couldn't be loaded"
                  : townsPending
                    ? "Loading towns…"
                    : "Choose a town"}
            </option>
            {cityOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {citiesFailed ? (
            <p id="cityId-error" role="alert" className="field-error">
              We couldn't load the towns for this region.{" "}
              <button type="button" id="cityId-retry" className="link font-semibold" onClick={cities.reload}>
                Try again
              </button>
            </p>
          ) : (
            err("cityId")
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="field-label">What do you sell?</label>
          <textarea className="input min-h-[120px]" maxLength={2000} defaultValue={previous?.description ?? ""} {...a11y("description")} />
          {err("description")}
        </div>
      </div>

      <fieldset>
        <legend className="field-label">Documents</legend>
        <p className="field-hint mt-0">Business registration, Ghana Card or similar. JPG, PNG, WebP or PDF, up to 10 MB each, {APPLICATION_MAX_FILES} files max.</p>
        {previous && (
          // A re-application replaces the whole document, the old documentUrls
          // with it. Every other field prefills, so an empty Documents box reads
          // as a bug until it is said out loud.
          <p className="field-hint mt-1 font-semibold text-ink-900">
            The files from your last application aren't carried over. Please attach them again.
          </p>
        )}
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
              accept="image/jpeg,image/png,image/webp,application/pdf"
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

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={busy}>
          {busy ? "Sending application…" : "Send application"}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Back to your application
          </button>
        )}
      </div>
    </form>
  );
}

export default function Sell() {
  const { user, initializing } = useAuth();
  const app = useAsync(async () => (user ? getMerchantApplication(user.uid) : null), [user?.uid]);
  const [reapplying, setReapplying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  // `withdrawing` is render state: activations dispatched in one React batch all
  // read the same pre-update closure and every one of them writes. A ref updates
  // synchronously, so only the first gets through — the same guard
  // ApplicationForm.submit uses. The `disabled` attribute is presentation, not
  // the guard.
  const withdrawInFlight = useRef(false);
  // firestore.rules allows a replacement only from these two, so they are the
  // only statuses offered the form.
  const canReapply = app.data?.status === "rejected" || app.data?.status === "withdrawn";
  const canWithdraw = app.data?.status === "pending";

  // Irreversible for this submission — the applicant can send a new one, but
  // this one leaves the review queue — so ApplicationStatus asks first, with
  // the same inline two-step confirm a customer gets for cancelling an order.
  async function withdraw() {
    if (!user || withdrawInFlight.current) return;
    withdrawInFlight.current = true;
    setWithdrawing(true);
    try {
      await withdrawMerchantApplication(user.uid);
      toast.success("Application cancelled");
      app.reload();
    } catch (err) {
      toast.error(errorMessage(err, "We couldn't cancel your application. Try again."));
    } finally {
      withdrawInFlight.current = false;
      setWithdrawing(false);
    }
  }

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
          ) : app.data && !(canReapply && reapplying) ? (
            <ApplicationStatus
              app={app.data}
              onReapply={canReapply ? () => setReapplying(true) : undefined}
              onWithdraw={canWithdraw ? withdraw : undefined}
              withdrawing={withdrawing}
            />
          ) : (
            <>
              {app.data?.status === "rejected" && app.data?.note && (
                // The re-submission replaces the document, so this reason is
                // about to disappear — it has to be readable while they edit.
                <div role="status" className="panel mb-4 p-4 text-sm">
                  <p className="font-semibold text-ink-950">Why it wasn't approved</p>
                  <p className="mt-1 text-text-muted">{app.data.note}</p>
                </div>
              )}
              <ApplicationForm
                previous={canReapply ? app.data ?? undefined : undefined}
                onCancel={app.data ? () => setReapplying(false) : undefined}
                onSubmitted={() => {
                  setReapplying(false);
                  app.reload();
                }}
              />
            </>
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
