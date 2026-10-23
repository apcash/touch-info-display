import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AccountSettings() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setChecking(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignIn(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) throw signInError;

      setPassword("");
    } catch (error) {
      setError(error.message || "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    setError("");

    try {
      const { error: signOutError } =
        await supabase.auth.signOut({ scope: "local" });

      if (signOutError) throw signOutError;
    } catch (error) {
      setError(error.message || "Unable to sign out.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="account-settings">
      <h3>Dashboard account</h3>

      {!supabase ? (
        <p>Account connection is not configured.</p>
      ) : checking ? (
        <p>Checking sign-in…</p>
      ) : session ? (
        <>
          <p>Signed in as {session.user.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={busy}
          >
            {busy ? "Signing out…" : "Sign out on this device"}
          </button>
        </>
      ) : (
        <form onSubmit={handleSignIn}>
          <p className="muted">
            Sign in to view your private printer information.
          </p>

          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={busy}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={busy}
            />
          </label>

          <button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}

      {error && <p role="alert">{error}</p>}
    </div>
  );
}