import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

function escapeWifi(value) {
  return value.replace(/[\\;,:"]/g, "\\$&");
}

export default function WifiCard({ wifi }) {

    const wifiText = `WIFI:T:WPA;S:${escapeWifi(wifi.name)};P:${escapeWifi(wifi.password)};;`;
    const [showDetails, setShowDetails] = useState(false);

  return (
    <section className="card wifi-card" aria-labelledby="wifi-title">
      <h2 id="wifi-title">Make yourself at home!</h2>
      <button type="button" onClick={() => setShowDetails(!showDetails)} aria-expanded={showDetails}>
        {showDetails ? "Hide Wi-Fi details" : "Show Wi-Fi details"}
      </button>
      {showDetails && (
        <div className="wifi-details">
            <p className="muted">Scan to connect to Wi-Fi.</p>        
            <QRCodeSVG
                    value={wifiText}
                    size={180}
                    level="M"
                    marginSize={4}
                    bgColor="#ffffff"
                    fgColor="#17241d"
                />
            <p>Network: {wifi.name}</p>
            <p>Password: {wifi.password}</p>
        </div>
        )}
    </section>
  );
}