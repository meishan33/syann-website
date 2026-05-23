import Link from "next/link";

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" };
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

const GOLD = '#B08B57';
const GOLD_FAINT = 'rgba(176,139,87,0.35)';

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#F6F1EB] text-[#4A3A32] flex items-center justify-center px-6">
      <div className="text-center max-w-md">

        {/* Gold diamond ornament */}
        <svg className="mx-auto mb-7" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <polygon points="16,0 32,16 16,32 0,16" fill={GOLD} opacity="0.75" />
        </svg>

        <p style={BODY} className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#B08B57]">
          Order Confirmed
        </p>

        <h1 style={SERIF} className="text-4xl font-light leading-tight text-[#4A3A32] sm:text-5xl mb-5">
          Thank You for Your Order
        </h1>

        {/* Ornamental divider */}
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${GOLD_FAINT})` }} />
          <svg width="6" height="6" viewBox="0 0 8 8" aria-hidden="true">
            <polygon points="4,0 8,4 4,8 0,4" fill={GOLD} opacity="0.65" />
          </svg>
          <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${GOLD_FAINT})` }} />
        </div>

        <p style={BODY} className="text-[13px] leading-[1.85] text-[#7A5B45] mb-2">
          Your crystal bracelet is being prepared with care.
        </p>
        <p style={BODY} className="text-[13px] leading-[1.85] text-[#7A5B45] mb-10">
          A confirmation email will be sent to you shortly.
        </p>

        <Link
          href="/"
          style={BODY}
          className="inline-flex items-center gap-2.5 rounded-full bg-[#4A3A32] px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-white transition-colors no-underline hover:bg-[#B08B57]"
        >
          Return Home
          <span aria-hidden="true">✦</span>
        </Link>

      </div>
    </main>
  );
}
