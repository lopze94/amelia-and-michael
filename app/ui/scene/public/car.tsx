import { animate } from 'animejs'
import { clientEntry, ref } from 'remix/component'

import styles from './car.module.scss.ts'

const BUMPINESS = 1

const rand = (min: number, max: number) => min + Math.random() * (max - min)

export const Car = clientEntry(import.meta.url, function Car() {
  return () => (
    <div class={styles.car}>
      {/* Layers, outside in: sway (drifting back and forth) > bumps (road) > video. */}
      <div class={styles.sway} mix={ref((node, signal) => swayRandomly(node, signal))}>
        <div class={styles.bumps} mix={ref((node, signal) => bumpRandomly(node, signal))}>
          <video
            class={styles.video}
            autoplay
            loop
            muted
            preload="auto"
            width="780"
            height="280"
            playsInline
            aria-label="Los novios en un convertible clásico"
            mix={ref((video, signal) => keepPlaying(video, signal))}
          >
            {/* Safari only does alpha video as HEVC; everyone else gets VP9 WebM. */}
            <source src="/img/car.mov" type='video/quicktime; codecs="hvc1"' />
            <source src="/img/car.webm" type='video/webm; codecs="vp9"' />
          </video>
        </div>
      </div>
    </div>
  )
})

// iOS needs an explicit play() on mount and again once data arrives. Low Power Mode (and
// some autoplay policies) reject it, so keep retrying on the first touch or scroll, and
// whenever the video gets paused or the tab comes back.
function keepPlaying(video: HTMLVideoElement, signal: AbortSignal) {
  video.muted = true
  let play = () => {
    if (!video.paused) return
    video.play().catch(() => {})
  }
  play()
  for (let type of ['loadedmetadata', 'loadeddata', 'canplay', 'pause', 'suspend'])
    video.addEventListener(type, play, { signal })
  for (let type of ['touchstart', 'pointerdown', 'scroll', 'click', 'keydown'])
    window.addEventListener(type, play, { signal, passive: true, capture: true })
  document.addEventListener('visibilitychange', play, { signal })
  window.addEventListener('pageshow', play, { signal })
}

// Accelerating and braking: the car drifts to a new random spot (random distance, random
// time), leaning into the move, and picks another the moment it arrives.
function swayRandomly(node: HTMLElement, signal: AbortSignal) {
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let range = () => Math.min(window.innerWidth * 0.06, 90)
  let x = 0
  let current: ReturnType<typeof animate> | undefined
  let timer: ReturnType<typeof setTimeout>

  function drift() {
    if (signal.aborted) return
    if (reduced.matches) {
      timer = setTimeout(drift, 1000)
      return
    }
    let next = rand(-1, 1) * range()
    // Lean tilts toward the direction of travel, scaled by how far it's going.
    let lean = ((next - x) / (range() * 2)) * -0.8
    x = next
    let duration = rand(3500, 9000)
    current = animate(node, {
      x: next,
      rotate: lean,
      duration,
      ease: 'inOutSine',
      onComplete: drift,
    })
  }
  drift()
  signal.addEventListener('abort', () => {
    clearTimeout(timer)
    current?.cancel()
  })
}

// A bump is a damped oscillation at the front axle, repeated 0.2s later at the rear.
// Random strength and spacing, on its own layer so it never fights the sway. A bump is also
// forced whenever the video loops, to hide the seam.
function bumpRandomly(node: HTMLElement, signal: AbortSignal) {
  let video = node.querySelector('video')!
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let axle = (d: number) => (d < 0 ? 0 : Math.exp(-7 * d) * Math.sin(24 * d))
  let current: ReturnType<typeof animate> | undefined
  let timer: ReturnType<typeof setTimeout>

  function bump(strength: number) {
    if (reduced.matches || document.hidden) return
    strength *= BUMPINESS
    let steps = 40
    let seconds = 1
    let y: { to: number; duration: number }[] = []
    let rotate: { to: number; duration: number }[] = []
    for (let i = 1; i <= steps; i++) {
      let d = (i / steps) * seconds
      let front = axle(d)
      let rear = axle(d - 0.2)
      y.push({ to: -(front + rear) * 1.2 * strength, duration: (seconds * 1000) / steps })
      rotate.push({ to: (rear - front) * 0.3 * strength, duration: (seconds * 1000) / steps })
    }
    current?.pause()
    current = animate(node, { y, rotate, ease: 'linear' })
  }

  // Random bumps; restarting the schedule after a loop bump avoids two in quick succession.
  function schedule() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      // Squared so most are small and the odd one is a big jolt.
      bump(0.3 + Math.random() ** 2 * 1.7)
      schedule()
    }, rand(2200, 5700))
  }

  // The loop bump starts just before the last frame, so its first jolt lands on the cut.
  // A currentTime that jumps backwards means the video wrapped, which re-arms it.
  const LEAD = 0.1
  const LOOP_STRENGTH = 2
  let hasFrameCallback = typeof video.requestVideoFrameCallback === 'function'
  let lastTime = 0
  let armed = true
  let stopWatching = false
  function watchLoop(_now?: number, metadata?: VideoFrameCallbackMetadata) {
    if (stopWatching) return
    let time = metadata?.mediaTime ?? video.currentTime
    if (time < lastTime) armed = true
    if (armed && time >= video.duration - LEAD) {
      armed = false
      bump(LOOP_STRENGTH + Math.random() * 0.4)
      schedule()
    }
    lastTime = time
    if (hasFrameCallback) video.requestVideoFrameCallback(watchLoop)
  }
  if (hasFrameCallback) video.requestVideoFrameCallback(watchLoop)
  else video.addEventListener('timeupdate', () => watchLoop(), { signal })

  schedule()
  signal.addEventListener('abort', () => {
    stopWatching = true
    clearTimeout(timer)
    current?.cancel()
  })
}
