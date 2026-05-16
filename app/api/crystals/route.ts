import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("crystals")
      .select(`
        id,
        name,
        slug,
        element,
        meaning,
        bead_image_url,
        luxury_score
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase Error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (err) {
    console.error("API Error:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}