import type { Handle } from 'remix/component'

import type { Invitation } from '../data/tables.ts'
import { giftAccounts } from '../data/gifts.ts'
import { formatDate, localizeHref, m } from '../i18n.ts'
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
        <div class={styles.eyebrow}>{m.home_eyebrow()}</div>
        <h1 class={styles.names}>
          Amelia <span class={styles.amp}>&amp;</span> Michael
        </h1>
        <div class={styles.date}>{m.home_date()}</div>
        <div class={styles.label}>{m.place_guatemala()} &nbsp;·&nbsp; {m.place_england()}</div>
      </div>
    </Layout>
  )
}

export function LocationPage(handle: Handle<PageProps>) {
  return () => (
    <Layout page="location" invited={handle.props.invited}>
      <div class={styles.stack16}>
        <div class={styles.eyebrow}>{m.location_eyebrow()}</div>
        <h2 class={styles.heading}>Salón Las Jacarandas</h2>
        <div class={`${styles.body} ${styles.address}`}>
          9 calle A, 23 avenida final
          <br />
          Residenciales San Jorge, zona 11
        </div>
        <div class={styles.facts}>
          <div class={styles.fact}>
            {m.location_time_label()}<div class={styles.factValue}>7:00 – 10:00 pm</div>
          </div>
          <div class={styles.fact}>
            {m.location_access_label()}<div class={styles.factValue}>{m.location_access_value()}</div>
          </div>
        </div>
        <a class={styles.link} href={MAPS_URL} target="_blank" rel="noopener">
          {m.location_open_maps()}
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
  invitation.name_2
    ? m.invitee_names({ name_1: invitation.name_1, name_2: invitation.name_2 })
    : invitation.name_1

function choiceLabel(count: number, guests: number) {
  if (count === 0) return guests === 1 ? m.choice_decline_one() : m.choice_decline_many()
  if (guests === 1) return m.choice_accept_one()
  if (count === guests) return m.choice_all({ count })
  return count === 1 ? m.choice_one_person() : m.choice_n_people({ count })
}

function answerSummary(invitation: Invitation) {
  let { confirmed_guests: count, confirmed_at, guests } = invitation
  if (count === null) return null
  return confirmed_at
    ? m.rsvp_summary_dated({ count, guests, date: formatDate(new Date(confirmed_at)) })
    : m.rsvp_summary({ count, guests })
}

export function RsvpPage(handle: Handle<RsvpPageProps>) {
  return () => {
    let { invitation, thanks, error } = handle.props
    let href = localizeHref(routes.rsvp.index.href())
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
          <div class={styles.eyebrow}>{m.rsvp_eyebrow()}</div>
          {thanks && answered ? (
            <div class={styles.stack12}>
              <h2 class={styles.heading}>{m.rsvp_thanks_heading({ names: inviteeNames(invitation) })}</h2>
              <div class={styles.body}>
                {invitation.confirmed_guests === 0
                  ? m.rsvp_thanks_declined()
                  : m.rsvp_thanks_accepted()}
              </div>
              <div class={styles.label}>{answerSummary(invitation)}</div>
              <a class={styles.link} href={href}>
                {m.rsvp_change()}
              </a>
            </div>
          ) : (
            <form
              class={`${styles.rsvp} ${styles.stack18}`}
              method="post"
              action={localizeHref(routes.rsvp.action.href())}
            >
              <h2 class={styles.heading}>{inviteeNames(invitation)}</h2>
              <div class={styles.body}>{m.rsvp_confirm_attendance()}</div>
              {compact ? (
                <div class={styles.stack12}>
                  <div class={styles.label}>{m.rsvp_how_many()}</div>
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
                {m.rsvp_submit()}
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
        <h2 class={styles.heading}>{m.invite_not_found_title()}</h2>
        <div class={styles.body}>{m.invite_not_found_body()}</div>
      </div>
    </Layout>
  )
}

export function GiftsPage(handle: Handle<PageProps>) {
  return () => (
    <Layout page="gifts" invited={handle.props.invited}>
      <div class={styles.stack12}>
        <h2 class={styles.heading}>{m.gifts_heading()}</h2>
        <p class={`${styles.body} ${styles.giftsCopy}`}>
          {m.gifts_copy()}
        </p>
        <div class={styles.gifts}>
          {giftAccounts.map((account) => (
            <div key={account.id} class={styles.fact}>
              {account.label()}
              <div class={`${styles.factValue} ${styles.giftValue}`}>
                {[account.value].flat().map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
