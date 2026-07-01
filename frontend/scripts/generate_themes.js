import fs from 'fs';

const darkColors = {
  "on-primary": "#3d2e00",
  "on-primary-container": "#4b3a00",
  "on-primary-fixed": "#241a00",
  "on-tertiary-container": "#253779",
  "on-background": "#dae2ff",
  "surface-container-highest": "#2a3450",
  "secondary-container": "#1c3faa",
  "outline-variant": "#4d4635",
  "surface-container-low": "#101a35",
  "on-tertiary": "#172b6d",
  "on-tertiary-fixed-variant": "#304285",
  "background": "#07122d",
  "surface-variant": "#2a3450",
  "secondary-fixed": "#dde1ff",
  "tertiary": "#b7c4ff",
  "secondary": "#b7c4ff",
  "on-error": "#690005",
  "inverse-primary": "#755b00",
  "tertiary-fixed": "#dde1ff",
  "surface-bright": "#2e3855",
  "surface-dim": "#07122d",
  "tertiary-fixed-dim": "#b7c4ff",
  "error": "#ffb4ab",
  "error-container": "#93000a",
  "on-error-container": "#ffdad6",
  "outline": "#99907b",
  "on-secondary": "#002683",
  "surface-container": "#141f3a",
  "on-secondary-fixed": "#001452",
  "on-secondary-fixed-variant": "#193ca7",
  "primary-fixed": "#ffe08e",
  "surface": "#07122d",
  "surface-container-lowest": "#030d27",
  "on-surface-variant": "#d1c5af",
  "primary-fixed-dim": "#ecc246",
  "surface-tint": "#ecc246",
  "on-primary-fixed-variant": "#584400",
  "primary": "#ecc246",
  "on-surface": "#dae2ff",
  "inverse-on-surface": "#25304b",
  "secondary-fixed-dim": "#b7c4ff",
  "surface-container-high": "#1f2945",
  "inverse-surface": "#dae2ff",
  "on-tertiary-fixed": "#001452",
  "on-secondary-container": "#a4b5ff",
  "primary-container": "#c9a227",
  "tertiary-container": "#92a3ed"
};

const lightColors = {
  "on-primary": "#ffffff",
  "on-primary-container": "#4b3a00",
  "on-primary-fixed": "#241a00",
  "on-tertiary-container": "#393d3e",
  "on-background": "#0d1c2e",
  "surface-container-highest": "#d4e4fc",
  "secondary-container": "#dde2f3",
  "outline-variant": "#d1c5af",
  "surface-container-low": "#eff4ff",
  "on-tertiary": "#ffffff",
  "on-tertiary-fixed-variant": "#434749",
  "background": "#f8f9ff",
  "surface-variant": "#d4e4fc",
  "secondary-fixed": "#dde2f3",
  "tertiary": "#5b5f61",
  "secondary": "#585e6c",
  "on-error": "#ffffff",
  "inverse-primary": "#ecc246",
  "tertiary-fixed": "#e0e3e5",
  "surface-bright": "#f8f9ff",
  "surface-dim": "#ccdbf4",
  "tertiary-fixed-dim": "#c3c7c9",
  "error": "#ba1a1a",
  "error-container": "#ffdad6",
  "on-error-container": "#93000a",
  "outline": "#7f7663",
  "on-secondary": "#ffffff",
  "surface-container": "#e5eeff",
  "on-secondary-fixed": "#161c27",
  "on-secondary-fixed-variant": "#414754",
  "primary-fixed": "#ffe08e",
  "surface": "#f8f9ff",
  "surface-container-lowest": "#ffffff",
  "on-surface-variant": "#4d4635",
  "primary-fixed-dim": "#ecc246",
  "surface-tint": "#755b00",
  "on-primary-fixed-variant": "#584400",
  "primary": "#755b00",
  "on-surface": "#0d1c2e",
  "inverse-on-surface": "#eaf1ff",
  "secondary-fixed-dim": "#c1c6d7",
  "surface-container-high": "#dce9ff",
  "inverse-surface": "#223144",
  "on-tertiary-fixed": "#181c1e",
  "on-secondary-container": "#5e6473",
  "primary-container": "#c9a227",
  "tertiary-container": "#a3a7a9"
};

const hexToRgb = (hex) => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
};

