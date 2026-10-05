import type { Handle, RemixNode } from 'remix/component'

import { Document } from '../actions/document.tsx'
import { routes } from '../routes.ts'
import styles from './layout.module.scss.ts'
import { Scene } from './scene/scene.tsx'

const navItems = [
  { key: 'home', label: 'Inicio', href: routes.home.href() },
  { key: 'location', label: 'Ubicación', href: routes.location.href() },
  { key: 'rsvp', label: 'Confirmar', href: routes.rsvp.index.href() },
  { key: 'gifts', label: 'Regalos', href: routes.gifts.href() },
] as const

export type PageKey = (typeof navItems)[number]['key']

export interface LayoutProps {
  page: PageKey
  children?: RemixNode
}

export function Layout(handle: Handle<LayoutProps>) {
  return () => {
    let { page, children } = handle.props
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
      </div>
    </Document>
    )
  }
}
