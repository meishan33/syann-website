import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Image from "next/image";
import Link from "next/link";
import CheckoutButton from "./CheckoutButton";
import BraceletRenderer from "@/components/BraceletRenderer";
import { generateBeadSequence } from "@/lib/design-engine";

type Props = {
  searchParams: Promise<{
    result?: string;
    spacer?: string;
    remark?: string;
    includeCharm?: string;
  }>;
};

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" };
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

export default async function PaymentPage({ searchParams }: Props) {
  const { result: resultId, spacer = 'silver', remark = '', includeCharm = 'true' } = await searchParams;

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
    .select("crystal_names, cached_image_url, calculated_weak_element, calculated_strong_element, analysis_summary, user_name")
    .eq("id", resultId)
    .single();

  const crystalNames: string[] = data?.crystal_names ?? [];
  const imageUrl: string | null = data?.cached_image_url ?? null;
  const weakElement: string | null = data?.calculated_weak_element ?? null;
  const strongElement: string | null = data?.calculated_strong_element ?? null;
  const analysisSummary: string | null = data?.analysis_summary ?? null;
  const userName: string | null = data?.user_name ?? null;

  const [analysisParagraph, analysisBulletBlock] = analysisSummary ? analysisSummary.split('\n\n') : [null, null];
  const analysisBullets = analysisBulletBlock
    ? analysisBulletBlock.split('\n').filter(l => l.trim().startsWith('•')).map(l => l.replace(/^•\s*/, '').trim())
    : [];

  // cached_image_url is generated server-side right when the quiz analysis
  // completes (see lib/bracelet-image.ts) — it should normally already be
  // set by the time anyone reaches this page. Fall back to the live renderer
  // for older results from before that existed, or the rare generation failure.
  const [c1, c2, c3] = crystalNames;
  let beadSequence: string[] = [];
  let imageMap: Record<string, string[]> = {};
  if (!imageUrl && c1 && c2 && c3) {
    const { data: crystalDetails } = await supabaseAdmin
      .from("crystals")
      .select("name, bead_image_url, bead_image_urls")
      .in("name", crystalNames);
    for (const c of crystalDetails ?? []) {
      if (c.bead_image_urls?.length) imageMap[c.name] = c.bead_image_urls;
      else if (c.bead_image_url) imageMap[c.name] = [c.bead_image_url];
    }
    const variant = parseInt(resultId.replace(/-/g, "")[0], 16);
    beadSequence = await generateBeadSequence([c1, c2, c3], variant);
  }

  const { data: existingOrder } = await supabaseAdmin
    .from("orders")
    .select("order_number")
    .eq("result_id", resultId)
    .eq("payment_status", "paid")
    .maybeSingle();

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

      {/* TWO-COLUMN LAYOUT */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: Bracelet Details ── */}
          <div className="rounded-[28px] border border-[#E5DDD5] bg-white p-6 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.2)] sm:p-8 flex flex-col gap-6">

            {/* Product row */}
            <div className="flex gap-5 items-center">
              {imageUrl ? (
                <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-[#E5DDD5] bg-[#F8F4EF]">
                  <Image src={imageUrl} alt="Your crystal bracelet" fill sizes="144px" className="object-contain" />
                </div>
              ) : beadSequence.length > 0 ? (
                <div className="h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-[#E5DDD5]">
                  <BraceletRenderer sequence={beadSequence} imageMap={imageMap} />
                </div>
              ) : (
                <div className="h-36 w-36 shrink-0 rounded-2xl bg-[#EFE7DD] flex items-center justify-center">
                  <span className="text-3xl text-[#B08B57] opacity-40">✦</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <p style={BODY} className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
                  SYANN.CO
                </p>
                <p style={SERIF} className="text-xl font-light text-[#4A3A32] leading-snug capitalize">
                  {weakElement ? `Your ${weakElement} Harmony Bracelet` : 'Your Crystal Bracelet'}
                </p>
                {crystalNames.length > 0 && (
                  <p style={BODY} className="text-[11px] text-[#9A8573] leading-snug">
                    {crystalNames.join(' · ')}
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-[#E5DDD5]" />

            {/* Order details */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span style={BODY} className="text-[12px] text-[#7A5B45]">Spacer Colour</span>
                <span style={BODY} className="text-[12px] font-medium text-[#4A3A32] capitalize">{spacer}</span>
              </div>
              <div className="flex justify-between">
                <span style={BODY} className="text-[12px] text-[#7A5B45]">Logo Charm</span>
                <span style={BODY} className="text-[12px] font-medium text-[#4A3A32]">
                  {includeCharm === 'true' ? 'Included' : 'Excluded'}
                </span>
              </div>
              {remark && (
                <div className="flex justify-between gap-6">
                  <span style={BODY} className="text-[12px] text-[#7A5B45] shrink-0">Remarks</span>
                  <span style={BODY} className="text-[12px] font-medium text-[#4A3A32] text-right">{remark}</span>
                </div>
              )}
            </div>

            {(weakElement || strongElement || analysisSummary) && (
              <>
                <div className="h-px bg-[#E5DDD5]" />

                {/* Analysis details */}
                <div className="flex flex-col gap-3">
                  <p style={BODY} className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#B08B57]">
                    Your Elemental Analysis
                  </p>
                  {(weakElement || strongElement) && (
                    <p style={BODY} className="text-[12px] text-[#7A5B45]">
                      Weak: <span className="font-medium text-[#4A3A32] capitalize">{weakElement || '—'}</span>
                      {' '}· Strong: <span className="font-medium text-[#4A3A32] capitalize">{strongElement || '—'}</span>
                    </p>
                  )}
                  {analysisParagraph && (
                    <p style={BODY} className="text-[12px] leading-[1.8] text-[#7A5B45]">
                      {userName && analysisParagraph.startsWith(userName)
                        ? <>Dear <span className="font-semibold text-[#4A3A32]">{userName}</span>{analysisParagraph.slice(userName.length)}</>
                        : analysisParagraph}
                    </p>
                  )}
                  {analysisBullets.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      {analysisBullets.map((point, i) => {
                        const match = crystalNames.find(n => point.startsWith(n));
                        return (
                          <div key={i} className="flex items-start gap-2">
                            <span className="mt-[5px] shrink-0 text-[#B08B57]">
                              <svg width="5" height="5" viewBox="0 0 6 6" aria-hidden="true"><circle cx="3" cy="3" r="3" fill="currentColor" /></svg>
                            </span>
                            <p style={BODY} className="text-[12px] leading-[1.8] text-[#7A5B45] m-0">
                              {match
                                ? <><span className="font-semibold text-[#4A3A32]">{match}</span>{point.slice(match.length)}</>
                                : point}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>

          {/* ── RIGHT: Shipping & Payment ── */}
          <div className="rounded-[28px] border border-[#E5DDD5] bg-white p-6 shadow-[0_20px_60px_-30px_rgba(101,70,46,0.2)] sm:p-8 flex flex-col gap-6">

            {existingOrder ? (
              <>
                {/* Already purchased */}
                <div className="text-center py-2">
                  <p style={SERIF} className="text-xl font-light text-[#4A3A32] mb-2">
                    Already Purchased ✦
                  </p>
                  <p style={BODY} className="text-[12px] text-[#7A5B45] leading-relaxed">
                    This bracelet design was already ordered
                    {existingOrder.order_number ? ` (Order #${existingOrder.order_number})` : ''}.
                    <br />No need to pay for it again.
                  </p>
                </div>
                <Link
                  href="/orders"
                  style={BODY}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#4A3A32] bg-[#4A3A32] px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-white no-underline transition-all duration-300 hover:bg-[#B08B57] hover:border-[#B08B57]"
                >
                  View My Orders
                </Link>
              </>
            ) : (
              <CheckoutButton
                resultId={resultId}
                spacer={spacer}
                remark={remark}
                includeCharm={includeCharm === 'true'}
              />
            )}

            {/* Back link */}
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

        </div>
      </section>

    </main>
  );
}
