import { createController } from 'remix/router'

import { verifyCaptcha } from '../../captcha.ts'
import { findGiftCountry } from '../../data/gifts.ts'
import { m } from '../../i18n.ts'
import { routes } from '../../routes.ts'
import { GiftsPage } from '../pages.tsx'

// Three steps, all server-rendered: pick a country, pass the captcha, see that country's
// options. The details are only in the HTML of the last step.
export default createController(routes.gifts, {
  actions: {
    index(context) {
      let invited = !!context.invitation
      let id = new URL(context.request.url).searchParams.get('pais')
      let country = findGiftCountry(id)
      return context.render(
        country ? (
          <GiftsPage invited={invited} step="captcha" country={country} />
        ) : (
          <GiftsPage invited={invited} step="pick" />
        ),
      )
    },
    async action(context) {
      let invited = !!context.invitation
      let country = findGiftCountry(context.formData.get('country'))
      if (!country) return context.render(<GiftsPage invited={invited} step="pick" />, { status: 400 })

      let token = String(context.formData.get('cf-turnstile-response') ?? '')
      if (!(await verifyCaptcha(token))) {
        return context.render(
          <GiftsPage
            invited={invited}
            step="captcha"
            country={country}
            error={m.gifts_captcha_error()}
          />,
          { status: 400 },
        )
      }
      return context.render(<GiftsPage invited={invited} step="details" country={country} />)
    },
  },
})
