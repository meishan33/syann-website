// 7 bracelet layouts for 19 beads (9 primary / 6 secondary / 4 accent).
// Each layout is an index sequence: 0=primary, 1=secondary, 2=accent.
// variant is derived from the result ID so the same reading always shows the same design.

export type BeadSequence = string[]

type Idx = 0 | 1 | 2

const LAYOUTS: Idx[][] = [
  // 0: Banded — three continuous arcs
  [0,0,0,0,0,0,0,0,0, 1,1,1,1,1,1, 2,2,2,2],

  // 1: Symmetric — primary anchors top and bottom poles; secondary and accent fill the sides
  [0,0,0,0, 1,1,1, 2,2, 0,0,0,0,0, 1,1,1, 2,2],

  // 2: Cardinal — accent at four compass points; crystals cluster between
  [2,0,0,1,0, 2,0,0,0,1, 2,0,0,1,1, 2,1,1,0],

  // 3: Crown — accent beads crown the top; primary and secondary fill in groups
  [2,2,2,0,0,0,1,1, 0,0,0,1,1, 0,0,0,1,1, 2],

  // 4: Pinwheel — two repeating PPP-SS-AA groups
  [0,0,0,1,1,2,2, 0,0,0,1,1,2,2, 0,0,0,1,1],

  // 5: Heartbeat — accent separates four rhythmic crystal sections
  [2,0,0,0,0, 2,0,0,1,1, 2,0,0,1,1, 2,1,1,0],

  // 6: Crescent — primary fills one half; secondary and accent form a crescent
  [0,0,0,0,0,0,0,0,0, 1,1,1,2,2,2,2,1,1,1],
]

export function generateBeadSequence(
  crystals: [string, string, string],
  variant: number
): BeadSequence {
  const layout = LAYOUTS[variant % LAYOUTS.length]
  return layout.map(i => crystals[i])
}
