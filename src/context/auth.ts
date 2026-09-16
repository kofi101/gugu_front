import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

export interface AuthState {
  /** Live Firebase user from onAuthStateChanged. Never persisted by the app. */
  user: User | null;
  /** True until the first onAuthStateChanged callback. */
  initializing: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  resendVerification(): Promise<void>;
  refreshUser(): Promise<void>;
  signOut(): Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
