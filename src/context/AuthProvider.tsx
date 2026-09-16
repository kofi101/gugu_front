import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { isCode } from "../lib/errors";
import { ensureProfile } from "../data/account";
import { AuthContext, type AuthState } from "./auth";

const continueUrl = () => `${window.location.origin}/signin`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  // Bumped after reload() so consumers see emailVerified changes on the same User object.
  const [version, setVersion] = useState(0);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setInitializing(false);
        if (u) ensureProfile(u).catch((e) => console.warn("[gugu] profile sync failed", e));
      }),
    [],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      initializing,
      async signIn(email, password) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      async signUp(name, email, password) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
        await ensureProfile(cred.user).catch(() => undefined);
        await sendEmailVerification(cred.user, { url: continueUrl() }).catch(() => undefined);
        setVersion((v) => v + 1);
      },
      async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        try {
          await signInWithPopup(auth, provider);
        } catch (err) {
          if (isCode(err, "auth/popup-blocked", "auth/operation-not-supported-in-this-environment")) {
            await signInWithRedirect(auth, provider);
            return;
          }
          if (isCode(err, "auth/popup-closed-by-user", "auth/cancelled-popup-request")) return;
          throw err;
        }
      },
      async sendPasswordReset(email) {
        await sendPasswordResetEmail(auth, email.trim(), { url: continueUrl() });
      },
      async resendVerification() {
        if (auth.currentUser) await sendEmailVerification(auth.currentUser, { url: continueUrl() });
      },
      async refreshUser() {
        if (auth.currentUser) {
          await auth.currentUser.reload();
          // Refresh the ID token so callables see the new email_verified claim.
          await auth.currentUser.getIdToken(true);
          setUser(auth.currentUser);
          setVersion((v) => v + 1);
        }
      },
      async signOut() {
        await fbSignOut(auth);
      },
    }),
    // `version` changes after reload()/profile updates so consumers re-read fields like emailVerified.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, initializing, version],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
