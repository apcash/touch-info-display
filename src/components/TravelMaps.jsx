import React, { useEffect, useRef, useState } from "react";
import maps from "../data/travelMaps.json";
import { fetchVisits, setVisited } from "../travelApi";

const places = [...maps.countries, ...maps.states];
const keyFor = (place) => place.type + ":" + place.code;
const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function TravelMaps({ ownerId, person }) {
  const [visits, setVisits] = useState(new Set());
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);
  const alive = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetchVisits(ownerId, person.id, AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]))
      .then(rows => {
        if (active) setVisits(new Set(rows.map(row => row.place_type + ":" + row.place_code)));
      })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [ownerId, person.id, reload]);

  async function toggle(place) {
    if (!editing || loading || error || busy.current) return;
    busy.current = true;
    setSaving(true);
    setNotice("");
    const next = !visits.has(keyFor(place));
    try {
      await setVisited(ownerId, person.id, place, next, AbortSignal.timeout(15000));
      if (!alive.current) return;
      setVisits(previous => {
        const updated = new Set(previous);
        if (next) updated.add(keyFor(place));
        else updated.delete(keyFor(place));
        return updated;
      });
      setNotice(place.name + (next ? " added." : " removed."));
    } catch (err) {
      if (alive.current) setError(err.message);
    } finally {
      busy.current = false;
      if (alive.current) setSaving(false);
    }
  }

  const canEdit = editing && !loading && !saving && !error;
  const matches = query.trim() ? places.filter(place =>
    normalize(place.name + " " + place.code).includes(normalize(query.trim()))) : [];
  const visitedPlaces = places.filter(place => visits.has(keyFor(place)));

  function renderMap(items, viewBox, title) {
    return (
      <svg className="travel-map" viewBox={viewBox} aria-label={title}>
        <title>{title}</title>
        {items.map(place => {
          const visited = visits.has(keyFor(place));
          const interaction = {
            role: canEdit ? "button" : undefined,
            tabIndex: canEdit ? 0 : undefined,
            "aria-label": place.name + (visited ? ", visited" : ", not visited"),
            "aria-pressed": canEdit ? visited : undefined,
            onClick: () => toggle(place),
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggle(place);
              }
            },
            className: "travel-region" + (visited ? " is-visited" : ""),
            style: visited ? {fill:person.color} : undefined,
          };
          return place.d && (
            <path key={place.code} d={place.d} {...interaction}>
              <title>{place.name}</title>
            </path>
          );
        })}
        {items.filter(place => place.marker && (editing || visits.has(keyFor(place)))).map(place => (
          <circle key={place.code} cx={place.marker[0]} cy={place.marker[1]} r="4.5"
            className="travel-marker" style={visits.has(keyFor(place)) ? {fill:person.color} : undefined}
            role={canEdit ? "button" : undefined} tabIndex={canEdit ? 0 : undefined}
            aria-label={place.name} aria-pressed={canEdit ? visits.has(keyFor(place)) : undefined}
            onClick={() => toggle(place)}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault(); toggle(place);
              }
            }}>
            <title>{place.name}</title>
          </circle>
        ))}
      </svg>
    );
  }

  return (
    <div className={"travel-maps" + (canEdit ? " is-editing" : "")}>
      <div className="travel-map-toolbar">
        <div>
          <h2>{person.name}’s travels</h2>
          <p className="muted">
            {loading ? "Loading visits…" : error ? "Visits need refreshing" :
              visitedPlaces.filter(p => p.type === "country").length + " countries & territories · " +
              visitedPlaces.filter(p => p.type === "state" && p.code !== "US-DC").length + " / 50 states" +
              (visits.has("state:US-DC") ? " · Washington, DC" : "")}
          </p>
        </div>
        <button type="button" disabled={loading || saving || Boolean(error)}
          aria-pressed={editing} onClick={() => setEditing(value => !value)}>
          {editing ? "Done editing" : "Edit visits"}
        </button>
      </div>
      {error && <div role="alert"><p>{error}</p>
        <button type="button" disabled={loading || saving}
          onClick={() => setReload(value => value + 1)}>Reload visits</button>
      </div>}
      {editing && (
        <div className="travel-search">
          <label htmlFor="travel-search">Find a country, territory, or US state</label>
          <input id="travel-search" type="search" value={query} placeholder="Try Bermuda or California"
            onChange={event => setQuery(event.target.value)} />
          <p className="muted">Tap a place to mark it visited. Tap again to remove it.</p>
          {query.trim() && <div className="travel-search-results">
            {matches.length ? matches.map(place => (
              <button type="button" key={keyFor(place)} disabled={!canEdit}
                aria-pressed={visits.has(keyFor(place))} onClick={() => toggle(place)}>
                {visits.has(keyFor(place)) ? "✓ " : "+ "}{place.name}
                <small>{place.type === "state" ? "US state / district" : "Country / territory"}</small>
              </button>
            )) : <p>No matching places.</p>}
          </div>}
        </div>
      )}
      <p className="travel-save-status" role="status">{saving ? "Saving visit…" : notice}</p>
      <section className="travel-map-panel" aria-labelledby="world-map-heading">
        <h3 id="world-map-heading">Around the world</h3>
        {renderMap(maps.countries, "0 0 1000 500", "World travel map")}
      </section>
      <section className="travel-map-panel" aria-labelledby="us-map-heading">
        <h3 id="us-map-heading">Across the United States</h3>
        {renderMap(maps.states, "0 0 975 610", "United States travel map")}
      </section>
      {visitedPlaces.length > 0 && <details className="travel-visited-list">
        <summary>Visited places ({visitedPlaces.length})</summary>
        <div className="travel-place-tags">{visitedPlaces.map(place =>
          <span key={keyFor(place)}>{place.name}</span>)}</div>
      </details>}
      {visitedPlaces.some(place => place.type === "country" && (!place.d || place.marker)) &&
        <p className="muted">Small places: {visitedPlaces.filter(place =>
          place.type === "country" && (!place.d || place.marker)).map(place => place.name).join(" · ")}</p>}
      <p className="weather-credit">Map data: <a href="https://github.com/topojson/world-atlas">Natural Earth / World Atlas</a>
        {" · "}<a href="https://github.com/topojson/us-atlas">US Census / US Atlas</a>.
        Small places are searchable even when no shape is visible.</p>
    </div>
  );
}

