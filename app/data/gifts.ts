import { m } from '../i18n.ts'

// Placeholders until the couple provides real details.
export const giftAccounts: { id: string; label: () => string; value: string | string[] }[] = [
  { id: 'gt', label: m.gift_guatemala, value: '[Banco] · [número]' },
  { id: 'uk', label: m.gift_uk, value: '[00-00-00] · [número]' },
  { id: 'us', label: m.gift_us, value: ['Zelle · lopze.94@gmail.com', 'Venmo · @josue_lopez'] },
]
