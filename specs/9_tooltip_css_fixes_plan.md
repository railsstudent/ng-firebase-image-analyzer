# Specification: Badge Tooltip CSS & Layout Fixes Plan

This specification outlines the architecture and implementation steps to fix CSS bugs and improve the layout of the `app-badge` component's tooltip on hover, while resolving a missing global color variable that impacts multiple components across the application.

## 1. Objectives

* **Define Missing Global Color Variable**: Add `--color-surface-container-high` to the global `@theme` in `src/styles.css` to fix styling fallbacks across multiple components (badge, token-usage-bar, and image-uploader).
* **Fix Tooltip Text Wrapping & Avoid Shrink-to-Fit**: Assign an explicit, solid width (`w-64`) to the tooltip container to prevent absolute position width collapse (vertical text / one character per line).
* **Fix Stacking Order (Obscurity)**: Ensure the hovered badge and its tooltip are not obscured by the "Detected Visual Tags" header (or other layout components) by raising the stacking context on hover (`z-30`).
* **Inhibit See-through Headers (Opaque Contrast Background)**: Style the tooltip content with a premium, fully opaque dark theme (`bg-slate-900` / `border-slate-800` / `text-slate-100`) to completely block any underlying headers or text.
* **Increase Typography Size**: Increase the tooltip text font size from `text-xs` (approx. `12px`) to `text-sm` (approx. `14px`) for enhanced readability.

---

## 2. Target Files & Code Locations

* **Global Theme Styles**: [styles.css](file:///Users/connieleung/Documents/ws_jsangular2/ng-firebase-image-analyzer/src/styles.css)
* **Component Styles**: [badge.css](file:///Users/connieleung/Documents/ws_jsangular2/ng-firebase-image-analyzer/src/app/shared/ui/components/badge/badge.css)

---

## 3. Detailed Changes

### A. Add Missing Global Variable in `src/styles.css`

Declaring `--color-surface-container-high` under the `@theme` directive in `styles.css` restores correct rendering backgrounds for light-themed cards, token usage bars, and badge pills.

```css
@theme {
  --color-primary: #6366f1;
  --color-primary-container: #6063ee;
  --color-secondary: #0f172a;
  --color-tertiary: #10b981;
  --color-quaternary: #f59e0b;
  --color-secondary-container: #dae2fd;
  --color-surface-container: #e5eeff;
  --color-surface-container-high: #ecf2ff; /* <-- Add this missing middle-shade value */
  --color-surface-container-highest: #d3e4fe;
  ...
}
```

### B. Adjusting Stacking Context on Hover in `badge.css`

To prevent nearby headers or elements from obscuring the tooltip, we raise the stacking context of `.tag-container` when hovered.

```css
.tag-container:hover {
  @apply z-30;
}
```

### C. Tooltip Sizing, Opacity, and Styling in `badge.css`

We modify `.tooltip-content` and `.tooltip-arrow` to use a beautiful, opaque high-contrast dark theme, coupled with a fixed width to prevent absolute shrink-to-fit collapse:

```css
.tooltip-content {
  @apply bg-slate-900 text-slate-100 text-sm px-3.5 py-2.5 rounded-lg shadow-xl whitespace-normal break-words w-64 relative border border-slate-800;
}

.tooltip-arrow {
  @apply absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900;
}
```

---

## 4. Implementation Steps

### Step 1: Add Variable to `src/styles.css`

Locate `@theme` in `src/styles.css` and add the missing line:

```css
  --color-surface-container: #e5eeff;
  --color-surface-container-high: #ecf2ff;
  --color-surface-container-highest: #d3e4fe;
```

### Step 2: Apply CSS Changes to `badge.css`

Locate `.tag-container`, `.tooltip-content`, and `.tooltip-arrow` in `src/app/shared/ui/components/badge/badge.css` and update them as follows:

```css
.tag-container {
  @apply relative inline-block;
}

.tag-container:hover {
  @apply z-30;
}

/* ... tag-pill and tooltip-wrapper ... */

.tooltip-content {
  @apply bg-slate-900 text-slate-100 text-sm px-3.5 py-2.5 rounded-lg shadow-xl whitespace-normal break-words w-64 relative border border-slate-800;
}

.tooltip-arrow {
  @apply absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900;
}
```

### Step 3: Format Stylesheets

Run the formatter to keep styles uniform and consistent:

```bash
npx prettier --write src/styles.css src/app/shared/ui/components/badge/badge.css
```

### Step 4: Verification

* Verify compile success.
* Hover over the visual tags to confirm tooltips wrap gracefully, do not render behind the header, block text underneath perfectly, and display with the larger `text-sm` font.
* Confirm that the **Token Usage Bar**, **Image Uploader Icon Container**, and **Tag Pills** are rendered correctly with their designated `#ecf2ff` backgrounds.
