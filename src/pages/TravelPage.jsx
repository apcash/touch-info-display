import React, { useEffect, useRef, useState } from "react";
import TravelMaps from "../components/TravelMaps";
import { supabase } from "../supabaseClient";
import { createTraveler, fetchTravelers } from "../travelApi";
import TravelerEditor from "../components/TravelerEditor";
import TravelerColorPicker from "../components/TravelerColorPicker";

function TravelerProfiles({ ownerId, onEditingChange }) {
  const [mapEditing, setMapEditing] = useState(false);
  const [people, setPeople] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("#91A58B");
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

  function changeEditing(value) {
    setMapEditing(value);
    onEditingChange(value);
  }
  const selected = people.find((person) => person.id === selectedId);

  return (
    <div className="travel-content" style={{"--traveler-color": selected?.color ?? "#829DB5"}}>
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
        <fieldset className="travel-profile-layout" disabled={mapEditing}>
          <div>
            <span className="sr-only">Choose a traveler</span>
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

            <TravelerColorPicker
              value={color}
              onChange={setColor}
              disabled={saving}
            />
            <button type="submit"
              disabled={saving || !name.trim() || saveUncertain || Boolean(error)}>
              {saving ? "Saving…" : "Add traveler"}
            </button>
          </form></details>
        </fieldset>
      )}
      <p className="muted" role="status">{notice}</p>
      {!loading && selected && <TravelMaps key={selected.id} ownerId={ownerId} person={selected} onEditingChange={changeEditing} />}
    </div>
  );
}

export default function TravelPage({ onEditingChange }) {
  const [account, setAccount] = useState({ checking: true, userId: null });

  useEffect(() => {
    if (!supabase) {
      setAccount({ checking: false, userId: null });
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAccount({checking: false, userId: session?.user.id ?? null});
        if (!session) onEditingChange(false);
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="travel-page">
      <section aria-label="Travel tracker">
        {!supabase ? <p>Account connection is not configured.</p>
          : account.checking ? <p role="status">Checking sign-in…</p>
          : !account.userId ? <p>Sign in through Display settings to view your travelers.</p>
          : <TravelerProfiles key={account.userId} ownerId={account.userId} onEditingChange={onEditingChange} />}
      </section>
    </main>
  );
}
