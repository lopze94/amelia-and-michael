import type { Handle, RemixNode } from 'remix/component'

import { Document } from '../actions/document.tsx'
import { routes } from '../routes.ts'
import styles from './layout.module.scss.ts'
import { Scene, SceneFront } from './scene/scene.tsx'

export type PageKey = 'home' | 'location' | 'rsvp' | 'gifts'

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
      { key: 'home', label: 'Inicio', href: routes.home.href() },
      { key: 'location', label: 'Ubicación', href: routes.location.href() },
      ...(invited
        ? [{ key: 'rsvp' as const, label: 'Confirmar', href: routes.rsvp.index.href() }]
        : []),
      { key: 'gifts', label: 'Regalos', href: routes.gifts.href() },
    ]
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
        </nav>
        <main class={styles.main}>{children}</main>
        <SceneFront />
      </div>
    </Document>
    )
  }
}
