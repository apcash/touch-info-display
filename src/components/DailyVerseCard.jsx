import React from 'react';

export default function DailyVerseCard({ verse, loading, error }) {
  return (
    <section className="card daily-verse-card" aria-labelledby="daily-verse-title">
      <h2 id="daily-verse-title">Daily Verse</h2>
      {loading && (
        <p className="muted" role="status">Loading today’s verse…</p>
      )}

      {!loading && error && (
        <p className="muted" role="status">
          Unable to load the ESV verse. Showing a saved verse instead.
        </p>
      )}
      <blockquote>
        <p>{verse.text}</p>
        <p className="verse-reference">
          {verse.reference}
          {verse.translation === "ESV" && (
            <>
              {" · "}
              <a href="https://www.esv.org/" target="_blank" rel="noopener noreferrer">
                ESV
              </a>
            </>
          )}
        </p>
      </blockquote>
    </section>
  );
}