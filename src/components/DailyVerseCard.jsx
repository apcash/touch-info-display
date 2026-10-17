import React from 'react';

export default function DailyVerseCard({ verse }) {
  return (
    <section className="card daily-verse-card" aria-labelledby="daily-verse-title">
      <h2 id="daily-verse-title">Daily Verse</h2>
      <blockquote>
        <p>{verse.text}</p>
        <p className="verse-reference">{verse.reference}</p>
      </blockquote>
    </section>
  );
}