import React, { useEffect, useRef, useState } from "react";
import TravelMaps from "../components/TravelMaps";
import { supabase } from "../supabaseClient";
import { createTraveler, fetchTravelers } from "../travelApi";
import TravelerEditor from "../components/TravelerEditor";

function TravelerProfiles({ ownerId }) {
  const [people, setPeople] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("#B58B50");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);
  const [saveUncertain, setSaveUncertain] = useState(false);
  const alive = useRef(false);
  const submitting = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    fetchTravelers(ownerId, AbortSignal.any([
      controller.signal, AbortSignal.timeout(15_000),
    ]))
      .then((rows) => {
        if (!active) return;
        setPeople(rows);
        setSelectedId((id) => rows.some((person) => person.id === id)
          ? id : rows[0]?.id ?? "");
        setSaveUncertain(false);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [ownerId, reload]);

  async function addTraveler(event) {
    event.preventDefault();
    if (!name.trim() || submitting.current || loading || saveUncertain) return;
    submitting.current = true;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const person = await createTraveler(
        ownerId, name, color, AbortSignal.timeout(15_000),
      );
      if (!alive.current) return;
      setPeople((previous) => [...previous, person]);
      setSelectedId(person.id);
      setName("");
      setNotice(`${person.name} added.`);
    } catch (err) {
      if (alive.current) {
        setError(err.message);
        setSaveUncertain(true);
      }
    } finally {
      submitting.current = false;
      if (alive.current) setSaving(false);
    }
  }

  function handleTravelerUpdated(updated) {
    setPeople((previous) =>
      previous.map((person) =>
        person.id === updated.id ? updated : person
      )
    );
    setNotice(`${updated.name} updated.`);
  }

  function handleTravelerDeleted(personId) {
    setPeople((previous) =>
      previous.filter((person) => person.id !== personId)
    );
    setSelectedId("");
    setNotice("Traveler and their saved visits removed.");
  }

  const selected = people.find((person) => person.id === selectedId);

  return (
    <>
      {loading && <p role="status">Loading travelers…</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" disabled={loading || saving}
            onClick={() => setReload((value) => value + 1)}>
            Reload travelers
          </button>
        </div>
      )}
      {!loading && (
        <div className="travel-profile-layout">
          <div>
            <h2>Who’s exploring?</h2>
            {people.length ? (
              <div className="traveler-picker" role="group" aria-label="Choose traveler">
                {people.map((person) => (
                  <button key={person.id} type="button"
                    aria-pressed={selectedId === person.id}
                    onClick={() => setSelectedId(person.id)}>
                    <span className="traveler-swatch"
                      style={{ backgroundColor: person.color }} aria-hidden="true" />
                    {person.name}
                  </button>
                ))}
              </div>
            ) : (
              <p>Add your first traveler to get started.</p>
            )}
            {selected && <p className="muted">Selected traveler: {selected.name}</p>}
            {selected && (
              <TravelerEditor
                key={`${selected.id}:${selected.name}:${selected.color}`}
                ownerId={ownerId}
                person={selected}
                onUpdated={handleTravelerUpdated}
                onDeleted={handleTravelerDeleted}
                onReload={() => setReload((value) => value + 1)}
              />
            )}
          </div>
          <details className="travel-add-person"><summary>Add a traveler</summary>
          <form className="traveler-form" onSubmit={addTraveler}>
            <h2>Add a traveler</h2>
            <label htmlFor="traveler-name">Name</label>
            <input id="traveler-name" value={name} maxLength={40} required
              disabled={saving} autoComplete="off"
              onChange={(event) => setName(event.target.value)} />
            <label htmlFor="traveler-color">Map color</label>
            <input id="traveler-color" type="color" value={color} disabled={saving}
              onChange={(event) => setColor(event.target.value)} />
            <button type="submit"
              disabled={saving || !name.trim() || saveUncertain || Boolean(error)}>
              {saving ? "Saving…" : "Add traveler"}
            </button>
          </form></details>
        </div>
      )}
      <p className="muted" role="status">{notice}</p>
      {!loading && selected && <TravelMaps key={selected.id} ownerId={ownerId} person={selected} />}
    </>
  );
}

export default function TravelPage() {
  const [account, setAccount] = useState({ checking: true, userId: null });

  useEffect(() => {
    if (!supabase) {
      setAccount({ checking: false, userId: null });
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setAccount({
        checking: false, userId: session?.user.id ?? null,
      }),
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="travel-page">
      <section className="card" aria-labelledby="travel-title">
        <h1 id="travel-title">Places we’ve been</h1>
        <p className="muted">Every journey adds a little color.</p>
        {!supabase ? <p>Account connection is not configured.</p>
          : account.checking ? <p role="status">Checking sign-in…</p>
          : !account.userId ? <p>Sign in through Display settings to view your travelers.</p>
          : <TravelerProfiles key={account.userId} ownerId={account.userId} />}
      </section>
    </main>
  );
}


