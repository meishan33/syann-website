'use client'

import { useCurrency } from '@/context/CurrencyContext'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }

export default function PriceSummary({ priceSGD }: { priceSGD: number }) {
  const { format, currency } = useCurrency()

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between">
        <span style={BODY} className="text-[12px] text-[#7A5B45]">Crystal Bracelet</span>
        <span style={BODY} className="text-[12px] text-[#4A3A32]">{format(priceSGD)}</span>
      </div>
      <div className="flex justify-between pt-3 border-t border-[#E5DDD5]">
        <span style={SERIF} className="text-[15px] font-light text-[#4A3A32]">Total</span>
        <span style={SERIF} className="text-[20px] font-light text-[#4A3A32]">{format(priceSGD)}</span>
      </div>
      {currency !== 'SGD' && (
        <p style={BODY} className="text-[10px] text-[#B0A090] text-right -mt-1">Billed in SGD at checkout</p>
      )}
    </div>
  )
}
