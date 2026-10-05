import type { Handle, RemixNode } from 'remix/component'

import { Document } from '../actions/document.tsx'
import { routes } from '../routes.ts'
import { Scene } from './scene.tsx'

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
      <div class="app">
        <Scene />
        <nav class="nav">
          {navItems.map((item) => (
            <a
              key={item.key}
              class="nav__link"
              href={item.href}
              aria-current={item.key === page ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <main class="main">{children}</main>
      </div>
    </Document>
    )
  }
}
