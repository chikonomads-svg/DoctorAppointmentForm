---
name: Clinical Precision
colors:
  surface: '#f3fafd'
  surface-dim: '#d4dbde'
  surface-bright: '#f3fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f8'
  surface-container: '#e8eff2'
  surface-container-high: '#e2e9ec'
  surface-container-highest: '#dde4e7'
  on-surface: '#161d1f'
  on-surface-variant: '#3f484d'
  inverse-surface: '#2a3234'
  inverse-on-surface: '#ebf2f5'
  outline: '#6f787d'
  outline-variant: '#bfc8cd'
  surface-tint: '#006782'
  primary: '#00546b'
  on-primary: '#ffffff'
  primary-container: '#0b6e8a'
  on-primary-container: '#bdeaff'
  inverse-primary: '#84d1f0'
  secondary: '#23657e'
  on-secondary: '#ffffff'
  secondary-container: '#a6e3ff'
  on-secondary-container: '#24667f'
  tertiary: '#435053'
  on-tertiary: '#ffffff'
  tertiary-container: '#5b686b'
  on-tertiary-container: '#d8e6ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bbeaff'
  primary-fixed-dim: '#84d1f0'
  on-primary-fixed: '#001f29'
  on-primary-fixed-variant: '#004d62'
  secondary-fixed: '#bde9ff'
  secondary-fixed-dim: '#92cfeb'
  on-secondary-fixed: '#001f2a'
  on-secondary-fixed-variant: '#004d64'
  tertiary-fixed: '#d7e5e9'
  tertiary-fixed-dim: '#bbc9cd'
  on-tertiary-fixed: '#111d21'
  on-tertiary-fixed-variant: '#3c494c'
  background: '#f3fafd'
  on-background: '#161d1f'
  surface-variant: '#dde4e7'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  hindi-accent:
    fontFamily: Noto Sans Devanagari
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  print-prescription:
    fontFamily: Source Serif 4
    fontSize: 12pt
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered for a healthcare environment where clarity, trust, and organizational efficiency are paramount. The brand personality is clinical yet accessible, prioritizing high legibility and a sense of calm reliability. 

The visual style follows a **Corporate / Modern** aesthetic with a lean toward **Minimalism**. It utilizes a systematic approach to white space and tonal layering to reduce cognitive load for both medical practitioners and patients. The interface relies on a crisp "paper-like" surface metaphor, ensuring that critical medical data remains the primary focus.

## Colors
The palette is rooted in Deep Teal to evoke a professional medical atmosphere. 
- **Primary & Secondary:** Used for branding, primary actions, and navigational emphasis.
- **Tints & Neutrals:** Teal Light and Soft Blue are reserved for surface backgrounds, hover states, and subtle section differentiation.
- **Semantic Badges:** Gender-specific tokens are provided for patient identification (Male: Blue, Female: Pink). Status indicators follow industry-standard coloring for immediate recognition of patient urgency or system alerts.

## Typography
The system uses **Inter** for all digital interfaces to ensure maximum legibility and a modern, utilitarian feel. **Noto Sans Devanagari** is integrated specifically for Hindi text accents, maintaining visual harmony with the sans-serif system.

For printed outputs (prescriptions and medical reports), the system transitions to **Source Serif 4** (a high-quality serif alternative to Times New Roman) to provide a traditional, authoritative, and highly readable document format that distinguishes printed records from digital screens.

## Layout & Spacing
This design system utilizes a **Fixed Grid** model for desktop (12 columns) and a **Fluid Grid** for mobile (4 columns). 

A strict 8px spacing scale (Base 8) ensures mathematical consistency across all margins and paddings. Data-heavy views, such as patient lists or lab results, may use the "xs" (4px) unit for tighter vertical density, while marketing or dashboard landing pages should prioritize "lg" (24px) or "xl" (32px) increments to create a sense of openness.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines**. 
- **Base Level:** The background uses Soft Blue (#F0F7FA) to reduce screen glare.
- **Surface Level:** Content containers are pure white (#FFFFFF), featuring a 1px solid border in a light gray/teal tint.
- **Elevation:** Subtle, ambient shadows (0px 2px 4px rgba(0,0,0,0.05)) are applied only to interactive cards and modals to suggest "lift" without creating visual clutter.

## Shapes
The shape language is consistently **Rounded**. A corner radius of 8px is the standard for cards, input fields, and primary buttons. This specific radius strikes a balance between the rigid precision of a medical environment and the approachability required for patient care. Smaller elements like tags and status badges use a 4px (Soft) or full pill-shape radius for immediate distinction from structural layout components.

## Components
- **Buttons:** Primary buttons use Deep Teal (#0B6E8A) with white text and 8px rounding. Secondary buttons use a Teal Light (#E2F0F4) background with Deep Teal text.
- **Cards:** White background, 8px radius, 1px light gray border (#E0E0E0), and a subtle shadow. Used for patient profiles and appointment summaries.
- **Badges:** 
    - *Gender:* Small, pill-shaped tags. Male (Blue background, White text), Female (Pink background, White text).
    - *Status:* Color-coded text with a 10% opacity background of the same color (e.g., Success = Green text on light green tint).
- **Input Fields:** 1px border, 8px radius. On focus, the border transitions to Deep Teal with a 2px outer glow in Soft Blue.
- **Lists:** Clean rows with 1px bottom dividers. High vertical padding (12px-16px) to ensure touch targets are accessible and data is readable.
- **Prescription Header:** Uses the Hindi accent typography (आरोग्य क्लिनिक) alongside the primary logo, centered for print balance.