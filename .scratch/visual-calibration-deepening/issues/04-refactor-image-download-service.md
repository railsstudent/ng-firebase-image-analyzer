# 04: Refactor Image Download Service to Direct In-Memory Decoding

**What to build:** Remove `HttpClient`, `firstValueFrom`, and the redundant `fetchImageBlob()` method from `ImageDownloadService`. Update `loadImage()` to decode Base64 data URLs directly via `HTMLImageElement.src`, completely eliminating `@angular/common/http` from the application bundles. Audit `VisualCalibrationService` methods (`cropImage`, `sanitizeCrop`, `sanitizeColorAdjustments`, and `getCssFilter`) and make internal/private those no longer needed externally. Add unit test coverage in `image-download.service.spec.ts`.

**Blocked by:** 01 (Create ADR-0027 for In-Memory Image Export and HttpClient Removal)

**Status:** done

- [x] Remove `HttpClient` injection and `import { HttpClient } from '@angular/common/http'` from `src/app/features/image-analysis/services/image-download.service.ts`.
- [x] Remove `import { firstValueFrom } from 'rxjs'` and delete private `fetchImageBlob(url: string)` method.
- [x] Update `loadImage(src: string): Promise<HTMLImageElement>` to set `img.src = src` directly without intermediate blob fetching or `URL.createObjectURL` allocation.
- [x] Maintain memory safety in `triggerFileDownload()` with `try ... finally` revocation of canvas export blob URLs.
- [x] Audit methods in `src/app/features/image-analysis/services/visual-calibration.service.ts`: make `cropImage`, `sanitizeCrop`, and `sanitizeColorAdjustments` `private` methods (since `calibrate()` encapsulates them), and evaluate whether `getCssFilter` can also be privatized if `filterStyle` is supplied directly to the download options.
- [x] Update `visual-calibration.service.spec.ts` if any methods were privatized to test behavior through the public `calibrate()` contract.
- [x] Create `src/app/features/image-analysis/services/image-download.service.spec.ts` testing `downloadFilteredCrop()`, canvas drawing, error handling, and safe PNG filename sanitization with zero HTTP mocks.
- [x] Run `npm run lint` and `npm run test:once` to verify no breaking changes.
