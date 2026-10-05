import type { Handle } from 'remix/component'

import type { Invitation } from '../data/tables.ts'
import { giftAccounts } from '../data/gifts.ts'
import { routes } from '../routes.ts'
import { Layout } from '../ui/layout.tsx'
import styles from './pages.module.scss.ts'

// Pages pass `invited` to the Layout so it can show the Confirmar link.
interface PageProps {
  invited?: boolean
}

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Sal%C3%B3n+Las+Jacarandas+San+Jorge+zona+11+Guatemala'

export function HomePage(handle: Handle<PageProps>) {
  return () => (
    <Layout page="home" invited={handle.props.invited}>
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

export function LocationPage(handle: Handle<PageProps>) {
  return () => (
    <Layout page="location" invited={handle.props.invited}>
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
  invitation: Invitation
  // Shown after a successful submit.
  thanks?: boolean
  error?: string
}

const inviteeNames = (invitation: Invitation) =>
  invitation.name_2 ? `${invitation.name_1} y ${invitation.name_2}` : invitation.name_1

function choiceLabel(count: number, guests: number) {
  if (count === 0) return guests === 1 ? 'No podré asistir' : 'No podremos asistir'
  if (guests === 1) return 'Con gusto asistiré'
  if (count === guests) return `Asistiremos los ${count}`
  return count === 1 ? 'Asistirá 1 persona' : `Asistirán ${count} personas`
}

function answerSummary(invitation: Invitation) {
  let { confirmed_guests: count, confirmed_at, guests } = invitation
  if (count === null) return null
  let date = confirmed_at ? new Date(confirmed_at).toLocaleDateString('es-GT') : ''
  return `${count}/${guests} invitados confirmados${date ? ` el ${date}` : ''}`
}

export function RsvpPage(handle: Handle<RsvpPageProps>) {
  return () => {
    let { invitation, thanks, error } = handle.props
    let href = routes.rsvp.index.href()
    let answered = invitation.confirmed_guests !== null
    // Up to two guests get a full-text button per option; larger parties pick a number.
    let compact = invitation.guests > 2
    let counts = Array.from({ length: invitation.guests + 1 }, (_, i) => invitation.guests - i)
    let radio = (count: number, label: string, className: string = styles.choice) => (
      <label key={count} class={className}>
        <input
          type="radio"
          name="guests"
          value={String(count)}
          required
          defaultChecked={invitation.confirmed_guests === count}
        />
        <span>{label}</span>
      </label>
    )
    return (
      <Layout page="rsvp" invited>
        <div class={styles.stack16}>
          <div class={styles.eyebrow}>RSVP</div>
          {thanks && answered ? (
            <div class={styles.stack12}>
              <h2 class={styles.heading}>Gracias, {inviteeNames(invitation)}</h2>
              <div class={styles.body}>
                {invitation.confirmed_guests === 0
                  ? 'Te extrañaremos — gracias por avisarnos.'
                  : '¡Nos encantará celebrar contigo!'}
              </div>
              <div class={styles.label}>{answerSummary(invitation)}</div>
              <a class={styles.link} href={href}>
                Cambiar respuesta
              </a>
            </div>
          ) : (
            <form
              class={`${styles.rsvp} ${styles.stack18}`}
              method="post"
              action={routes.rsvp.action.href()}
            >
              <h2 class={styles.heading}>{inviteeNames(invitation)}</h2>
              <div class={styles.body}>Confirma tu asistencia</div>
              {compact ? (
                <div class={styles.stack12}>
                  <div class={styles.label}>¿Cuántos asistirán?</div>
                  <div class={styles.numbers}>
                    {counts.filter((count) => count > 0).reverse().map((count) =>
                      radio(count, String(count), styles.number),
                    )}
                  </div>
                  <div class={styles.choices}>
                    {radio(0, choiceLabel(0, invitation.guests))}
                  </div>
                </div>
              ) : (
                <div class={styles.choices}>
                  {counts.map((count) => radio(count, choiceLabel(count, invitation.guests)))}
                </div>
              )}
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

export function InviteNotFoundPage() {
  return () => (
    <Layout page="home">
      <div class={styles.stack12}>
        <h2 class={styles.heading}>Invitación no encontrada</h2>
        <div class={styles.body}>Usa el enlace que te enviamos para confirmar tu asistencia.</div>
      </div>
    </Layout>
  )
}

export function GiftsPage(handle: Handle<PageProps>) {
  return () => (
    <Layout page="gifts" invited={handle.props.invited}>
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
