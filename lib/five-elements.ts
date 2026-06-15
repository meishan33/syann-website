import { Solar } from "lunar-javascript";

// Generating cycle (相生): each element is nourished by the one before it
// water → wood → fire → earth → metal → water
const GENERATING_PARENT: Record<string, string> = {
  wood:  'water',
  fire:  'wood',
  earth: 'fire',
  metal: 'earth',
  water: 'metal',
}

export function supportingElement(weak: string): string {
  return GENERATING_PARENT[weak] ?? weak
}

type FiveElementResult = {
  weakElement: string;
  strongElement: string;
  supportingElement: string;
  elementCounts: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
};

export function analyzeFiveElements(
  birthDate: string,
  birthTime?: string
): FiveElementResult {

  // Parse date
  const [year, month, day] = birthDate
    .split("-")
    .map(Number);

  // Default time if user skips birth time
  let hour = 12;
  let minute = 0;

  if (birthTime) {
    const [h, m] = birthTime.split(":").map(Number);

    hour = h;
    minute = m;
  }

  // Create solar object
  const solar = Solar.fromYmdHms(
    year,
    month,
    day,
    hour,
    minute,
    0
  );

  // Convert to lunar
  const lunar = solar.getLunar();

  // Get BaZi
  const baZi = lunar.getEightChar();

  // Get Five Elements
  const elements = [
    baZi.getYearWuXing(),
    baZi.getMonthWuXing(),
    baZi.getDayWuXing(),
    baZi.getTimeWuXing(),
  ].join("");

  // Count elements
  const counts = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // Count occurrences
  for (const char of elements) {
    if (char === "木") counts.wood++;
    if (char === "火") counts.fire++;
    if (char === "土") counts.earth++;
    if (char === "金") counts.metal++;
    if (char === "水") counts.water++;
  }

  // Weakest element
  const weakElement = Object.entries(counts)
    .sort((a, b) => a[1] - b[1])[0][0];

  // Strongest element
  const strongElement = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0][0];

  return {
    weakElement,
    strongElement,
    supportingElement: GENERATING_PARENT[weakElement] ?? weakElement,
    elementCounts: counts,
  };
}