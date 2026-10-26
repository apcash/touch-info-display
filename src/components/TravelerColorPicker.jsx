import React, { useId } from "react";

const presetColors = [
  { name: "Sage", value: "#91A58B" },
  { name: "Dusty blue", value: "#829DB5" },
  { name: "Muted teal", value: "#78A6A0" },
  { name: "Lavender", value: "#AA96B8" },
  { name: "Terracotta", value: "#C18C78" },
  { name: "Warm gold", value: "#BDA16C" },
];

export default function TravelerColorPicker({
  value,
  onChange,
  disabled = false,
}) {
  const customId = useId();

  const isPreset = presetColors.some(
    (color) => color.value.toLowerCase() === value.toLowerCase()
  );

  return (
    <fieldset className="traveler-colors" disabled={disabled}>
      <legend>Map color</legend>

      <div className="traveler-color-options">
        {presetColors.map((color) => {
          const selected =
            color.value.toLowerCase() === value.toLowerCase();

          return (
            <button
              key={color.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(color.value)}
            >
              <span
                className="traveler-color-swatch"
                style={{ backgroundColor: color.value }}
                aria-hidden="true"
              />
              <span>{color.name}</span>
              <span className="traveler-color-check" aria-hidden="true">
                {selected ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <details className="traveler-custom-color">
        <summary>
          Custom color{!isPreset ? " · selected" : ""}
        </summary>
        <label htmlFor={customId}>Choose any color</label>
        <input
          id={customId}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </details>
    </fieldset>
  );
}