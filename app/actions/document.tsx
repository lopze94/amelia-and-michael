import type { Handle, RemixNode } from 'remix/component'
import { ImportMap } from 'remix/component/server'

import { scriptEntry } from '../assets.ts'
import { getLocale } from '../i18n.ts'

export interface DocumentProps {
  children?: RemixNode
  head?: RemixNode
  title?: string
}

// Fonts and scene images are fetched with the HTML so nothing swaps or pops in later.
const PRELOAD_FONTS = [
  '/fonts/jost.woff2',
  '/fonts/cormorant-garamond.woff2',
  '/fonts/cormorant-garamond-italic.woff2',
  '/fonts/eb-garamond-italic.woff2',
]
const PRELOAD_IMAGES = ['/img/cloud.png', '/img/london.png', '/img/guatemala.png']

const DEFAULT_TITLE = 'Amelia & Michael'

export function Document(handle: Handle<DocumentProps>) {
  return () => {
    let { children, head, title = DEFAULT_TITLE } = handle.props
    let { href, importMap, preloads } = scriptEntry

    return (
      <html lang={getLocale()}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="only light" />
          <meta name="supported-color-schemes" content="light" />
          <meta name="theme-color" content="#fcfcfa" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <title>{title}</title>
          {PRELOAD_FONTS.map((font) => (
            <link key={font} rel="preload" as="font" type="font/woff2" href={font} crossOrigin="anonymous" />
          ))}
          {PRELOAD_IMAGES.map((image) => (
            <link key={image} rel="preload" as="image" href={image} />
          ))}
          <link rel="stylesheet" href="/css/main.css" />
          {head}
          <ImportMap value={importMap} />
          {preloads.map((preloadHref) => (
            <link key={preloadHref} rel="modulepreload" href={preloadHref} />
          ))}
          <script type="module" src={href}></script>
        </head>
        <body>{children}</body>
      </html>
    )
  }
}
