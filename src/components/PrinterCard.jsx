import React from "react";
import usePrinterStatus from "../hooks/usePrinterStatus";

function describeState(state) {
  const labels = {
    IDLE: "Idle",
    READY: "Ready",
    RUNNING: "Printing",
    PAUSE: "Paused",
    FINISH: "Finished",
    FAILED: "Failed",
    PREPARE: "Preparing",
    SLICING: "Slicing",
  };

  return labels[state] ?? state ?? "Waiting for printer status";
}

function temperature(value) {
  return Number.isFinite(value)
    ? `${Math.round(value)}°C`
    : "Waiting for data";
}

function remainingTime(minutes) {
  if (!Number.isFinite(minutes)) return "Waiting for data";

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return hours > 0
    ? `${hours}h ${remainder}m`
    : `${remainder}m`;
}

export default function PrinterCard() {
  const {
    configured,
    signedIn,
    loading,
    printer,
    stale,
    error,
  } = usePrinterStatus();

  let badge;
  let message;

  if (!configured) {
    badge = "Not configured";
    message = "The account connection is not configured.";
  } else if (loading) {
    badge = "Loading";
    message = "Checking printer status…";
  } else if (!signedIn) {
    badge = "Sign in";
    message = "Sign in through Display settings to view your printer.";
  } else if (error) {
    badge = "Unavailable";
    message = "Unable to refresh printer information. Retrying shortly.";
  } else if (!printer) {
    badge = "Not set up";
    message = "No printer is linked to this account.";
  } else if (!printer.reported_at) {
    badge = "Waiting";
    message = "Waiting for the printer service’s first update.";
  } else if (stale) {
    badge = "Out of date";
    message = "The printer service has stopped reporting.";
  } else if (!printer.connected) {
    badge = "Disconnected";
    message = "The printer service cannot currently reach the printer.";
  } else {
    badge = "Connected";
    message = describeState(printer.state);
  }

  const showReadings =
    signedIn &&
    !loading &&
    !error &&
    printer?.connected &&
    !stale;

  const hasProgress =
    showReadings &&
    Number.isFinite(printer.progress_percent);

  const reportedAt = Date.parse(printer?.reported_at ?? "");

  return (
    <section
      className="card printer-card"
      aria-labelledby="printer-title"
    >
      <div className="card-heading">
        <h2 id="printer-title">In the workshop</h2>
        <span className="badge">{badge}</span>
      </div>

      <p className="muted">
        {printer?.printer_name ?? "Bambu A1"}
      </p>

      <div className={showReadings ? "printer-body has-readings" : "printer-body"}>
        <div className="print-illustration" aria-hidden="true">
          <div className="printer-frame">
            <div className="print-head" />
            <div className="print-object" />
            <div className="print-bed" />
          </div>
        </div>

        <div className="printer-details">
          <div className="card-heading">
            <h3>{message}</h3>

            {hasProgress && (
              <strong className="percent">
                {printer.progress_percent}%
              </strong>
            )}
          </div>

          {hasProgress && (
            <>
              <label className="sr-only" htmlFor="print-progress">
                Print progress
              </label>
              <progress
                id="print-progress"
                max="100"
                value={printer.progress_percent}
              />
            </>
          )}

          {showReadings && (
            <>

              <p className="muted">
                Time remaining: {remainingTime(printer.remaining_minutes)}
              </p>
            </>
          )}

          {Number.isFinite(reportedAt) && (
            <p className="muted">
              Last service report:{" "}
              <time dateTime={printer.reported_at}>
                {new Date(reportedAt).toLocaleString()}
              </time>
            </p>
          )}
        </div>
        {showReadings && (
          <dl className="printer-temperatures">
            <div>
              <dt>Nozzle</dt>
              <dd>{temperature(printer.nozzle_temperature_c)}</dd>
            </div>
            <div>
              <dt>Bed</dt>
              <dd>{temperature(printer.bed_temperature_c)}</dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  );
}

