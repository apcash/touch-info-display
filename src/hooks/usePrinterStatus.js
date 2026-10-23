import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchPrinterStatus } from "../printerApi";

export default function usePrinterStatus() {
  const [userId, setUserId] = useState(null);
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [result, setResult] = useState({
    ownerId: null,
    printer: null,
    loading: true,
    error: "",
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!supabase) {
      setCheckingAccount(false);
      return;
    }

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user.id ?? null);
        setCheckingAccount(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    let refreshTimer;

    setResult({
      ownerId: userId,
      printer: null,
      loading: true,
      error: "",
    });

    async function refresh() {
      try {
        const printer = await fetchPrinterStatus(userId);

        if (active) {
          setResult({
            ownerId: userId,
            printer,
            loading: false,
            error: "",
          });
        }
      } catch (error) {
        if (active) {
          setResult((previous) => ({
            ...previous,
            loading: false,
            error: error.message,
          }));
        }
      } finally {
        if (active) {
          refreshTimer = setTimeout(refresh, 15_000);
        }
      }
    }

    refresh();

    return () => {
      active = false;
      clearTimeout(refreshTimer);
    };
  }, [userId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(timer);
  }, []);

  const belongsToUser =
    Boolean(userId) && result.ownerId === userId;

  const printer = belongsToUser ? result.printer : null;
  const reportedAt = Date.parse(printer?.reported_at ?? "");

  const stale =
    Boolean(printer) &&
    (!Number.isFinite(reportedAt) || now - reportedAt > 90_000);

  return {
    configured: Boolean(supabase),
    signedIn: Boolean(userId),
    loading:
      checkingAccount ||
      (Boolean(userId) && (!belongsToUser || result.loading)),
    printer,
    stale,
    error: belongsToUser ? result.error : "",
  };
}