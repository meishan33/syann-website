// Generates a 20-bead sequence from 3 crystals using even distribution.
// Crystal order matters: index 0 = primary (10 beads), 1 = secondary (7), 2 = accent (3).

export type BeadSequence = string[]

function evenDistribute(counts: [number, number, number]): number[] {
  const total = counts.reduce((a, b) => a + b, 0)
  const remaining = [...counts]
  const result: number[] = []

  for (let i = 0; i < total; i++) {
    let bestIdx = 0
    let bestScore = -Infinity
    for (let j = 0; j < 3; j++) {
      if (remaining[j] > 0) {
        const score = remaining[j] / counts[j]
        if (score > bestScore) { bestScore = score; bestIdx = j }
      }
    }
    result.push(bestIdx)
    remaining[bestIdx]--
  }

  return result
}

export function generateBeadSequence(crystals: [string, string, string]): BeadSequence {
  return evenDistribute([10, 7, 3]).map(i => crystals[i])
}
