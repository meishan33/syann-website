import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import CheckoutButton from "./CheckoutButton";

type Props = {
  searchParams: Promise<{
    result?: string;
    spacer?: string;
    remark?: string;
  }>;
};

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" };
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

// ── Pricing — update these before going live ──────────────────────────────────
const PRICE_BASE = 188;   // MYR
// ─────────────────────────────────────────────────────────────────────────────

export default async function PaymentPage({ searchParams }: Props) {
  const { result: resultId, spacer = 'silver', remark = '' } = await searchParams;

  if (!resultId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: '#F6F1EB' }}>
        <div className="text-center max-w-md">
          <p style={SERIF} className="text-2xl font-light text-[#4A3A32] mb-4">No order found.</p>
          <Link
            href="/energy-quiz"
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#B08B57] no-underline"
            style={BODY}
          >
            Take the Energy Quiz ✦
          </Link>
        </div>
      </main>
    );
  }

  const { data } = await supabase
    .from("energy_quiz_results")
    .select("crystal_names, cached_image_url")
    .eq("id", resultId)
    .single();

  const crystalNames: string[] = data?.crystal_names ?? [];
  const imageUrl: string | null = data?.cached_image_url ?? null;

  return (
    <main className="min-h-screen bg-[#F6F1EB] text-[#4A3A32]">

      {/* HEADER */}
      <header className="mx-auto max-w-3xl px-6 pt-16 pb-10 text-center">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]" style={BODY}>
          ✦ Almost There
        </p>
        <h1 style={SERIF} className="text-4xl font-light leading-tight text-[#4A3A32] sm:text-5xl">
          Complete Your Order
        </h1>
        <div className="mx-auto mt-6 h-px w-20 bg-[#D9C4A8]" />
      </header>

      {/* ORDER CARD */}
      <section className="mx-auto max-w-xl px-6 pb-24">
        <div className="rounded-[28px] border border-[#E5DDD5] bg-white p-6 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.2)] sm:p-8 flex flex-col gap-6">

          {/* ── Product row ── */}
          <div className="flex gap-5 items-center">
            {imageUrl ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#E5DDD5] bg-[#F8F4EF]">
                <Image src={imageUrl} alt="Your crystal bracelet" fill sizes="80px" className="object-contain" />
              </div>
            ) : (
              <div className="h-20 w-20 shrink-0 rounded-2xl bg-[#EFE7DD] flex items-center justify-center">
                <span className="text-2xl text-[#B08B57] opacity-40">✦</span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <p style={BODY} className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
                SYANN.CO
              </p>
              <p style={SERIF} className="text-xl font-light text-[#4A3A32] leading-snug">
                Your Crystal Bracelet
              </p>
              {crystalNames.length > 0 && (
                <p style={BODY} className="text-[11px] text-[#9A8573] leading-snug">
                  {crystalNames.join(' · ')}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-[#E5DDD5]" />

          {/* ── Order details ── */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <span style={BODY} className="text-[12px] text-[#7A5B45]">Spacer Colour</span>
              <span style={BODY} className="text-[12px] font-medium text-[#4A3A32] capitalize">{spacer}</span>
            </div>
            {remark && (
              <div className="flex justify-between gap-6">
                <span style={BODY} className="text-[12px] text-[#7A5B45] shrink-0">Remarks</span>
                <span style={BODY} className="text-[12px] font-medium text-[#4A3A32] text-right">{remark}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-[#E5DDD5]" />

          {/* ── Pricing ── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between">
              <span style={BODY} className="text-[12px] text-[#7A5B45]">Crystal Bracelet</span>
              <span style={BODY} className="text-[12px] text-[#4A3A32]">RM {PRICE_BASE}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#E5DDD5]">
              <span style={SERIF} className="text-[15px] font-light text-[#4A3A32]">Total</span>
              <span style={SERIF} className="text-[20px] font-light text-[#4A3A32]">RM {PRICE_BASE}</span>
            </div>
          </div>

          <div className="h-px bg-[#E5DDD5]" />

          {/* ── Checkout button ── */}
          <CheckoutButton resultId={resultId} spacer={spacer} remark={remark} />

          {/* ── Back link ── */}
          <p className="text-center -mt-3">
            <Link
              href={`/results/${resultId}`}
              style={BODY}
              className="text-[11px] text-[#9A8573] no-underline transition-opacity hover:opacity-70"
            >
              ← Back to your bracelet
            </Link>
          </p>

        </div>
      </section>

    </main>
  );
}
