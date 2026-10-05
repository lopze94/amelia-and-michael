import { clientEntry } from 'remix/component'
import type { Handle } from 'remix/component'

const CITY_SPEED = 70 // px/s, skyline scroll speed (clouds run at 0.3x)
const BUMPINESS = 1

// Random bumps need per-event randomness, so they use the Web Animations API on top
// of the CSS sway. Everything else about the scene is plain SCSS.
export const SceneMotion = clientEntry(import.meta.url, function SceneMotion(handle: Handle) {
  handle.queueTask(() => {
    let root = document.querySelector<HTMLElement>('.scene')
    let video = root?.querySelector<HTMLVideoElement>('.car__video')
    let skyline = root?.querySelector<HTMLElement>('.skyline__track')
    let clouds = root?.querySelector<HTMLElement>('.clouds__track')
    if (!root) return

    // Autoplay: iOS needs an explicit play() on mount and again on canplay.
    if (video) {
      video.muted = true
      let play = () => void video.play().catch(() => {})
      play()
      video.addEventListener('canplay', play, { once: true, signal: handle.signal })
    }

    // Keep scroll speed constant (px/s) regardless of viewport: the loop distance is
    // half the skyline track (two identical copies) and a third of the cloud track.
    let setDurations = () => {
      if (skyline) root.style.setProperty('--city-duration', `${skyline.scrollWidth / 2 / CITY_SPEED}s`)
      if (clouds) root.style.setProperty('--cloud-duration', `${clouds.scrollWidth / 3 / (CITY_SPEED * 0.3)}s`)
    }
    setDurations()
    window.addEventListener('resize', setDurations, { signal: handle.signal })
    // Images size the tracks as they load.
    root.addEventListener('load', setDurations, { capture: true, signal: handle.signal })

    let reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!video) return

    // Damped oscillation per axle; rear axle hits 0.2s after the front.
    let bump = () => {
      if (reduced.matches || document.hidden) return
      let amp = (0.7 + Math.random() * 0.9) * BUMPINESS
      let b = (d: number) => (d < 0 ? 0 : Math.exp(-7 * d) * Math.sin(24 * d))
      let duration = 1000
      let steps = 40
      let frames: Keyframe[] = []
      for (let i = 0; i <= steps; i++) {
        let d = (i / steps) * (duration / 1000)
        let front = b(d)
        let rear = b(d - 0.2)
        let y = (front + rear) * 1.2 * amp
        let rot = (rear - front) * 0.3 * amp
        frames.push({ transform: `translateY(${-y}px) rotate(${rot}deg)`, offset: i / steps })
      }
      video.animate(frames, { duration, easing: 'linear' })
    }

    let timer: ReturnType<typeof setTimeout>
    let schedule = () => {
      timer = setTimeout(() => {
        bump()
        schedule()
      }, 2200 + Math.random() * 3500)
    }
    schedule()
    handle.signal.addEventListener('abort', () => clearTimeout(timer))
  })

  return () => null
})
