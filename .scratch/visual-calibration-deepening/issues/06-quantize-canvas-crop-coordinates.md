# 06: Quantize Canvas Crop Coordinates to Integer Pixels

**What to build:** Quantize canvas pixel dimensions (`cropWidth`, `cropHeight`) and source raster coordinates (`sx`, `sy`) to exact integer pixels in `ImageDownloadService.renderCroppedCanvas` using `Math.round()`. This prevents fractional pixel sub-rendering, eliminates bilinear anti-aliasing edge blurring artifacts when exporting cropped bitmaps, and ensures canvas buffer allocation (`canvas.width`, `canvas.height`) and spec assertions do not suffer from IEEE-754 floating-point drift (e.g., `(0.8 - 0.2) * 500 = 300.00000000000006`). Add unit test coverage in `image-download.service.spec.ts` with floating-point crop inputs.

**Blocked by:** 04 (Refactor Image Download Service to Direct In-Memory Decoding)

**Status:** todo

- [ ] In `src/app/features/image-analysis/services/image-download.service.ts`:
  - Calculate `cropWidth` and `cropHeight` with `Math.round()`.
  - Calculate source offsets `sx = Math.round(crop.xMin * img.naturalWidth)` and `sy = Math.round(crop.yMin * img.naturalHeight)`.
  - Assign integer `cropWidth` and `cropHeight` to `canvas.width` and `canvas.height`.
  - Pass integer coordinates (`sx`, `sy`, `cropWidth`, `cropHeight`) into `ctx.drawImage()`.
- [ ] In `src/app/features/image-analysis/services/image-download.service.spec.ts`:
  - Add a dedicated unit test for floating-point crop coordinates that trigger IEEE-754 precision drift (e.g., `xMin: 0.2, xMax: 0.8` on `500px` natural width).
  - Verify exact integer assertions for `mockCanvas.width`, `mockCanvas.height`, and `mockDrawImage` parameters.
- [ ] Run `npm run lint` and `npm run test:once` to verify zero violations and all tests passing.
