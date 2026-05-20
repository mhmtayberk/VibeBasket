---
name: VibeBasket
colors:
  surface: '#101412'
  surface-dim: '#101412'
  surface-bright: '#353a38'
  surface-container-lowest: '#0a0f0d'
  surface-container-low: '#181d1a'
  surface-container: '#1c211e'
  surface-container-high: '#262b28'
  surface-container-highest: '#313633'
  on-surface: '#dfe4df'
  on-surface-variant: '#bdc9c2'
  inverse-surface: '#dfe4df'
  inverse-on-surface: '#2d312f'
  outline: '#88938d'
  outline-variant: '#3e4944'
  surface-tint: '#7cd8b6'
  primary: '#a0fdda'
  on-primary: '#003829'
  primary-container: '#84e0be'
  on-primary-container: '#00644c'
  inverse-primary: '#006c52'
  secondary: '#ccbeff'
  on-secondary: '#332664'
  secondary-container: '#4a3d7c'
  on-secondary-container: '#baabf3'
  tertiary: '#ffe6d4'
  on-tertiary: '#4b2702'
  tertiary-container: '#ffc28f'
  on-tertiary-container: '#7a4e25'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#98f4d2'
  primary-fixed-dim: '#7cd8b6'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#00513d'
  secondary-fixed: '#e7deff'
  secondary-fixed-dim: '#ccbeff'
  on-secondary-fixed: '#1e0e4e'
  on-secondary-fixed-variant: '#4a3d7c'
  tertiary-fixed: '#ffdcc1'
  tertiary-fixed-dim: '#f6ba88'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#663d15'
  background: '#101412'
  on-background: '#dfe4df'
  surface-variant: '#313633'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 5.5rem
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 3rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: '1.2'
  title-md:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: '1.4'
  body-base:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: Geist Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  code-snippet:
    fontFamily: Geist Mono
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.7'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
  container-max: 1440px
---

## Brand & Style
The design system is engineered for AI developers, blending high-density technical utility with a refined editorial-modern aesthetic. It prioritizes information density and clarity without sacrificing visual sophistication.

The visual style is **Technical-Minimalist**. It utilizes a "Dark Mode First" philosophy, leaning on structural precision, 1px borders, and a subtle grain texture (4% opacity) to add organic depth to the digital canvas. Motion is purposeful and deliberate (180ms - 250ms), avoiding flashy transitions in favor of "snappy" feedback that respects the user's focus. The brand mark is a stylized geometric weave, symbolizing the synthesis of complex data into structured baskets of insight.

## Colors
The palette is rooted in a warm, near-black foundation that reduces eye strain during deep work sessions. The secondary and tertiary surfaces create a logical hierarchy of depth.

- **Mint Primary (#84E0BE):** Used for primary actions and success states; provides high visibility against the dark background.
- **Lavender Secondary (#C4B5FD):** Used for accents, secondary interactions, and identifying AI-generated content.
- **Amber Warning (#FCD34D):** Reserved for system warnings and high-priority notifications.
- **Borders:** Crucial to this design system's structure. Use `border_subtle` for grid lines and passive containers, and `border_strong` for interactive elements or active focus states.

## Typography
The system uses the **Geist** typeface family for its geometric precision and technical clarity. 

- **Display & Headlines:** Use Geist Sans with tight letter-spacing for an editorial feel.
- **Body:** Standard Geist Sans optimized for legibility at high densities.
- **Labels & Data:** Geist Mono is used for all metadata, labels, and code blocks to signal technical context.
- **Scaling:** On mobile devices, display type scales aggressively down while body copy remains stable to preserve readability.

## Layout & Spacing
This design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

The layout philosophy is "Grid-Visible," where the 1px subtle borders often follow the grid lines to create a blueprint-like structure. 
- **Density:** High. Vertical rhythm is based on a 4px baseline unit. 
- **Gutters:** Fixed at 16px to maintain a compact, data-heavy feel.
- **Desktop:** Elements should snap to the grid; use margins of 24px to separate the main container from the viewport edge.

## Elevation & Depth
Depth is communicated through **Tonal Layering** rather than traditional shadows. As an element "rises" in the stack, its background color becomes lighter.

1. **Level 0 (Base):** #0A0A0B (Primary Background)
2. **Level 1 (Card/Surface):** #131316 (Subtle separation)
3. **Level 2 (Dropdown/Modal):** #1A1A1F (Elevated)
4. **Level 3 (Popovers):** #22222A (Overlay)

To further define edges, use 1px borders instead of drop shadows. A very faint "glow" (inner shadow) using the Primary Mint color can be used for active or high-priority elements to simulate self-illumination.

## Shapes
The shape language is "Soft-Technical." Elements use a small **0.25rem (4px)** radius to prevent the UI from feeling overly aggressive or brutalist, while maintaining a precise, engineered appearance.

- **Small elements (Buttons, Inputs):** 4px radius.
- **Medium elements (Cards, Modals):** 8px radius (`rounded-lg`).
- **Accent elements:** Strictly rectangular or 4px; avoid pill shapes except for specific notification badges.

## Components
Consistent implementation of components is vital for the technical-editorial look:

- **Buttons:** 1px `border_strong` with a background of `surface_elevated`. On hover, the border changes to `primary_mint`. Use `label-mono` for button text.
- **Inputs:** No background; 1px `border_subtle` that becomes `primary_mint` on focus. Placeholder text in `text_tertiary`.
- **Cards:** Background of `surface_default` with a 1px `border_subtle`. Use for grouping related data or AI model outputs.
- **Chips/Badges:** Small, 1px bordered containers using `Geist Mono`. Backgrounds should be 10% opacity of the accent color (e.g., 10% Mint).
- **Lists:** Separated by 1px horizontal `border_subtle` lines. Active items use a vertical 2px `primary_mint` indicator on the left edge.
- **Icons:** Use **Lucide** at a 1.5px stroke weight to match the thin-line aesthetic of the borders and Geist typography.