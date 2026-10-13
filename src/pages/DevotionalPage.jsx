import React from "react";

function DevotionalPage() {
  return (
    <main className="devotional-page">
      <header className="devotional-heading">
        <p className="eyebrow">A moment to pause</p>
        <h1>Daily Devotional</h1>
        <p>Make a little room for reflection.</p>
      </header>

      <section className="card">
        <h2>Today’s Scripture</h2>
        <p>Our daily passage will appear here.</p>
      </section>

      <section className="card">
        <h2>Reflection</h2>
        <p>Our devotional reading will appear here.</p>
      </section>

      <section className="card">
        <h2>A moment of prayer</h2>
        <p>Our prayer prompt will appear here.</p>
      </section>
    </main>
  );
}

export default DevotionalPage;