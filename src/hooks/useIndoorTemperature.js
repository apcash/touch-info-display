import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchIndoorTemperature } from "../nestApi";

export default function useIndoorTemperature() {
  const [userId, setUserId] = useState(null);
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [result, setResult] = useState({
    ownerId: null,
    reading: null,
    loading: false,
    error: "",
  });

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
    if (!userId) {
      setResult({
        ownerId: null,
        reading: null,
        loading: false,
        error: "",
      });
      return;
    }

    let active = true;
    let refreshTimer;

    setResult({
      ownerId: userId,
      reading: null,
      loading: true,
      error: "",
    });

    async function refresh() {
      try {
        const reading = await fetchIndoorTemperature();

        if (active) {
          setResult({
            ownerId: userId,
            reading,
            loading: false,
            error: "",
          });
        }
      } catch {
        if (active) {
          setResult({
            ownerId: userId,
            reading: null,
            loading: false,
            error: "Indoor temperature unavailable.",
          });
        }
      } finally {
        if (active) {
          refreshTimer = setTimeout(refresh, 5 * 60_000);
        }
      }
    }

    refresh();

    return () => {
      active = false;
      clearTimeout(refreshTimer);
    };
  }, [userId]);

  const belongsToUser =
    Boolean(userId) && result.ownerId === userId;

  return {
    configured: Boolean(supabase),
    signedIn: Boolean(userId),
    loading:
      checkingAccount ||
      (Boolean(userId) && (!belongsToUser || result.loading)),
    reading: belongsToUser ? result.reading : null,
    error: belongsToUser ? result.error : "",
  };
}