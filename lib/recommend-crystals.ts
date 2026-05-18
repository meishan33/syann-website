// ============================================
// TYPES
// ============================================

export type Crystal = {
  id: number;

  name: string;

  primary_element: string;

  energy_tags: string[];

  meaning?: string;

  bead_image_url?: string;
};

type RecommendCrystalParams = {
  weakElement: string;

  strongElement: string;

  intention?: string;

  crystals: Crystal[];
};

// ============================================
// HELPER
// ============================================

function normalizeText(text?: string) {
  return text?.toLowerCase().trim() || "";
}

// ============================================
// RECOMMENDATION ENGINE
// ============================================

export function recommendCrystals({
  weakElement,
  strongElement,
  intention,
  crystals,
}: RecommendCrystalParams) {

  const normalizedIntention =
    normalizeText(intention);

  // ============================================
  // SAFETY FILTER
  // ============================================

  const safeCrystals =
    crystals.map((crystal) => {

      const tags = Array.isArray(
        crystal.energy_tags
      )
        ? crystal.energy_tags
        : [];

      return {
        ...crystal,
        energy_tags: tags,
      };
    });

  // ============================================
  // 1 — BALANCING CRYSTAL
  // ============================================

  const balancingCrystal =
    safeCrystals.find((crystal) => {

      const tags =
        crystal.energy_tags.map(
          normalizeText
        );

      return (
        crystal.primary_element ===
          weakElement &&
        crystal.primary_element !==
          strongElement &&
        (
          tags.includes("balance") ||
          tags.includes("healing") ||
          tags.includes("growth") ||
          tags.includes("clarity") ||
          tags.includes("calmness")
        )
      );
    }) ||

    safeCrystals.find((crystal) =>
      crystal.primary_element ===
      weakElement
    );

  // ============================================
  // 2 — INTENTION CRYSTAL
  // ============================================

  const intentionCrystal =
    safeCrystals.find((crystal) => {

      const tags =
        crystal.energy_tags.map(
          normalizeText
        );

      return (
        tags.includes(
          normalizedIntention
        ) &&
        crystal.name !==
          balancingCrystal?.name
      );
    });

  // ============================================
  // 3 — HARMONIZER CRYSTAL
  // ============================================

  const harmonizerPriority = [
    "Clear Quartz",
    "Amethyst",
    "Moonstone",
    "White Jade",
    "Labradorite",
  ];

  const harmonizerCrystal =
    safeCrystals.find(
      (crystal) =>
        harmonizerPriority.includes(
          crystal.name
        ) &&
        crystal.name !==
          balancingCrystal?.name &&
        crystal.name !==
          intentionCrystal?.name
    ) ||

    safeCrystals.find(
      (crystal) =>
        crystal.name !==
          balancingCrystal?.name &&
        crystal.name !==
          intentionCrystal?.name
    );

  // ============================================
  // FINAL RESULTS
  // ============================================

  const finalCrystals = [
    balancingCrystal,
    intentionCrystal,
    harmonizerCrystal,
  ].filter(Boolean);

  // ============================================
  // REMOVE DUPLICATES
  // ============================================

  const uniqueCrystals =
    Array.from(
      new Map(
        finalCrystals.map(
          (crystal) => [
            crystal?.name,
            crystal,
          ]
        )
      ).values()
    );

  // ============================================
  // ENSURE MINIMUM 3 CRYSTALS
  // ============================================

  if (uniqueCrystals.length < 3) {

    const additionalCrystals =
      safeCrystals.filter(
        (crystal) =>
          !uniqueCrystals.some(
          (selected) =>
           selected?.name ===
           crystal.name
        )&&
          crystal.primary_element !==
            strongElement
      );

    uniqueCrystals.push(
      ...additionalCrystals.slice(
        0,
        3 - uniqueCrystals.length
      )
    );
  }

  // ============================================
  // RETURN FINAL 3
  // ============================================

  return uniqueCrystals.slice(0, 3);
}