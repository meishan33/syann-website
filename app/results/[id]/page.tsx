import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import PurchasePanel from "./PurchasePanel";

type Props = {
  params: Promise<{ id: string }>;
};

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" };

export default async function ResultsPage({ params }: Props) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("energy_quiz_results")
    .select("*")
    .eq("id", id)
    .single();

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
      <header className="mx-auto max-w-7xl px-6 pt-16 pb-12 text-center">

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
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8 lg:items-start">


          {/* ── LEFT: BRACELET IMAGE (3/5) ── */}
          <div className="sticky top-24 lg:col-span-3">

            <div className="overflow-hidden rounded-[28px] border border-[#E5DDD5] bg-white p-5 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.3)] sm:p-7">

              {data.cached_image_url ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[#F8F4EF]">
                  <Image
                    src={data.cached_image_url}
                    alt="Your personalized crystal bracelet"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center gap-4 rounded-[20px] bg-[#EFE7DD]">
                  <span className="text-4xl text-[#B08B57] opacity-40">✦</span>
                  <p className="text-sm text-[#9A8573]">Bracelet preview generating…</p>
                </div>
              )}

              <p className="mt-4 text-center text-[10px] uppercase tracking-[0.28em] text-[#9A8573]">
                AI-curated · Five Elements · Handcrafted
              </p>

            </div>

          </div>


          {/* ── RIGHT: ANALYSIS + SIZE + PURCHASE (2/5) ── */}
          <div className="rounded-[28px] border border-[#E5DDD5] bg-white p-5 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.2)] sm:p-6 lg:col-span-2">

            <PurchasePanel
              weakElement={data.calculated_weak_element ?? "—"}
              analysisSummary={data.analysis_summary ?? ""}
              resultId={id}
            />

          </div>


        </div>
      </section>

    </main>
  );
}
