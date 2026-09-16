import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { getProfile, updateProfile } from "../../data/account";
import { useAuth } from "../../context/auth";
import { useAsync } from "../../hooks/useAsync";
import { errorMessage } from "../../lib/errors";
import type { ShippingAddress, UserProfile } from "../../lib/types";
import { AddressFields, validateAddress, type AddressErrors } from "../../components/AddressFields";
import { Seo } from "../../components/Seo";
import { ErrorState } from "../../components/States";

export const profileToAddress = (p: UserProfile | null | undefined, fallbackName = ""): ShippingAddress => ({
  fullName: p?.displayName ?? fallbackName,
  line1: p?.shippingLine1 ?? "",
  line2: p?.shippingLine2 ?? "",
  city: p?.shippingCity ?? "",
  region: p?.shippingRegion ?? "",
  postalCode: p?.shippingPostalCode ?? "",
  phone: p?.shippingPhone ?? p?.phone ?? "",
});

function ProfileForm({ profile }: { profile: UserProfile | null }) {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? user?.displayName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [address, setAddress] = useState<ShippingAddress>(profileToAddress(profile, user?.displayName ?? ""));
  const [errors, setErrors] = useState<AddressErrors & { displayName?: string }>({});
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const hasAddress = Boolean(address.line1 || address.city || address.region);
    const errs: AddressErrors & { displayName?: string } = hasAddress ? validateAddress({ ...address, fullName: address.fullName || displayName }) : {};
    if (!displayName.trim()) errs.displayName = "Enter your name.";
    delete errs.fullName;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await updateProfile(user.uid, {
        displayName,
        phone,
        shippingLine1: address.line1,
        shippingLine2: address.line2,
        shippingCity: address.city,
        shippingRegion: address.region,
        shippingPostalCode: address.postalCode,
        shippingPhone: address.phone,
      });
      await refreshUser();
      toast.success("Profile saved");
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't save your profile. Try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} noValidate className="space-y-8">
      <section aria-labelledby="details-title" className="panel p-5 sm:p-6">
        <h2 id="details-title" className="text-lg font-bold text-ink-950">
          Your details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="displayName" className="field-label">
              Name
            </label>
            <input
              id="displayName"
              className="input"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              aria-invalid={errors.displayName ? true : undefined}
              aria-describedby={errors.displayName ? "displayName-error" : undefined}
            />
            {errors.displayName && <p id="displayName-error" className="field-error">{errors.displayName}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="field-label">
              Phone
            </label>
            <input id="phone" className="input" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <p className="field-label">Email</p>
            <p className="text-text-muted">{user?.email ?? "Not set"}</p>
          </div>
        </div>
      </section>
      <section aria-labelledby="address-title" className="panel p-5 sm:p-6">
        <h2 id="address-title" className="text-lg font-bold text-ink-950">
          Delivery address
        </h2>
        <p className="mt-1 text-sm text-text-muted">Used to fill in checkout. You can change it for each order.</p>
        <div className="mt-4">
          <AddressFields idPrefix="profile" value={address} onChange={setAddress} errors={errors} disabled={busy} />
        </div>
      </section>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const profile = useAsync(() => getProfile(user!.uid), [user?.uid]);
  return (
    <>
      <Seo title="Your account" noindex />
      {profile.error ? (
        <ErrorState error={profile.error} onRetry={profile.reload} title="Your profile didn't load" />
      ) : profile.loading ? (
        <div className="space-y-4" aria-hidden>
          <div className="skeleton h-40" />
          <div className="skeleton h-72" />
        </div>
      ) : (
        <ProfileForm profile={profile.data ?? null} />
      )}
    </>
  );
}
