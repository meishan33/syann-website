import type Stripe from 'stripe'

type AllowedCountry = NonNullable<Stripe.Checkout.SessionCreateParams['shipping_address_collection']>['allowed_countries'][number]

export const FREE_SHIPPING_COUNTRIES = new Set(['SG', 'MY'])
export const SHIPPING_FEE_CENTS = 1000 // SGD 10.00

// Detected via IP geolocation (Vercel's x-vercel-ip-country header) — this is the
// customer's apparent browsing location, not a guaranteed match to the address they
// later enter at Stripe (e.g. buying a gift shipped to a different country). Same
// tradeoff already accepted for currency display; defaults to the paid fee when the
// country can't be detected (e.g. local dev), since under-charging is the worse error.
export function getShippingFeeCents(countryCode: string | null | undefined): number {
  if (countryCode && FREE_SHIPPING_COUNTRIES.has(countryCode.toUpperCase())) return 0
  return SHIPPING_FEE_CENTS
}

// Full ISO 3166-1 alpha-2 list of countries Stripe Checkout supports for shipping
// address collection — used to allow worldwide shipping (Stripe requires an explicit
// list, there's no "all countries" wildcard).
export const ALL_SHIPPING_COUNTRIES: AllowedCountry[] = [
  'AC','AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AT','AU','AW','AX','AZ',
  'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ',
  'CA','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CV','CW','CY','CZ',
  'DE','DJ','DK','DM','DO','DZ',
  'EC','EE','EG','EH','ER','ES','ET',
  'FI','FJ','FK','FO','FR',
  'GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY',
  'HK','HN','HR','HT','HU',
  'ID','IE','IL','IM','IN','IO','IQ','IS','IT',
  'JE','JM','JO','JP',
  'KE','KG','KH','KI','KM','KN','KR','KW','KY','KZ',
  'LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY',
  'MA','MC','MD','ME','MF','MG','MK','ML','MM','MN','MO','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ',
  'NA','NC','NE','NG','NI','NL','NO','NP','NR','NU','NZ',
  'OM',
  'PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PY',
  'QA',
  'RE','RO','RS','RU','RW',
  'SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SZ',
  'TA','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ',
  'UA','UG','US','UY','UZ',
  'VA','VC','VE','VG','VN','VU',
  'WF','WS',
  'XK',
  'YE','YT',
  'ZA','ZM','ZW','ZZ',
]
