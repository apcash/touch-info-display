import React from "react";

export default function PrinterCard({ printer }) {
  return (
    <section className="card printer-card" aria-labelledby="printer-title">
      <div className="card-heading">
        <h2 id="printer-title">In the workshop</h2>
        <span className="badge">Demo data</span>
      </div>
      <p className="muted">{printer.name} · Not connected</p>
      <div className="printer-body">
        <div className="print-illustration" aria-hidden="true">
          <div className="printer-frame">
            <div className="print-head" />
            <div className="print-object" />
            <div className="print-bed" />
          </div>
        </div>
        <div className="printer-details">
          <div className="card-heading">
            <h3>{printer.file}</h3>
            <strong className="percent">{printer.progress}%</strong>
          </div>
          <label className="sr-only" htmlFor="print-progress">
            Sample print progress
          </label>
          <progress id="print-progress" max="100" value={printer.progress} />
          <div className="card-footer">
            <span>{printer.remaining} remaining</span>
            <span>Layer {printer.layer}</span>
          </div>
          <p className="material">
            <span aria-hidden="true">●</span> {printer.material}
          </p>
        </div>
      </div>
    </section>
  );
}
