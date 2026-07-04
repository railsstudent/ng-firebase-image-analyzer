# Specification: CSS & Layout Fixes Plan (Component-Scoped Styles)

This plan outlines the architecture and implementation steps for fixing layout alignment issues across the home page and image analysis routes by extracting inline container styles into a dedicated, component-scoped stylesheet for the App root component.

## 1. Objectives

* Ensure the global footer is anchored perfectly at the bottom of the viewport on pages with short content (e.g., `/image-analysis`).
* Correctly set the `html` and `body` heights to `100%` in the global `styles.css`.
* Apply a universal `box-sizing: border-box` reset in the global stylesheet.
* Avoid inline utility classes on structural elements in `app.html` by extracting them into a dedicated component stylesheet `src/app/app.css` using Tailwind `@reference`.

---

## 2. Architecture & Design

### A. Global Reset & Layout Constraints (`src/styles.css`)

To establish document-level resets:

* **Box Sizing Reset**: Normalizes elements (`*`, `*::before`, `*::after`) to `box-sizing: border-box`.
* **Document Height**: Explicitly enforces `html, body { height: 100%; }`.
* **Tailwind Framework**: Loaded globally via `@import 'tailwindcss';` (with no changes to where it is loaded).

### B. Scoped Component Stylesheet (`src/app/app.css`)

Rather than placing structural utility classes directly inside `src/app/app.html`, we create a component-scoped stylesheet `src/app/app.css` that imports `styles.css` rules via `@reference`:

```css
@reference "../styles.css";

.app-container {
  @apply flex flex-col min-h-screen;
}

.main-content {
  @apply flex-grow pt-16;
}
```

### C. Clean Root Layout (`src/app/app.html`)

The structural tags are simplified to use our newly defined, semantic component classes:

```html
<div class="app-container">
  <app-header title="Firebase AI Logic Hybrid & On-device Inference" />
  <main class="main-content">
    <router-outlet />
  </main>
  <app-footer />
</div>
```

---

## 3. Implementation Steps

### Step 1: Global Reset and Document Height Configuration

Modify `src/styles.css` to include the global resets:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}
```

### Step 2: Create Scoped Stylesheet for App Component

Create `src/app/app.css` with the extracted Tailwind classes:

```css
@reference "../styles.css";

.app-container {
  @apply flex flex-col min-h-screen;
}

.main-content {
  @apply flex-grow pt-16;
}
```

### Step 3: Register Scoped Stylesheet in `app.ts`

Modify `src/app/app.ts` to add the `styleUrl` configuration:

```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css', // <-- Added component styleUrl
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

### Step 4: Simplify Root Template in `app.html`

Replace utility classes with the semantic component classes:

```html
<div class="app-container">
  <app-header title="Firebase AI Logic Hybrid & On-device Inference" />
  <main class="main-content">
    <router-outlet />
  </main>
  <app-footer />
</div>
```

### Step 5: Verification

Run and test the build to ensure the footer anchors perfectly at the bottom and component-scoped compilation runs successfully.
