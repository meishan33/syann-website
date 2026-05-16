import { NextResponse } from "next/server";

import { analyzeFiveElements } from "@/lib/five-elements";

import { crystalMapping } from "@/lib/crystal-mapping";

export async function GET() {

  const result = analyzeFiveElements(
    "1998-08-12",
    "14:30"
  );

  const recommendedCrystals =
    crystalMapping[result.weakElement];

  return NextResponse.json({
    weakElement: result.weakElement,
    strongElement: result.strongElement,
    recommendedCrystals
  });
}