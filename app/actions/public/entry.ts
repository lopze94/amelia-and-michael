import {
  detectMultipleImportMapSupport,
  importModule,
  preloadShim,
} from 'remix/multiple-import-maps-polyfill'
import { run } from 'remix/component'

import { installPageTransitions } from './page-transition.ts'

const app = run({
  async loadModule(moduleUrl, exportName) {
    let mod = await importModule(moduleUrl)
    let Component = mod[exportName]
    if (typeof Component !== 'function') {
      throw new Error(`Unknown component: ${moduleUrl}#${exportName}`)
    }
    return Component
  },
  async processClientEntryPreloads(preloads) {
    if (await detectMultipleImportMapSupport()) return preloads

    preloadShim(preloads)
    return []
  },
})

if (import.meta.hot) {
  import.meta.hot.on('server:update', async () => {
    try {
      await app.ready()
      await app.frames.top.reload()
    } catch (error) {
      console.error('Error reloading top frame on server update', error)
    }
  })
}

// The scene starts transparent (see scene.module.scss) and fades in once its images are
// decoded and the video has its first frame, so nothing flashes in piecemeal.
async function revealScene() {
  let scene = document.querySelector<HTMLElement>('[data-scene]')
  if (!scene) return
  let images = ['/img/cloud.png', '/img/london.png', '/img/guatemala.png'].map((src) => {
    let image = new Image()
    image.src = src
    return image.decode().catch(() => {})
  })
  let video = scene.querySelector('video')
  let firstFrame = new Promise<void>((resolve) => {
    if (!video || video.readyState >= 2) return resolve()
    video.addEventListener('loadeddata', () => resolve(), { once: true })
  })
  let timeout = new Promise<void>((resolve) => setTimeout(resolve, 4000))
  await Promise.race([Promise.all([...images, firstFrame, document.fonts.ready]), timeout])
  // The Web Animations API, not an attribute or class: hydration resets those on this element.
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  requestAnimationFrame(() => {
    scene.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: reduced ? 0 : 800,
      easing: 'ease',
      fill: 'forwards',
    })
  })
}

void revealScene()

installPageTransitions()
