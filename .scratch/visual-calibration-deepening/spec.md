# Visual Calibration Deepening & In-Memory Export Specification

## Problem Statement

The Visual Calibration and Image Download pipeline currently suffers from architectural fragmentation and unnecessary network overhead:

1. `VisualCalibrationService` presents a shallow interface requiring callers (`ImageImprovementComponent`) to coordinate four separate low-level methods and manually format crop string positions.
2. `ImageDownloadService` issues an Angular `HttpClient.get()` request on in-memory Base64 data URLs created by `FileReader`, bringing the entire `@angular/common/http` package and RxJS `firstValueFrom` into the lazy-loaded image analysis bundle for a redundant round-trip conversion.

## Product Goals & User Outcomes

1. **High-Leverage Calibration Interface**: Feature components obtain full visual calibration state (clamped adjustments, crop styles, and position labels) through a single cohesive call.
2. **Purged `@angular/common/http` Bundle**: Removing `HttpClient` from the only service in the application that references it evicts the HTTP client module from application bundles, reducing bundle size.
3. **Instant, Zero-Network Image Export**: Exporting enhanced PNGs loads in-memory Base64 data directly into browser canvas elements without going through Angular's HTTP backend.
4. **Preserved Presentation Seams**: The declarative `DownloadEnhancedDirective` is retained at the button boundary, keeping component templates clean and download side-effects isolated.

## User Journeys & Acceptance Criteria

### User Journey 1: Visual Calibration Preview

- **Given** an image analysis finishes and returns recommended crop and color adjustments,
- **When** the user switches to the Image Improvement tab,
- **Then** the visual enhancer displays the calibrated crop preview and adjusted filter styles calculated via a single cohesive domain method.

### User Journey 2: Exporting Enhanced PNG

- **Given** an enhanced image preview is displayed,
- **When** the user clicks "Download PNG",
- **Then** the image is rendered onto an offscreen canvas and downloaded immediately as a valid `.png` file with zero HTTP network requests.
