export interface ClampOptions {
  value: number | undefined | null;
  min: number;
  max: number;
  fallback: number;
}
