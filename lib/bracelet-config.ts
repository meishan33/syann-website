// Single source of truth for bead composition — every place that needs to know
// the required Primary/Secondary/Accent counts imports from here, so changing
// the count only ever requires editing this one file (plus reseeding the actual
// design patterns in the bracelet_designs table, which have a fixed length and
// can't be auto-derived).
export const BEAD_COUNTS: readonly [number, number, number] = [9, 7, 5] // primary, secondary, accent
export const TOTAL_BEADS = BEAD_COUNTS[0] + BEAD_COUNTS[1] + BEAD_COUNTS[2]
