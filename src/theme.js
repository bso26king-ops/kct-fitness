// ─── KCT FITNESS BRAND TOKENS ────────────────────────────────────────────────
export const DARK = {
  black:     "#080808",
  panel:     "#0F0F0F",
  surface:   "#151515",
  surfaceHi: "#1C1C1C",
  line:      "#252525",
  lineHi:    "#333333",
  white:     "#F0F0EB",
  whiteMid:  "#888882",
  whiteDim:  "#444440",
  red:       "#C82828",
  redDim:    "#C8282818",
  gold:      "#C8A44A",
  goldDim:   "#C8A44A12",
  green:     "#2ECC6A",
  greenDim:  "#2ECC6A12",
  blue:      "#3B9EFF",
  blueDim:   "#3B9EFF12",
  orange:    "#FF6B2B",
};

export const LIGHT = {
  black:     "#F2F2EE",
  panel:     "#E8E8E3",
  surface:   "#DDDDD8",
  surfaceHi: "#D2D2CC",
  line:      "#C4C4BE",
  lineHi:    "#ADADAA",
  white:     "#181815",
  whiteMid:  "#525250",
  whiteDim:  "#909088",
  red:       "#B82020",
  redDim:    "#B8202018",
  gold:      "#8A6A10",
  goldDim:   "#8A6A1012",
  green:     "#189A48",
  greenDim:  "#189A4812",
  blue:      "#1870C8",
  blueDim:   "#1870C812",
  orange:    "#CC5018",
};

// Global mutable theme object — call applyTheme() to switch
export const T = { ...DARK };

export function applyTheme(dark = true) {
  const src = dark ? DARK : LIGHT;
  Object.assign(T, src);
  document.body.style.background = src.black;
}

export const FONT = "'Barlow Condensed', Barlow, sans-serif";
export const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&display=swap');";
