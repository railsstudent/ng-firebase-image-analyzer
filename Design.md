# Design System: Hybrid Image Analysis (Firebase AI Logic)

This document outlines the design system, brand identity, and structural layout for the **Hybrid Image Analysis** application, as extracted from the design tokens and the **Home Page** screen in the Stitch platform. The main design system configurations and Tailwind v4 theme block are located in [src/styles.css](file:///Users/connieleung/Documents/ws_jsangular2/ng-firebase-image-analyzer/src/styles.css).

---

## 1. Atmosphere & Brand Identity

The brand identity centers on **Firebase AI Logic**, projecting a sense of security, intelligence, and high-performance computing.

* **Aesthetic Tone**: Corporate, modern, and leaning heavily toward minimalism.
* **Visual Elements**:
  * **Precision Dot Grid**: A technical background dot grid (`logic-grid` using small repeated radial dots) representing structured logic.
  * **Gradients**: Muted radial color spots (`hero-gradient`) indicating focus and ambient lighting.
  * **Tactile Layers**: Clean, modern cards with a glassmorphism aesthetic (`glass-card`) using subtle borders and soft background blur.

---

## 2. Color Roles & Tokens

The color palette is built using Material Design 3 semantic color variables mapped to functional styling roles.

| Token Name | Hex Value | Role / Usage |
| :--- | :--- | :--- |
| `primary` | `#4648d4` (Override: `#6366f1`) | Primary branding, buttons, active interactive states |
| `primary-container` | `#6063ee` | Background container color for high-visibility highlights |
| `secondary` | `#565e74` (Override: `#0f172a`) | Authoritative text colors, secondary structural elements |
| `secondary-container` | `#dae2fd` | Soft secondary accents and containers |
| `background` / `surface` | `#f8f9ff` | Application canvas backdrop |
| `surface-container` | `#e5eeff` | Default cards and panels |
| `surface-container-highest` | `#d3e4fe` | Highest elevation surfaces |
| `on-surface` | `#0b1c30` | Main text color on surfaces |
| `on-surface-variant` | `#464554` | Subdued descriptive text |
| `outline` | `#767586` | Low-contrast borders and lines |
| `outline-variant` | `#c7c4d7` | Muted division lines |

---

## 3. Typography Scales

Typography uses a carefully chosen triad of fonts designed to structure information hierarchy:

1. **Hanken Grotesk** (Headline / Display)
2. **Inter** (Body text)
3. **Geist** (Labels / Technical blocks)

### Scales

* **`display-lg`** (Hero Heading)
  * **Font Family**: Hanken Grotesk
  * **Size**: `64px`
  * **Line Height**: `1.1`
  * **Font Weight**: `700`
  * **Letter Spacing**: `-0.02em`
* **`headline-lg`** (Primary Headings)
  * **Font Family**: Hanken Grotesk
  * **Size**: `40px`
  * **Line Height**: `1.2`
  * **Font Weight**: `600`
  * **Letter Spacing**: `-0.01em`
* **`headline-md`** (Secondary Headings)
  * **Font Family**: Hanken Grotesk
  * **Size**: `24px`
  * **Line Height**: `1.4`
  * **Font Weight**: `500`
* **`body-lg`** (Lead Paragraphs)
  * **Font Family**: Inter
  * **Size**: `18px`
  * **Line Height**: `1.6`
  * **Font Weight**: `400`
* **`body-md`** (Default Body Text)
  * **Font Family**: Inter
  * **Size**: `16px`
  * **Line Height**: `1.6`
  * **Font Weight**: `400`
* **`label-md`** (Buttons and Navigation Labels)
  * **Font Family**: Geist
  * **Size**: `14px`
  * **Line Height**: `1.2`
  * **Font Weight**: `500`
  * **Letter Spacing**: `0.05em`
* **`code-sm`** (Monospace Text)
  * **Font Family**: Geist
  * **Size**: `13px`
  * **Line Height**: `1.5`
  * **Font Weight**: `400`

---

## 4. Structural Layouts (Home Page)

The layout of the Home Page leverages Tailwind CSS and standard layout rules to establish structured spatial relationships:

### Grid & Alignments

* **Desktop Grid**: 12-column layout with 24px gutters (`gap-xxl` on outer structures, transitioning to grid columns for desktop).
* **Max Width**: Locked to a standard `1280px` (`max-w-container-max`).
* **Spatial Scale**: Base unit of `4px` with multiples of `8px` (`sm=8px`, `md=16px`, `lg=24px`, `xl=32px`, `xxl=64px`).

### Main Page Sections

1. **Top Navigation Bar (`nav`)**:
   * Fixed position at the top (`fixed top-0 w-full z-50`).
   * Stylized primary background (`bg-primary`) with navigation links using the `label-md` typographic style.
   * Clear brand alignment with the icon terminal and typography block.
2. **Hero Section (`section`)**:
   * **Layout Structure**: 12-column grid (`grid grid-cols-1 lg:grid-cols-12 gap-xxl items-center py-xxl`).
   * **Background & Accent Styles**:
     * `.hero-gradient`: Radial gradient (`radial-gradient(circle at 50% 50%, rgba(70, 72, 212, 0.05) 0%, rgba(248, 249, 255, 0) 70%)`).
     * `.logic-grid`: Radial dot grid backdrop pattern (`background-image: radial-gradient(circle, #e5eeff 1px, transparent 1px); background-size: 24px 24px;`).
     * Minimum height: `min-h-[90vh]`.
   * **Left Side Column (`lg:col-span-7 space-y-xl`)**:
     * **Beta Badge**: An inline flex badge with text `Now in Public Beta` (`text-[10px] font-bold uppercase tracking-widest text-primary`) accompanied by a pulsing dot (`w-2 h-2 rounded-full bg-primary animate-pulse`).
     * **Display Headline**: `Intelligent Inference. Anywhere.` (`font-display-lg text-display-lg leading-tight`), where "Anywhere." is styled with the primary color (`text-primary`).
     * **Subhead description**: `Deploy hybrid AI logic across cloud and edge with Firebase. Real-time image analysis, on-device privacy, low token costs, and cloud-scale power.` (`font-body-lg text-body-lg text-on-surface-variant max-w-xl`).
     * **Primary CTA Button**: `Get Started` accompanied by a Material Symbols arrow icon (`arrow_forward`). Sizing/styling: `bg-white text-primary px-xl py-md rounded-xl font-headline-md text-headline-md flex items-center gap-sm transition-all shadow-lg hover:bg-surface-container`.
   * **Right Side Column (`lg:col-span-5 relative`)**:
     * **Illustration Container**: A pulse-animated wrapper with a transition state (`animate-pulse transition-all duration-1000 hover:scale-[1.02]`).
     * **Image**: High-fidelity AI Image Analysis mock illustration (`src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjtrFLoMuWP5EhhqL-qnY4m60vzu8YMk2FIkjwfeYq0Qj-a_kzItlOTkcAeumw0F3bL1TJEw2Eby3Awsu4fBsntLbzAk3cp0qjcAW2j6c9OgHEqaE6uQEfHx5uhle6b0yKt_Tg2nXDht0qbpWHiUZ-XcKGVeiINAUtxkopYd1Ri2rFvZumZJFL8Z-sS0YNQh01rvtRsBPLBzxSetGWorQrHW2_QA0HoiXGEA5uPKxQsE6yGxqMY48TSQ"`), with rounded corners, a light shadow, and a subtle border (`w-full h-auto rounded-xl shadow-lg border border-outline-variant/30`).
     * **Decorative Floating Blurs**:
       * Top-Right: `absolute -top-lg -right-lg w-32 h-32 bg-secondary-container/30 rounded-full blur-3xl`.
       * Bottom-Left: `absolute -bottom-xl -left-xl w-48 h-48 bg-primary-container/20 rounded-full blur-3xl`.
3. **Footer (`footer`)**:
   * Primary background with structured left/right flex layout grouping branding items and license/credits text.

---

## 5. Streaming Loader & Progressive Visual States

To accommodate the shift from standard blocking operations to real-time generative streams, the design system defines a set of micro-interactions and progressive layouts to keep the user interface feeling responsive, fluid, and premium.

### 5.1 The Glassmorphic Streaming Loader Badge (`.streaming-loader-badge`)

Rather than covering the screen with a destructive full-page blocking overlay, we use an in-situ glassmorphic status badge to keep the background workspace visible and alert the user to incoming real-time tokens:

* **Aesthetic & Token Properties**:
  * **Backdrop Blur**: `backdrop-filter: blur(12px)` for maximum glass transparency.
  * **Background Spot**: Semitransparent fill (`rgba(255, 255, 255, 0.6)`) overlaid with a primary highlight tint.
  * **Borders**: `1px solid rgba(var(--outline-variant-rgb), 0.3)` to define a clean, low-contrast, premium outline.
  * **Shadow**: Subtle, diffuse shadow (`box-shadow: 0 4px 20px -2px rgba(70, 72, 212, 0.08)`).
  * **Spacing**: Symmetrical inline padding (`px-4 py-2` or `sm`/`md` scale).
* **Micro-Animations**:
  * **Pulsing State**: A continuous, high-comfort scale pulse (`scale-[1.01]` transition with standard bezier timing) to evoke intelligence.
  * **Sync Spinner**: Standard infinite rotation (`animate-spin` over `1.5s`) of the Material `sync` icon in the primary color (`#6366f1`).

### 5.2 Progressive Content Reveal Animation (`.animate-fade-in`)

To ensure streaming text and UI cards do not pop onto the canvas in a jarring, static manner, all progressive elements (including newly rendered tag lists and analysis tabs) are bound to a transition-smooth fade-and-rise entrance:

```css
@keyframes progressiveReveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: progressiveReveal 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

This progressive approach maintains typographic rhythm and ensures the UI feels exceptionally natural and modern under progressive data conditions.
