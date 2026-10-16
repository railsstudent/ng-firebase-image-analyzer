# 06: Establish Math and Time Constants and Retire Metrics Constant

**What to build:** Replace the ambiguous and generic metrics constant file with domain-accurate mathematical and temporal constants, while deleting the obsolete metrics file to trigger compiler feedback on outstanding call sites.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Create `math.const.ts` in core constants exporting `PERCENT_FACTOR = 100` for fractional ratio to percentage scaling.
- [x] Create `time.const.ts` in core constants exporting `MS_PER_SECOND = 1000`, `SECONDS_PER_MINUTE = 60`, `MINUTES_PER_HOUR = 60`, and `ONE_HOUR_MS` as a computed duration.
- [x] Delete `metrics.const.ts` from core constants.
- [x] Verify exports compile cleanly in isolation.
