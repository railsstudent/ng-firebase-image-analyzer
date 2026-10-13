# 01: Create ADR-0027 for In-Memory Image Export and HttpClient Removal

**What to build:** Record the architectural decision to remove `HttpClient` from `ImageDownloadService` in a new ADR (`docs/adr/0027-in-memory-image-export-and-httpclient-removal.md`), explaining that in-memory Base64 data URLs make `HttpClient` redundant and that eliminating it evicts `@angular/common/http` from the application bundle. Update `docs/adr/0013-image-download-directive-and-service.md` with an amendment cross-reference.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Create `docs/adr/0027-in-memory-image-export-and-httpclient-removal.md` following standard repository ADR format (Title, Status: Accepted, Date, Authors, Context, Decision, Consequences).
- [x] Document the eviction of `@angular/common/http` and RxJS `firstValueFrom` as a bundle size optimization.
- [x] Update `docs/adr/0013-image-download-directive-and-service.md` with an "Amended by ADR-0027" note and markdown link.
