# Ticket 03: Extract Dummy Image Utility for AI Model Pre-warming

**What to build:**
Extract the HTML5 canvas creation and black JPEG dummy image packaging logic from `AiService` into an internal, standalone platform utility function (`createDummyImagePart`). This helper renders a solid black canvas of specified or fallback dimensions (`FALLBACK_IMAGE_SIZE`) and formats it into a Gemini `Part` (`inlineData`) object for WebGPU shader pre-compilation during model pre-warming, accompanied by full unit test coverage.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

## Scope of Work

1. Create `src/app/core/firebase/dummy-image.util.ts`:
   - Implement `createDummyImagePart(doc: Document, size?: number): Part`.
   - Use `FALLBACK_IMAGE_SIZE` when `size` is unspecified.
   - Draw black rectangle on a canvas element created via the injected `Document`.
   - Export strictly within the internal package; do NOT export in `src/app/core/firebase/index.ts`.
2. Create `src/app/core/firebase/dummy-image.util.spec.ts`:
   - Verify canvas creation using custom and default fallback dimensions.
   - Verify 2D context drawing commands (`fillStyle = '#000000'`, `fillRect`).
   - Verify returned `Part` structure has `{ type: 'inlineData', inlineData: { data, mimeType: 'image/jpeg' } }`.
3. Verify with:
   - `npx vitest run src/app/core/firebase/dummy-image.util.spec.ts`
   - `npx ng lint`
   - `npm run check:cycles`
   - `npm run cspell`

## Acceptance Criteria

- [ ] `createDummyImagePart` generates a valid Gemini `inlineData` `Part` object containing a base64-encoded JPEG from a DOM canvas.
- [ ] Uses default `FALLBACK_IMAGE_SIZE` when size is omitted.
- [ ] Internal utility is not exposed via `src/app/core/firebase/index.ts`.
- [ ] Unit tests pass with 100% branch and function coverage.
