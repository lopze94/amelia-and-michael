import type { Handle } from 'remix/component'

import { giftAccounts } from '../data/gifts.ts'
import { routes } from '../routes.ts'
import { Layout } from '../ui/layout.tsx'
import styles from './pages.module.scss.ts'

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Sal%C3%B3n+Las+Jacarandas+San+Jorge+zona+11+Guatemala'

export function HomePage() {
  return () => (
    <Layout page="home">
      <div class={styles.stack18}>
        <div class={styles.eyebrow}>Junto a sus familias</div>
        <h1 class={styles.names}>
          Amelia <span class={styles.amp}>&amp;</span> Michael
        </h1>
        <div class={styles.date}>Viernes 27 de noviembre de 2026</div>
        <div class={styles.label}>Guatemala &nbsp;·&nbsp; Inglaterra</div>
      </div>
    </Layout>
  )
}

export function LocationPage() {
  return () => (
    <Layout page="location">
      <div class={styles.stack16}>
        <div class={styles.eyebrow}>Ubicación</div>
        <h2 class={styles.heading}>Salón Las Jacarandas</h2>
        <div class={`${styles.body} ${styles.address}`}>
          9 calle A, 23 avenida final
          <br />
          Residenciales San Jorge, zona 11
        </div>
        <div class={styles.facts}>
          <div class={styles.fact}>
            Hora<div class={styles.factValue}>7:00 – 10:00 pm</div>
          </div>
          <div class={styles.fact}>
            Código de acceso<div class={styles.factValue}>587 y 051</div>
          </div>
        </div>
        <a class={styles.link} href={MAPS_URL} target="_blank" rel="noopener">
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
        <div class={styles.stack16}>
          <div class={styles.eyebrow}>RSVP</div>
          {sent ? (
            <div class={styles.stack12}>
              <h2 class={styles.heading}>Gracias, {sent.name.trim().split(/\s+/)[0]}</h2>
              <div class={styles.body}>
                {sent.attend === 'yes'
                  ? '¡Nos encantará celebrar contigo!'
                  : 'Te extrañaremos — gracias por avisarnos.'}
              </div>
            </div>
          ) : (
            <form
              class={`${styles.rsvp} ${styles.stack18}`}
              method="post"
              action={routes.rsvp.action.href()}
            >
              <h2 class={styles.heading}>Confirma tu asistencia</h2>
              <input
                class={styles.name}
                type="text"
                name="name"
                required
                autocomplete="name"
                placeholder="Tu nombre completo"
                aria-label="Tu nombre completo"
                defaultValue={values?.name ?? ''}
              />
              <div class={styles.choices}>
                <label class={styles.choice}>
                  <input type="radio" name="attend" value="yes" required defaultChecked={values?.attend === 'yes'} />
                  <span>Con gusto asistiré</span>
                </label>
                <label class={styles.choice}>
                  <input type="radio" name="attend" value="no" required defaultChecked={values?.attend === 'no'} />
                  <span>No podré asistir</span>
                </label>
              </div>
              {error ? (
                <div class={styles.error} role="alert">
                  {error}
                </div>
              ) : null}
              <button class={styles.submit} type="submit">
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
      <div class={styles.stack12}>
        <h2 class={styles.heading}>Tu presencia es suficiente</h2>
        <p class={`${styles.body} ${styles.giftsCopy}`}>
          Si deseas obsequiarnos algo, agradeceremos un aporte en efectivo.
        </p>
        <div class={styles.gifts}>
          {giftAccounts.map((account) => (
            <div key={account.label} class={styles.fact}>
              {account.label}
              <div class={`${styles.factValue} ${styles.giftValue}`}>{account.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
