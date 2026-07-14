# 14. Converting Image Download Parameters to a Cohesive Options Object

We decided to refactor the parameter signature of the image download orchestrator from individual parameters to a single structured parameter object (Options Bag), resolving a data clump code smell and preparing the API for future extensibility.

## Context

The `ImageDownloadService` exposes a method:

```typescript
async downloadFilteredCrop(url: string, crop: Crop, filter: ColorAdjustment | undefined, filename: string): Promise<void>
```

While functional, passing four distinct, closely related values across the service boundary is a classic **Data Clump** code smell. This has several drawbacks:

1. **Poor Extensibility**: If we need to support options like file format (e.g., JPEG/WebP), export quality, or custom resolution scales in the future, we would have to break the method signature.
2. **Call-site Readability**: Long positional parameter lists are prone to ordering mistakes, especially when multiple parameters share identical types (e.g., strings for `url` and `filename`).
3. **Coupled Signatures**: The consumer directive and any test mocks must mirror this positional order, increasing maintenance overhead.

## Decision

We will implement the following changes to introduce a clean **Options Bag** pattern:

1. **Separate Type Declaration**: Define a new, dedicated `ImageDownloadOptions` interface inside `src/app/features/image-analysis/types/image-download-options.type.ts`.
2. **Service Refactoring**: Update `ImageDownloadService.downloadFilteredCrop` to accept a single parameter of type `ImageDownloadOptions`.
3. **Balanced Directive Inputs**: Keep individual reactive inputs (`imageUrl`, `crop`, `filter`) on `DownloadEnhancedDirective` for simple, intuitive HTML template binding, but have the directive bundle these properties into the `ImageDownloadOptions` object before calling the service.

## Consequences & Trade-offs

* **Strong Extensibility**: Future features (quality, format, dimensions) can be added as optional fields on `ImageDownloadOptions` without breaking any existing clients or signatures.
* **Self-Documenting Code**: Calling code uses clear key-value structure:

  ```typescript
  this.downloadService.downloadFilteredCrop({ url, crop, filter, filename });
  ```

* **No Template Pollution**: The templates continue to bind clean, individual signals to inputs. The directive acts as the cohesive mapper that translates individual bindings into the service parameter object.