// Generate CSS variables string
let cssContent = `/* CSS Variable Theme System */
:root {
  /* Light mode variables (default) */
  --bg-opacity-hero: 0.65;
  --bg-blend-hero: normal;
  --glass-panel-bg: rgba(255, 255, 255, 0.6);
  --text-gradient-gold-gradient: linear-gradient(135deg, #755b00 0%, #c9a227 50%, #ecc246 100%);
  --hero-overlay-gradient: linear-gradient(180deg, rgba(248, 249, 255, 0.35) 0%, rgba(248, 249, 255, 0.95) 100%);
  --shadow-waveform: 0 0 10px rgba(201, 162, 39, 0.3);
  --shadow-floating-card: 0 20px 50px rgba(0, 0, 0, 0.1);
  --shadow-persistent-player: 0 -10px 40px rgba(0, 0, 0, 0.05);
  --shimmer-effect-stop: rgba(255, 255, 255, 0.4);
  --border-app-bar: rgba(var(--color-outline) / 0.1);
  --border-nav-bar: rgba(var(--color-outline) / 0.1);
  --border-nav-layout: rgba(var(--color-outline) / 0.1);
  --border-floating-card: rgba(var(--color-outline) / 0.1);
  --hero-badge-bg: rgb(var(--color-surface-container));
  --hero-badge-border: rgba(var(--color-primary) / 0.2);
  --hero-badge-shadow: 0 0 15px rgba(201, 162, 39, 0.05);
  --hero-button-border: rgba(var(--color-outline) / 0.2);
  --hero-button-bg: rgba(var(--color-surface-container) / 0.5);
  --card-glow-hover: rgba(201, 162, 39, 0.25);
  --card-border-glow-hover: rgba(201, 162, 39, 0.8);
  --shadow-nav-layout: 0 -10px 30px rgba(0,0,0,0.05);
  --bg-pricing-popular-from: rgb(var(--color-surface-container-low));
  --bg-pricing-popular-to: rgb(var(--color-surface));
  --shadow-pricing-popular: 0 10px 30px rgba(201,162,39,0.1);
  --shadow-pricing-popular-badge: 0 0 15px rgba(201,162,39,0.2);
  --shadow-pricing-button: 0 0 15px rgba(201,162,39,0.2);
  --shadow-pricing-button-hover: 0 0 25px rgba(201,162,39,0.4);
  --waveform-bar-color-muted: 127 118 99; /* outline */
\n`;

for (const [name, value] of Object.entries(lightColors)) {
  cssContent += `  --color-${name}: ${hexToRgb(value)}; /* ${value} */\n`;
}

cssContent += `}\n\n.dark {\n  /* Dark mode variables */\n  --bg-opacity-hero: 0.65;\n  --bg-blend-hero: normal;\n  --glass-panel-bg: rgba(7, 18, 45, 0.4);\n  --text-gradient-gold-gradient: linear-gradient(135deg, #ffe08e 0%, #ecc246 50%, #c9a227 100%);\n  --hero-overlay-gradient: linear-gradient(180deg, rgba(7, 18, 45, 0.4) 0%, rgba(7, 18, 45, 0.95) 100%);\n  --shadow-waveform: 0 0 10px rgba(201, 162, 39, 0.5);\n  --shadow-floating-card: 0 20px 50px rgba(0, 0, 0, 0.5);\n  --shadow-persistent-player: 0 -10px 40px rgba(0, 0, 0, 0.6);\n  --shimmer-effect-stop: rgba(255, 255, 255, 0.1);\n  --border-app-bar: rgba(255, 255, 255, 0.05);\n  --border-nav-bar: rgba(255, 255, 255, 0.1);\n  --border-nav-layout: rgba(255, 255, 255, 0.1);\n  --border-floating-card: rgba(201, 162, 39, 0.2);\n  --hero-badge-bg: rgba(255, 255, 255, 0.05);\n  --hero-badge-border: rgba(var(--color-primary) / 0.3);\n  --hero-badge-shadow: 0 0 15px rgba(201, 162, 39, 0.1);\n  --hero-button-border: rgba(255, 255, 255, 0.1);\n  --hero-button-bg: rgba(255, 255, 255, 0.05);\n  --card-glow-hover: rgba(201, 162, 39, 0.25);\n  --card-border-glow-hover: rgba(201, 162, 39, 0.8);\n  --shadow-nav-layout: 0 -10px 30px rgba(0,0,0,0.5);\n  --bg-pricing-popular-from: rgb(2 26 94); /* #021A5E */\n  --bg-pricing-popular-to: rgb(var(--color-background));\n  --shadow-pricing-popular: 0 0 30px rgba(201,162,39,0.2);\n  --shadow-pricing-popular-badge: 0 0 20px rgba(201,162,39,0.4);\n  --shadow-pricing-button: 0 0 20px rgba(201,162,39,0.4);\n  --shadow-pricing-button-hover: 0 0 30px rgba(201,162,39,0.6);\n  --waveform-bar-color-muted: 255 255 255; /* white */\n\n`;

for (const [name, value] of Object.entries(darkColors)) {
  cssContent += `  --color-${name}: ${hexToRgb(value)}; /* ${value} */\n`;
}

cssContent += `}\n`;

fs.writeFileSync('src/styles/theme_variables.css', cssContent);
console.log('Theme variables generated and saved directly to src/styles/theme_variables.css');
