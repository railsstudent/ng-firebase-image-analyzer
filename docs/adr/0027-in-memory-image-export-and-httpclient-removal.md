# 0027. In-Memory Image Export and HttpClient Removal

Date: 2026-10-13
Status: Accepted
Amends: [ADR-0013](0013-image-download-directive-and-service.md)

## Context

In [ADR-0013](0013-image-download-directive-and-service.md), image downloading was extracted from `EnhancedCanvas` into `ImageDownloadService` and `DownloadEnhancedDirective`. To handle image fetching, ADR-0013 introduced Angular's `HttpClient` into `ImageDownloadService.fetchImageBlob()`.

However, analysis of application image data flows revealed two significant architectural issues:

1. **Redundant Network Abstraction on In-Memory Data**:
   - In this application, image data URLs are loaded client-side via `FileReader.readAsDataURL(file)` in `ImageUploaderComponent`.
   - The `imageUrl` passed to `ImageDownloadService` is an in-memory Base64 data URL (`data:image/...;base64,...`).
   - `HttpClient.get(url, { responseType: 'blob' })` was invoked on this data URL, converting it into a `Blob`.
   - `loadImage(blob)` immediately converted that `Blob` back into an object URL via `URL.createObjectURL(blob)`, and finally assigned it to `HTMLImageElement.src`.
   - This resulted in a circular conversion: `Data URL -> Blob via HttpClient -> Object URL via URL.createObjectURL -> Image element`.

2. **Bundle Overhead via Unused `@angular/common/http`**:
   - `ImageDownloadService` was the **sole consumer** of `@angular/common/http` and RxJS `firstValueFrom` in the entire application.
   - Because of this single dependency, Angular's complete HTTP client infrastructure (interceptors, backend, JSON parsers, XSRF protection) was bundled into the application chunks (~10–15 KB uncompressed), degrading download and parse times.

3. **Memory Lifecycle Management**:
   - The intermediate Object URL generated from the fetched Blob required tracking and manual cleanup. By assigning the Base64 data URL or image source directly to `HTMLImageElement.src`, no intermediate object URL is created during image loading.

## Decision

1. **Remove `HttpClient` and RxJS `firstValueFrom`**:
   - Remove `HttpClient` injection from `ImageDownloadService`.
   - Delete `fetchImageBlob()` and RxJS `firstValueFrom`.
   - Completely evict `@angular/common/http` from the application bundle.

2. **Direct In-Memory Image Loading**:
   - Refactor `loadImage(src: string): Promise<HTMLImageElement>` to assign `img.src = src` directly.
   - Await the native `onload` and `onerror` events via standard Promise semantics.
   - Support both Base64 data URLs and standard URLs without creating intermediate Blobs or object URLs.

3. **Retain Clean Presentation Seam and Memory-Safe Canvas Export**:
   - Keep `DownloadEnhancedDirective` (`[appDownloadEnhanced]`) as the declarative trigger on the UI button, maintaining pure presentation separation in `EnhancedCanvasComponent`.
   - Continue using offscreen `HTMLCanvasElement` to apply CSS color adjustments and bounding-box crops before exporting.
   - Maintain `try ... finally` memory safety around the final canvas export `URL.createObjectURL(blob)` and `URL.revokeObjectURL(blob)` during anchor download triggering.
   - Retain PNG as the lossless export format to preserve visual fidelity after color and crop adjustments.

## Consequences

- **Positive**:
  - Evicts `@angular/common/http` from the bundle, saving ~10–15 KB in code size and eliminating HTTP initialization overhead.
  - Eliminates circular data conversion (`Data URL -> Blob -> Object URL -> Image`) during export.
  - Zero network overhead during client-side image enhancement download.
  - Simplifies testing of `ImageDownloadService` by eliminating `HttpClientTestingModule` or HTTP mocks.
- **Negative / Considerations**:
  - If remote image URLs without CORS headers are ever passed to `ImageDownloadService` in the future, standard browser cross-origin canvas security (`tainted canvas`) applies. Because this app analyzes locally uploaded user images (`FileReader`), this is not a concern for the current architecture.
