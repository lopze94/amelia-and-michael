import { clientEntry, ref } from 'remix/component'

import styles from './car.module.scss.ts'

const BUMPINESS = 1

export const Car = clientEntry(import.meta.url, function Car() {
  return () => (
    <div class={styles.car}>
      <div class={styles.sway}>
        <video
          class={styles.video}
          src="/img/car.webm"
          autoplay
          loop
          muted
          playsInline
          aria-label="Los novios en un convertible clásico"
          mix={ref((video, signal) => {
            keepPlaying(video, signal)
            bumpRandomly(video, signal)
          })}
        />
      </div>
    </div>
  )
})

// iOS needs an explicit play() on mount and again on canplay.
function keepPlaying(video: HTMLVideoElement, signal: AbortSignal) {
  video.muted = true
  let play = () => void video.play().catch(() => {})
  play()
  video.addEventListener('canplay', play, { once: true, signal })
}

// A bump is a damped oscillation at the front axle, repeated 0.2s later at the rear.
// Random strength and spacing; plays on top of the CSS sway via the Web Animations API.
function bumpRandomly(video: HTMLVideoElement, signal: AbortSignal) {
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let axle = (d: number) => (d < 0 ? 0 : Math.exp(-7 * d) * Math.sin(24 * d))

  function bump() {
    if (reduced.matches || document.hidden) return
    let strength = (0.7 + Math.random() * 0.9) * BUMPINESS
    let steps = 40
    let seconds = 1
    let frames: Keyframe[] = []
    for (let i = 0; i <= steps; i++) {
      let d = (i / steps) * seconds
      let front = axle(d)
      let rear = axle(d - 0.2)
      let y = (front + rear) * 1.2 * strength
      let rotate = (rear - front) * 0.3 * strength
      frames.push({ transform: `translateY(${-y}px) rotate(${rotate}deg)`, offset: i / steps })
    }
    video.animate(frames, { duration: seconds * 1000, easing: 'linear' })
  }

  let timer: ReturnType<typeof setTimeout>
  function schedule() {
    timer = setTimeout(() => {
      bump()
      schedule()
    }, 2200 + Math.random() * 3500)
  }
  schedule()
  signal.addEventListener('abort', () => clearTimeout(timer))
}
