'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CurrencyCode, currencyForCountry, detectCurrency, formatPrice } from '@/lib/currency'

type Rates = Record<string, number>

type CurrencyContextType = {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  convert: (sgdAmount: number) => number
  format: (sgdAmount: number) => string
  ready: boolean
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'SGD',
  setCurrency: () => {},
  convert: x => x,
  format: x => `S$${x.toFixed(2)}`,
  ready: false,
})

export function CurrencyProvider({ children, initialCountry }: { children: ReactNode; initialCountry?: string | null }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(
    initialCountry ? currencyForCountry(initialCountry) : 'SGD'
  )
  const [rates, setRates] = useState<Rates>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('syann_currency') as CurrencyCode | null
    // Priority: saved preference > server-detected IP location (initialCountry, already
    // applied above) > browser language as a last resort when geo data isn't available
    // (e.g. local dev, where Vercel's IP-geolocation headers don't exist).
    if (saved) setCurrencyState(saved)
    else if (!initialCountry) setCurrencyState(detectCurrency())

    fetch('https://open.er-api.com/v6/latest/SGD')
      .then(r => r.json())
      .then(data => { if (data.rates) setRates(data.rates) })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c)
    localStorage.setItem('syann_currency', c)
  }

  function convert(sgdAmount: number): number {
    if (currency === 'SGD' || !rates[currency]) return sgdAmount
    return sgdAmount * rates[currency]
  }

  function format(sgdAmount: number): string {
    return formatPrice(convert(sgdAmount), currency)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, ready }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
