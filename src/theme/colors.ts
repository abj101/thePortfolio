/**
 * Canonical palette — keep in sync with src/styles/tokens.css.
 * Hex values are for Canvas / Three.js; CSS uses OKLCH custom properties.
 */
export const colors = {
  paper: "#f5f2ec",
  ink: "#2a2824",
  mist: "#e8e4dc",
} as const;

/** Mid-tone between ink and mist (e.g. Snake apple shell). */
export const inkMuted = "#888880";

export const colorsThree = {
  paper: 0xf5f2ec,
  ink: 0x2a2824,
  mist: 0xe8e4dc,
} as const;
