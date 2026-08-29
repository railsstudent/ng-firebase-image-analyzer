# Specification: Colocated Image Recommendation Skeleton

## Problem Statement

When analyzing complex uploaded images, the AI-powered recommendation pipeline can take up to 2-3 seconds to deliver structural insights. During this loading period, displaying an empty container or a simple text loader harms perceived performance and creates a jarring visual pop-in when content suddenly loads.

To create a smooth, premium dashboard experience, we need an elegant visual placeholder (skeleton loader) that matches the precise shape and rhythm of the incoming recommendation cards.

---

## User Stories

1. **As a user awaiting analysis results,** I want to see animated, staggered skeleton placeholder bars, so that I understand the application is actively processing and the layout remains visually stable.
2. **As an international mobile user on slower connections,** I want the skeleton loader to pulse smoothly and render instantly, so that the loading period feels shorter and highly responsive.
3. **As a UI/UX developer,** I want the skeleton loader specific to recommendations to live locally next to its parent component, so that I can maintain the UI presentation logic easily without cluttering the shared design folder.

---

## High-Level Implementation Decisions

1. **Colocated Standalone Component:** Place the loader within `src/app/features/image-analysis/image-recommendation-skeleton/` to ensure visual cohesion and keep the general-purpose UI library clean.
2. **Pulse Animation:** Style placeholder circles and lines using standard CSS animation pulses (`animate-pulse`) mapping to the theme variables inside `styles.css`.
3. **Staggered Layout:** Present 3 staggered loading rows mimicking the standard layout of recommendations list cards.

---

## Out of Scope

* Creating general-purpose, global skeleton wrappers for other unrelated cards.
* Adding custom, complex loading states for the initial file uploader.
