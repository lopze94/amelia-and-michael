import { m } from '../i18n.ts'

export interface GiftOption {
  name: () => string
  // Plain lines of text (account numbers, handles).
  lines?: () => string[]
  // A payment link, shown as a button instead of text.
  href?: string
}

export interface GiftCountry {
  id: string
  label: () => string
  options: GiftOption[]
}

// Placeholders until the couple provides real details. Nothing here is ever rendered until the
// visitor has picked a country and passed the captcha (see app/actions/gifts/controller.tsx).
export const giftCountries: GiftCountry[] = [
  {
    id: 'gt',
    label: m.gift_guatemala,
    options: [{ name: m.gift_bank_transfer, lines: () => ['Amelia Lopez Zepeda', m.gift_savings_account(), 'Banco Industrial', '0724527'] }],
  },
  {
    id: 'uk',
    label: m.gift_uk,
    options: [
      { name: m.gift_bank_transfer, lines: () => ['[00-00-00] · [número]'] },
      { name: () => 'Revolut', href: 'https://revolut.me/smithmichael82' },
    ],
  },
  {
    id: 'us',
    label: m.gift_us,
    options: [
      { name: () => 'Zelle', lines: () => ['lopze.94@gmail.com'] },
      { name: () => 'Venmo', lines: () => ['@josue_lopez'] },
    ],
  },
]

export const findGiftCountry = (id: unknown) => giftCountries.find((country) => country.id === id)
