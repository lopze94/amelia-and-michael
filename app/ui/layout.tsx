import type { Handle, RemixNode } from 'remix/component'

import { Document } from '../actions/document.tsx'
import { getLocale, localizeHref, locales, m } from '../i18n.ts'
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
    <Document>
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
