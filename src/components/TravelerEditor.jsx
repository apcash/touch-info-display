import React, { useEffect, useRef, useState } from "react";
import { updateTraveler, deleteTraveler } from "../travelApi";

export default function TravelerEditor({
  ownerId,
  person,
  onUpdated,
  onDeleted,
  onReload,
}) {
  const [name, setName] = useState(person.name);
  const [color, setColor] = useState(person.color);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = useRef(false);
  const submitting = useRef(false);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  async function saveChanges(event) {
    event.preventDefault();

    if (!name.trim() || submitting.current || error) return;

    submitting.current = true;
    setBusy(true);

    try {
      const updated = await updateTraveler(
        ownerId,
        person.id,
        name,
        color,
        AbortSignal.timeout(15_000),
      );

      if (active.current) onUpdated(updated);
    } catch (err) {
      if (active.current) setError(err.message);
    } finally {
      submitting.current = false;
      if (active.current) setBusy(false);
    }
  }

  async function removeTraveler() {
    if (!confirmDelete || submitting.current || error) return;

    submitting.current = true;
    setBusy(true);

    try {
      await deleteTraveler(
        ownerId,
        person.id,
        AbortSignal.timeout(15_000),
      );

      if (active.current) onDeleted(person.id);
    } catch (err) {
      if (active.current) setError(err.message);
    } finally {
      submitting.current = false;
      if (active.current) setBusy(false);
    }
  }

  return (
    <details className="travel-edit-person">
      <summary>Edit {person.name}</summary>

      <form className="traveler-form" onSubmit={saveChanges}>
        <label htmlFor="edit-traveler-name">Name</label>
        <input
          id="edit-traveler-name"
          value={name}
          maxLength={40}
          required
          disabled={busy || Boolean(error)}
          onChange={(event) => setName(event.target.value)}
        />

        <label htmlFor="edit-traveler-color">Map color</label>
        <input
          id="edit-traveler-color"
          type="color"
          value={color}
          disabled={busy || Boolean(error)}
          onChange={(event) => setColor(event.target.value)}
        />

        <button
          type="submit"
          disabled={
            busy || !name.trim() || Boolean(error) || confirmDelete
          }
        >
          {busy ? "Working…" : "Save changes"}
        </button>
      </form>

      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" disabled={busy} onClick={onReload}>
            Reload travelers
          </button>
        </div>
      )}

      {!confirmDelete ? (
        <button
          type="button"
          disabled={busy || Boolean(error)}
          onClick={() => setConfirmDelete(true)}
        >
          Remove traveler
        </button>
      ) : (
        <div>
          <p>
            Remove {person.name} and all their saved visits?
            This cannot be undone.
          </p>
          <button
            type="button"
            disabled={busy || Boolean(error)}
            onClick={removeTraveler}
          >
            Yes, remove traveler
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </details>
  );
}