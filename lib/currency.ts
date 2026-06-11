export const CURRENCIES = [
  { code: 'SGD', symbol: 'S$',  label: 'SGD — Singapore Dollar' },
  { code: 'MYR', symbol: 'RM',  label: 'MYR — Malaysian Ringgit' },
  { code: 'USD', symbol: '$',   label: 'USD — US Dollar' },
  { code: 'AUD', symbol: 'A$',  label: 'AUD — Australian Dollar' },
  { code: 'EUR', symbol: '€',   label: 'EUR — Euro' },
  { code: 'GBP', symbol: '£',   label: 'GBP — British Pound' },
  { code: 'HKD', symbol: 'HK$', label: 'HKD — Hong Kong Dollar' },
  { code: 'JPY', symbol: '¥',   label: 'JPY — Japanese Yen' },
] as const

export type CurrencyCode = typeof CURRENCIES[number]['code']

const EURO_ZONE = new Set([
  'DE','FR','IT','ES','NL','BE','AT','FI','IE','PT','GR','LU','SK','SI','EE','LV','LT','CY','MT',
])
const LOCALE_MAP: Partial<Record<string, CurrencyCode>> = {
  SG: 'SGD', MY: 'MYR', US: 'USD', AU: 'AUD',
  NZ: 'AUD', GB: 'GBP', HK: 'HKD', JP: 'JPY',
}

export function detectCurrency(): CurrencyCode {
  try {
    const region = navigator.language.split('-')[1]?.toUpperCase() ?? ''
    if (EURO_ZONE.has(region)) return 'EUR'
    return LOCALE_MAP[region] ?? 'SGD'
  } catch {
    return 'SGD'
  }
}

export function getCurrencyMeta(code: CurrencyCode) {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0]
}

export function formatPrice(amount: number, code: CurrencyCode): string {
  const { symbol } = getCurrencyMeta(code)
  if (code === 'JPY') return `${symbol}${Math.round(amount).toLocaleString()}`
  return `${symbol}${amount.toFixed(2)}`
}
