import { supabase } from "@/lib/supabase";

import Image from "next/image";

type Props = {
  params: {
    id: string;
  };
};

export default async function ResultsPage({
  params,
}: Props) {

  // ============================================
  // FETCH QUIZ RESULT
  // ============================================

  const { data, error } = await supabase
    .from("energy_quiz_results")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F1EB] text-[#4A3A32]">
        Unable to load your personalized result.
      </div>
    );
  }

  // ============================================
  // FETCH RECOMMENDED CRYSTALS
  // ============================================

  const { data: crystals } = await supabase
    .from("crystals")
    .select("*")
    .in("name", data.crystal_names || []);

  return (
    <main className="min-h-screen bg-[#F6F1EB] px-6 py-16 text-[#4A3A32]">

      {/* ========================================
          HERO SECTION
      ========================================= */}

      <section className="max-w-5xl mx-auto text-center">

        <p className="uppercase tracking-[0.3em] text-sm text-[#B08B57] mb-4">
          Your Personalized Energy Alignment
        </p>

        <h1 className="text-5xl md:text-6xl font-serif leading-tight mb-6">
          Your Crystal Bracelet
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-[#7A5B45] leading-relaxed">
          Designed through Five Elements analysis
          and curated to support your energetic
          harmony.
        </p>
      </section>

      {/* ========================================
          GENERATED BRACELET IMAGE
      ========================================= */}

      <section className="max-w-4xl mx-auto mt-16">

        <div className="bg-white rounded-[32px] p-6 shadow-sm">

          {data.cached_image_url ? (

            <Image
              src={data.cached_image_url}
              alt="Generated Crystal Bracelet"
              width={1024}
              height={1024}
              className="w-full h-auto rounded-[24px]"
            />

          ) : (

            <div className="aspect-square flex items-center justify-center text-[#7A5B45]">
              Bracelet image unavailable
            </div>

          )}

        </div>
      </section>

      {/* ========================================
          ELEMENT ANALYSIS
      ========================================= */}

      <section className="max-w-3xl mx-auto mt-20 text-center">

        <p className="uppercase tracking-[0.2em] text-sm text-[#B08B57] mb-4">
          Element Analysis
        </p>

        <h2 className="text-3xl font-serif mb-6">
          Your Weak Element:
          {" "}
          <span className="text-[#B08B57] capitalize">
            {data.calculated_weak_element}
          </span>
        </h2>

        <p className="text-lg leading-relaxed text-[#7A5B45]">
          {data.analysis_summary}
        </p>
      </section>

      {/* ========================================
          CRYSTAL RECOMMENDATIONS
      ========================================= */}

      <section className="max-w-6xl mx-auto mt-24">

        <div className="text-center mb-14">

          <p className="uppercase tracking-[0.2em] text-sm text-[#B08B57] mb-4">
            Recommended Crystals
          </p>

          <h2 className="text-4xl font-serif">
            Curated For Your Energy
          </h2>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {crystals?.map((crystal) => (

            <div
              key={crystal.id}
              className="bg-white rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >

              <div className="aspect-square relative mb-6">

                <Image
                  src={crystal.bead_image_url}
                  alt={crystal.name}
                  fill
                  className="object-contain"
                />

              </div>

              <h3 className="text-xl font-serif text-center mb-2">
                {crystal.name}
              </h3>

              <p className="text-sm uppercase tracking-[0.2em] text-center text-[#B08B57] mb-4">
                {crystal.element}
              </p>

              <p className="text-sm text-center text-[#7A5B45] leading-relaxed">
                {crystal.meaning}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* ========================================
          CTA
      ========================================= */}

      <section className="text-center mt-24">

        <button className="bg-[#B08B57] hover:bg-[#9A7748] transition-colors duration-300 text-white px-10 py-4 rounded-full text-lg tracking-wide">
          Create My Bracelet
        </button>

      </section>

    </main>
  );
}