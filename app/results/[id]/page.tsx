import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResultsPage({
  params,
}: Props) {

  // ============================================
  // GET DYNAMIC ROUTE ID
  // ============================================

  const { id } = await params;

  // ============================================
  // FETCH QUIZ RESULT
  // ============================================

  const { data, error } = await supabase
    .from("energy_quiz_results")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#F6F1EB] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-[#4A3A32] mb-4">
            Unable to Load Your Results
          </h1>

          <p className="text-[#7A5B45] mb-8">
            Your personalized crystal analysis could not be found.
          </p>

          <Link
            href="/energy-quiz"
            className="inline-flex items-center justify-center rounded-full bg-[#B08B57] px-8 py-4 text-white transition hover:bg-[#9A7748]"
          >
            Return to Energy Quiz
          </Link>
        </div>
      </main>
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
    <main className="min-h-screen bg-[#F6F1EB] text-[#4A3A32]">

      {/* ========================================
          HERO SECTION
      ========================================= */}

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">

        <p className="uppercase tracking-[0.35em] text-sm text-[#B08B57] mb-5">
          Personalized Energy Alignment
        </p>

        <h1 className="text-5xl md:text-6xl font-serif leading-tight mb-6">
          Your Crystal Bracelet
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#7A5B45] leading-relaxed">
          Curated through Five Elements wisdom and
          designed to support harmony, confidence,
          and emotional balance.
        </p>

      </section>

      {/* ========================================
          GENERATED BRACELET IMAGE
      ========================================= */}

      <section className="max-w-5xl mx-auto px-6 mt-10">

        <div className="bg-white rounded-[36px] p-6 md:p-10 shadow-sm">

          {data.cached_image_url ? (

            <div className="relative aspect-square w-full overflow-hidden rounded-[28px]">

              <Image
                src={data.cached_image_url}
                alt="Personalized Crystal Bracelet"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />

            </div>

          ) : (

            <div className="aspect-square flex items-center justify-center rounded-[28px] bg-[#EFE7DD] text-[#7A5B45]">
              Bracelet preview unavailable
            </div>

          )}

        </div>

      </section>

      {/* ========================================
          ELEMENT ANALYSIS
      ========================================= */}

      <section className="max-w-3xl mx-auto px-6 mt-24 text-center">

        <p className="uppercase tracking-[0.25em] text-sm text-[#B08B57] mb-4">
          Your Elemental Analysis
        </p>

        <h2 className="text-4xl font-serif mb-8">
          Weak Element:
          {" "}
          <span className="capitalize text-[#B08B57]">
            {data.calculated_weak_element}
          </span>
        </h2>

        <p className="text-lg leading-relaxed text-[#7A5B45]">
          {data.analysis_summary}
        </p>

      </section>

      {/* ========================================
          RECOMMENDED CRYSTALS
      ========================================= */}

      <section className="max-w-7xl mx-auto px-6 mt-28">

        <div className="text-center mb-14">

          <p className="uppercase tracking-[0.25em] text-sm text-[#B08B57] mb-4">
            Crystal Recommendations
          </p>

          <h2 className="text-4xl md:text-5xl font-serif">
            Curated For Your Energy
          </h2>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {crystals?.map((crystal) => (

            <div
              key={crystal.id}
              className="bg-white rounded-[30px] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >

              {/* Crystal Image */}

              <div className="relative aspect-square mb-6">

                <Image
                  src={crystal.bead_image_url}
                  alt={crystal.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain"
                />

              </div>

              {/* Crystal Name */}

              <h3 className="text-2xl font-serif text-center mb-2">
                {crystal.name}
              </h3>

              {/* Element */}

              <p className="text-center uppercase tracking-[0.25em] text-xs text-[#B08B57] mb-4">
                {crystal.element}
              </p>

              {/* Meaning */}

              <p className="text-sm leading-relaxed text-center text-[#7A5B45]">
                {crystal.meaning}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* ========================================
          CTA SECTION
      ========================================= */}

      <section className="max-w-3xl mx-auto px-6 mt-28 pb-24 text-center">

        <div className="bg-white rounded-[36px] p-10 md:p-14 shadow-sm">

          <p className="uppercase tracking-[0.25em] text-sm text-[#B08B57] mb-4">
            Personalized Bracelet
          </p>

          <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            Designed For Your Energy Journey
          </h2>

          <p className="text-lg text-[#7A5B45] leading-relaxed mb-10">
            Your bracelet was curated to support
            energetic harmony and emotional alignment
            through carefully selected crystal
            combinations inspired by Five Elements wisdom.
          </p>

          <button className="inline-flex items-center justify-center rounded-full bg-[#B08B57] px-10 py-4 text-white text-lg transition-all duration-300 hover:bg-[#9A7748] hover:scale-[1.02]">
            Create My Bracelet
          </button>

        </div>

      </section>

    </main>
  );
}