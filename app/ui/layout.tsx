import type { Handle, RemixNode } from 'remix/component'

import { Document } from '../actions/document.tsx'
import { getLocale, localizeHref, locales, m, type Locale } from '../i18n.ts'
import { routes } from '../routes.ts'
import styles from './layout.module.scss.ts'
import { Scene, SceneFront } from './scene/scene.tsx'

export type PageKey = 'home' | 'location' | 'rsvp' | 'gifts'

const pageHref: Record<PageKey, string> = {
  home: routes.home.href(),
  location: routes.location.href(),
  rsvp: routes.rsvp.index.href(),
  gifts: routes.gifts.index.href(),
}

export interface LayoutProps {
  page: PageKey
  // The browser has a valid invitation, which unlocks the Confirmar link.
  invited?: boolean
  children?: RemixNode
}

const ORIGIN = process.env.SITE_ORIGIN ?? 'https://ameliaandmichael.com'
const OG_LOCALES = { es: 'es_GT', en: 'en_GB' } as const

// Link previews (WhatsApp, Facebook, iMessage...) and search: one card for every page, with the
// canonical and alternate-language URLs of the page being viewed. No ?invite id ever lands here.
function SocialTags(handle: Handle<{ page: PageKey }>) {
  return () => {
    let { page } = handle.props
    let locale = getLocale()
    let url = (l: Locale) => ORIGIN + localizeHref(pageHref[page], { locale: l })
    let title = 'Amelia & Michael'
    let description = m.seo_description()
    let image = `${ORIGIN}/img/og.png`
    return (
      <>
        <meta name="description" content={description} />
        <link rel="canonical" href={url(locale)} />
        {locales.map((l) => (
          <link key={l} rel="alternate" hreflang={l} href={url(l)} />
        ))}
        <link rel="alternate" hreflang="x-default" href={url('es')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={title} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url(locale)} />
        <meta property="og:locale" content={OG_LOCALES[locale]} />
        <meta property="og:locale:alternate" content={OG_LOCALES[locale === 'es' ? 'en' : 'es']} />
        <meta property="og:image" content={image} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
      </>
    )
  }
}

export function Layout(handle: Handle<LayoutProps>) {
  return () => {
    let { page, invited, children } = handle.props
    let navItems: { key: PageKey; label: string; href: string }[] = [
      { key: 'home', label: m.nav_home(), href: localizeHref(routes.home.href()) },
      { key: 'location', label: m.nav_location(), href: localizeHref(routes.location.href()) },
      ...(invited
        ? [
            {
              key: 'rsvp' as const,
              label: m.nav_rsvp(),
              href: localizeHref(routes.rsvp.index.href()),
            },
          ]
        : []),
      { key: 'gifts', label: m.nav_gifts(), href: localizeHref(routes.gifts.index.href()) },
    ]
    // The same page in the other language; its own label is written in that language.
    let otherLocale = locales.find((locale) => locale !== getLocale())!
    let otherHref = localizeHref(pageHref[page], { locale: otherLocale })
    return (
    <Document head={<SocialTags page={page} />}>
      <div class={styles.app}>
        <Scene />
        <nav class={styles.nav}>
          {navItems.map((item) => (
            <a
              key={item.key}
              class={styles.navLink}
              href={item.href}
              aria-current={item.key === page ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
          <a class={styles.navLink} href={otherHref} lang={otherLocale} hreflang={otherLocale}>
            {m.language_switch()}
          </a>
        </nav>
        <main class={styles.main}>{children}</main>
        <SceneFront />
      </div>
    </Document>
    )
  }
}
