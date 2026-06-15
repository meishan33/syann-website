import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { openai } from "@/lib/openai";
import { analyzeFiveElements } from "@/lib/five-elements";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompts";

type AIRecommendation = {
  selectedCrystals: string[];
  analysisSummary: string;
  crystalExplanations: Record<string, string>;
};

export async function POST(req: NextRequest) {
  try {

    console.log("ANALYZE API HIT");

    const body = await req.json();
    const { fullName, birthDate, birthTime, intention, feeling } = body;

    if (!birthDate) {
      return NextResponse.json({ error: "Birth date is required" }, { status: 400 });
    }

    // ── Five Element Analysis ──────────────────────────────────────────────

    console.log("Analyzing five elements...");
    const analysis = analyzeFiveElements(birthDate, birthTime);
    console.log("Weak Element:", analysis.weakElement, "| Strong:", analysis.strongElement);

    // ── Fetch active crystals ──────────────────────────────────────────────

    const { data: crystals, error: crystalError } = await supabase
      .from("crystals")
      .select("name, primary_element, meaning, energy_tags")
      .eq("active", true);

    if (crystalError || !crystals) {
      console.error("Crystal Fetch Error:", crystalError);
      return NextResponse.json(
        { error: crystalError?.message || "Unable to fetch crystals" },
        { status: 500 }
      );
    }

    // ── AI Crystal Selection + Explanation ────────────────────────────────

    console.log("Running AI crystal selection...");

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserMessage({
            fullName, birthDate, birthTime, intention, feeling,
            weakElement: analysis.weakElement,
            strongElement: analysis.strongElement,
            elementCounts: analysis.elementCounts,
            crystals,
          }),
        },
      ],
    });

    const aiContent = aiResponse.choices[0]?.message?.content;
    if (!aiContent) throw new Error("No response from AI");

    const recommendation: AIRecommendation = JSON.parse(aiContent);
    console.log("AI selected crystals:", recommendation.selectedCrystals);

    // ── Resolve crystal objects from catalog ──────────────────────────────

    const { data: allCrystals } = await supabase
      .from("crystals")
      .select("*")
      .in("name", recommendation.selectedCrystals);

    const recommendedCrystals = recommendation.selectedCrystals
      .map((name) => allCrystals?.find((c) => c.name.toLowerCase() === name.toLowerCase()))
      .filter(Boolean);

    // ── Save result ───────────────────────────────────────────────────────

    console.log("Saving result to Supabase...");

    const { data: savedResult, error: saveError } = await supabaseAdmin
      .from("energy_quiz_results")
      .insert([{
        user_name: fullName || null,
        birth_date: birthDate,
        birth_time: birthTime || null,
        main_goal: intention || null,
        current_feelings: feeling || null,
        calculated_weak_element: analysis.weakElement,
        calculated_strong_element: analysis.strongElement,
        crystal_names: recommendation.selectedCrystals,
        crystal_explanations: recommendation.crystalExplanations,
        analysis_summary: recommendation.analysisSummary,
      }])
      .select()
      .single();

    if (saveError) {
      console.error("Save Error:", saveError);
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    console.log("Saved successfully:", savedResult.id);

    return NextResponse.json({
      id: savedResult.id,
      weakElement: analysis.weakElement,
      strongElement: analysis.strongElement,
      recommendedCrystals,
      crystalExplanations: recommendation.crystalExplanations,
      analysisSummary: recommendation.analysisSummary,
    });

  } catch (error) {
    console.error("Analyze API Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
