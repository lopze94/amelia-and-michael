import type { Handle } from 'remix/component'

import { giftAccounts } from '../data/gifts.ts'
import { routes } from '../routes.ts'
import { Layout } from '../ui/layout.tsx'

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Sal%C3%B3n+Las+Jacarandas+San+Jorge+zona+11+Guatemala'

export function HomePage() {
  return () => (
    <Layout page="home">
      <div class="stack stack--18">
        <div class="eyebrow eyebrow--wide">Junto a sus familias</div>
        <h1 class="names">
          Amelia <span class="names__amp">&amp;</span> Michael
        </h1>
        <div class="date">Viernes 27 de noviembre de 2026</div>
        <div class="label label--ink">Guatemala &nbsp;·&nbsp; Inglaterra</div>
      </div>
    </Layout>
  )
}

export function LocationPage() {
  return () => (
    <Layout page="location">
      <div class="stack stack--16">
        <div class="eyebrow eyebrow--wide">Ubicación</div>
        <h2 class="h2">Salón Las Jacarandas</h2>
        <div class="body body--address">
          9 calle A, 23 avenida final
          <br />
          Residenciales San Jorge, zona 11
        </div>
        <div class="facts">
          <div class="fact">
            Hora<div class="fact__value">7:00 – 10:00 pm</div>
          </div>
          <div class="fact">
            Código de acceso<div class="fact__value">587 y 051</div>
          </div>
        </div>
        <a class="link" href={MAPS_URL} target="_blank" rel="noopener">
          Abrir en Maps
        </a>
      </div>
    </Layout>
  )
}

export interface RsvpPageProps {
  sent?: { name: string; attend: 'yes' | 'no' }
  error?: string
  values?: { name: string; attend: string }
}

export function RsvpPage(handle: Handle<RsvpPageProps>) {
  return () => {
    let { sent, error, values } = handle.props
    return (
      <Layout page="rsvp">
        <div class="stack stack--16">
          <div class="eyebrow eyebrow--wide">RSVP</div>
          {sent ? (
            <div class="stack stack--12">
              <h2 class="h2">Gracias, {sent.name.trim().split(/\s+/)[0]}</h2>
              <div class="body">
                {sent.attend === 'yes'
                  ? '¡Nos encantará celebrar contigo!'
                  : 'Te extrañaremos — gracias por avisarnos.'}
              </div>
            </div>
          ) : (
            <form
              class="rsvp stack stack--18"
              method="post"
              action={routes.rsvp.action.href()}
            >
              <h2 class="h2">Confirma tu asistencia</h2>
              <input
                class="rsvp__name"
                type="text"
                name="name"
                required
                autocomplete="name"
                placeholder="Tu nombre completo"
                aria-label="Tu nombre completo"
                defaultValue={values?.name ?? ''}
              />
              <div class="rsvp__choices">
                <label class="choice">
                  <input type="radio" name="attend" value="yes" required defaultChecked={values?.attend === 'yes'} />
                  <span>Con gusto asistiré</span>
                </label>
                <label class="choice">
                  <input type="radio" name="attend" value="no" required defaultChecked={values?.attend === 'no'} />
                  <span>No podré asistir</span>
                </label>
              </div>
              {error ? (
                <div class="rsvp__error" role="alert">
                  {error}
                </div>
              ) : null}
              <button class="rsvp__submit" type="submit">
                Enviar respuesta
              </button>
            </form>
          )}
        </div>
      </Layout>
    )
  }
}

export function GiftsPage() {
  return () => (
    <Layout page="gifts">
      <div class="stack stack--12">
        <h2 class="h2">Tu presencia es suficiente</h2>
        <p class="body body--gifts">
          Si deseas obsequiarnos algo, agradeceremos un aporte en efectivo.
        </p>
        <div class="gifts">
          {giftAccounts.map((account) => (
            <div key={account.label} class="fact">
              {account.label}
              <div class="fact__value fact__value--nowrap">{account.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
