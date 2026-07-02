---
name: NeetBand
description: Study Smarter. Remember More.
colors:
  primary: "#c9a227"
  primary-deep: "#755b00"
  primary-bright: "#ecc246"
  primary-fixed: "#ffe08e"
  neutral-bg-light: "#f8f9ff"
  neutral-bg-dark: "#07122d"
  on-primary: "#ffffff"
  on-background-light: "#0d1c2e"
  on-background-dark: "#dae2ff"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "48px"
    fontWeight: 800
    lineHeight: "56px"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Outfit, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "40px"
  body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  label:
    fontFamily: "Outfit, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "12px"
  md: "24px"
  lg: "48px"
  xl: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "16px 48px"
---

# Design System: NeetBand

## 1. Overview

**Creative North Star: "The Focus Sanctuary"**

This system is engaging, calm, and frictionless. Designed to protect eye health and facilitate auditory learning, the visual language is soft, rounded, and welcoming rather than clinical or dense. It embraces a focused aesthetic that removes visual noise so the student can concentrate on the audio. We explicitly reject dense, text-heavy, traditional e-learning patterns that cause eye strain or feel tedious.

**Key Characteristics:**
- Audio-first engagement
- Uncluttered, spacious layouts
- Soft geometry and welcoming components

## 2. Colors

The palette is designed to reduce eye fatigue with deep, calm backgrounds and clear, luminous accents.

### Primary
- **Primary Accent** (#c9a227): Used as the primary brand accent and container background.
- **Primary Deep** (#755b00): Used for text/outline contrast in light mode.
- **Primary Bright** (#ecc246): Used for dominant icons and text indicators in dark mode.
- **Primary Fixed** (#ffe08e): Light container and hover highlight color.

### Neutral
- **Light Background** (#f8f9ff): The foundational background color for the light theme.
- **Dark Background** (#07122d): The foundational background color for the dark theme to reduce eye fatigue.
- **On-Primary Text** (#ffffff): Used for text on primary-colored surfaces.
- **On-Background Light** (#0d1c2e): Deep readable ink for light backgrounds.
- **On-Background Dark** (#dae2ff): Soft reading ink for dark backgrounds.

**The Contrast Comfort Rule.** The primary accent is vibrant but should be used selectively against the deep background to avoid overwhelming the eye.

## 3. Typography

**Display Font:** Outfit (with sans-serif)
**Body Font:** Outfit (with sans-serif)

**Character:** Modern, clean, and highly legible across all sizes, ensuring frictionless reading without strain.

### Hierarchy
- **Display** (800, 48px, 56px): Hero headlines and major section titles.
- **Headline** (700, 32px, 40px): Subsection titles and important callouts.
- **Title** (600, 24px, 32px): Card titles and minor section headers.
- **Body** (400, 16px, 24px): Standard reading text. Max line length ~70ch for comfortable scanning.
- **Label** (500, 12px, 16px): UI micro-copy, metadata, and tags.

**The Legibility First Rule.** Text must always prioritize contrast and spacing over stylistic density to minimize eye strain.

## 4. Elevation

The system uses soft, ambient depth rather than harsh layered cards.

### Shadow Vocabulary
- **Ambient Glow** (`box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3)`): Used on active primary elements to create a soft, welcoming lift.
- **Floating Card** (`box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5)`): Deep, diffuse shadow for modal surfaces or prominent layered content.

**The Soft Lift Rule.** Shadows should feel like a diffuse glow or soft ambient occlusion, never sharp or harsh borders.

## 5. Components

### Buttons
- **Shape:** Rounded edges (0.5rem)
- **Primary:** Warm gold background (#c9a227) with generous padding (16px 48px)
- **Hover / Focus:** Gentle scale up with an ambient glow to feel tactile.

### Cards / Containers
- **Corner Style:** Large radius (0.75rem)
- **Background:** Subtle variations of the deep background to establish hierarchy without stark borders.
- **Shadow Strategy:** Floating and soft.
- **Internal Padding:** Generous (24px to 48px) to let content breathe.

### Inputs / Fields
- **Style:** Soft borders, rounded (0.5rem), and slightly lighter backgrounds than the surface.
- **Focus:** Subtle primary-colored border shift with no harsh outlines.

## 6. Do's and Don'ts

### Do:
- **Do** use the deep background (#012f9c) to minimize eye strain.
- **Do** use the primary gold (#c9a227) selectively for key interactive elements.
- **Do** ensure all typography has sufficient contrast for effortless reading.

### Don't:
- **Don't** use dense, text-heavy, traditional e-learning patterns that cause eye strain or feel tedious.
- **Don't** introduce harsh, sharp drop-shadows; keep depth soft and ambient.
- **Don't** clutter the interface with unnecessary visual decorations that compete with the audio-first experience.
