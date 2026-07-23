import { supabaseAdmin } from "@/lib/supabase-admin";
import Image from "next/image";
import Link from "next/link";
import ResultsClient from "./ResultsClient";
import { generateBeadSequence } from "@/lib/design-engine";

type Props = {
  params: Promise<{ id: string }>;
};

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" };

export default async function ResultsPage({ params }: Props) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("energy_quiz_results")
    .select("*")
    .eq("id", id)
    .single();

  const crystalNames: string[] = data?.crystal_names ?? [];
  const crystalExplanations: Record<string, string> = data?.crystal_explanations ?? {};

  const { data: crystalDetails } = crystalNames.length
    ? await supabaseAdmin
        .from("crystals")
        .select("name, meaning, bead_image_url, bead_image_urls")
        .in("name", crystalNames)
    : { data: [] }

  const { data: spacerCrystals } = await supabaseAdmin
    .from("crystals")
    .select("name, bead_image_url, bead_image_urls")
    .ilike("name", "%spacer%")
    .order("name");

  const imageMap: Record<string, string[]> = {}
  for (const c of crystalDetails ?? []) {
    if (c.bead_image_urls?.length) {
      imageMap[c.name] = c.bead_image_urls
    } else if (c.bead_image_url) {
      imageMap[c.name] = [c.bead_image_url]
    }
  }

  const [c1, c2, c3] = crystalNames
  // Deterministic layout variant from first hex char of result ID —
  // generateBeadSequence takes it mod however many designs are currently active.
  const variant = parseInt(id.replace(/-/g, '')[0], 16)
  const beadSequence = c1 && c2 && c3
    ? await generateBeadSequence([c1, c2, c3], variant)
    : []

  /* ── Error state ── */
  if (error || !data) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#F6F1EB", color: "#4A3A32" }}
      >
        <div className="text-center max-w-md">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
            Something went wrong
          </p>
          <h1 style={SERIF} className="text-3xl font-light mb-4">
            Unable to Load Your Results
          </h1>
          <p className="text-[#7A5B45] text-sm leading-relaxed mb-8">
            Your personalized crystal analysis could not be found.
            Please try the quiz again.
          </p>
          <Link
            href="/energy-quiz"
            className="inline-flex items-center gap-2 rounded-full bg-[#B08B57] px-8 py-3.5 text-[12px] font-medium uppercase tracking-[0.28em] text-white transition-colors hover:bg-[#7A5B45]"
          >
            Return to Energy Quiz
          </Link>
        </div>
      </main>
    );
  }

  /* ── Results page ── */
  return (
    <main className="min-h-screen bg-[#F6F1EB] text-[#4A3A32]">

      {/* PAGE HEADER */}
      <header className="mx-auto max-w-[1280px] px-6 pt-16 pb-12 text-center">

        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
          ✦ Your Personalized Crystal Bracelet
        </p>

        <h1
          style={SERIF}
          className="text-4xl font-light leading-tight text-[#4A3A32] sm:text-5xl"
        >
          Designed for Your Energy
        </h1>

        <div className="mx-auto mt-6 h-px w-20 bg-[#D9C4A8]" />

      </header>


      {/* TWO-COLUMN LAYOUT */}
      <section className="mx-auto max-w-[1280px] px-6 pb-24">
        <ResultsClient
          beadSequence={beadSequence}
          imageMap={imageMap}
          cachedImageUrl={data.cached_image_url ?? null}
          analysisSummary={data.analysis_summary ?? ""}
          crystalNames={crystalNames}
          userName={data.user_name ?? null}
          resultId={id}
          weakElement={data.calculated_weak_element ?? null}
          strongElement={data.calculated_strong_element ?? null}
          spacers={spacerCrystals ?? []}
        />
      </section>


      {/* CRYSTAL COMPANIONS */}
      {crystalDetails && crystalDetails.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-6 pb-24">

          <div className="mb-10 text-center">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
              ✦ Your Crystal Companions
            </p>
            <h2 style={SERIF} className="text-3xl font-light text-[#4A3A32] sm:text-4xl">
              Chosen for Your Energy
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {crystalNames.map((name) => {
              const crystal = crystalDetails.find((c) => c.name === name);
              const explanation = crystalExplanations[name];
              if (!crystal) return null;
              return (
                <div
                  key={name}
                  className="flex flex-col rounded-[24px] border border-[#E5DDD5] bg-white p-6 shadow-[0_10px_40px_-20px_rgba(101,70,46,0.15)]"
                >
                  {crystal.bead_image_url && (
                    <div className="relative mb-5 h-24 w-24 self-center overflow-hidden rounded-full border border-[#EDE5DB] bg-[#F8F4EF]">
                      <Image
                        src={crystal.bead_image_url}
                        alt={crystal.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[#B08B57]">
                    {crystal.meaning}
                  </p>

                  <h3 style={SERIF} className="mb-3 text-2xl font-light text-[#4A3A32]">
                    {crystal.name}
                  </h3>

                  {explanation && (
                    <p className="text-[13px] leading-[1.85] text-[#7A5B45]">
                      {explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </section>
      )}

    </main>
  );
}
