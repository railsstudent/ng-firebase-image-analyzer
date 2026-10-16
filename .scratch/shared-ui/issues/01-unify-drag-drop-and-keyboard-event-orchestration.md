# 01: Unify drag-drop, keyboard event orchestration, and file ingestion in ImageUploaderComponent

**What to build:** Streamline and deepen event orchestration across the image uploader panel. Eliminate redundant DOM event prevention by consolidating drag-over and drag-leave handling into a single parameterized drag-state handler that drops directly delegate to. Unify Enter/Space panel activation into a single file picker trigger with optional event default prevention, keeping templates declarative without coupling to `viewChild`. Consolidate fragmented file ingestion by routing drag-drop and file input selection through a reusable `handleFileList` pipeline and encapsulating `handleFile` as a private method. Prevent dragleave flickering across child element boundaries.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Consolidate `onDragOver` and `onDragLeave` into a single `onDragState(event: DragEvent, isDragging: boolean):void` method that encapsulates `event.preventDefault()`, `event.stopPropagation()`, and `this.isDragging.set(isDragging)`.
- [x] Refactor `onDrop(event: DragEvent)` to delegate directly to `this.onDragState(event, false)` and pass `event.dataTransfer?.files` to `this.handleFileList(...)`.
- [x] Update `openFilePicker(fileInput: HTMLInputElement, event?: Event)` to support an optional event parameter and invoke `event?.preventDefault()`.
- [x] Consolidate `handleFileList` and `handleFile` into a single private `handleFile(files?: FileList | null): Promise<void>` method that safely unpacks `files?.[0]` and encapsulates validation/reading.
- [x] Refactor `onDrop(event: DragEvent)` and `onFileSelected(event: Event)` to delegate directly to `this.handleFile(...)`.
- [x] Update the component template `uploader-panel` bindings:
  - Bind `(dragover)="onDragState($event, true)"`
  - Bind `(dragleave)="onDragState($event, false)"`
  - Bind `(drop)="onDrop($event)"`
  - Bind `(click)="openFilePicker(fileInput)"`
  - Bind `(keydown.enter)="openFilePicker(fileInput)"`
  - Bind `(keydown.space)="openFilePicker(fileInput, $event)"`
- [x] Prevent dragleave flickering across child boundaries inside `.uploader-panel` by adding `pointer-events-none` to `.empty-state` and preview child wrappers.
- [x] Update and verify test suites in `image-uploader.component.spec.ts` across keyboard interactions (Enter, Space), click activation, file input selection, drop events, and drag-and-drop state transitions.
- [x] Verify test suite passes (`npm run test:once` or Vitest test runner) and linter passes with zero errors.
