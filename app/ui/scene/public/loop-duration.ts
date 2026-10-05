// Skyline scroll speed in px/s; clouds run at a fraction of it.
export const CITY_SPEED = 70
export const CLOUD_SPEED = CITY_SPEED * 0.3

// A looping track holds `copies` identical groups and scrolls by one group's width, so one
// loop is (scrollWidth / copies) px. Set --duration so the speed stays constant in px/s
// whatever the viewport or image sizes are.
export function bindLoopDuration(
  track: HTMLElement,
  copies: number,
  speed: number,
  signal: AbortSignal,
) {
  let update = () => {
    track.style.setProperty('--duration', `${track.scrollWidth / copies / speed}s`)
  }
  update()
  window.addEventListener('resize', update, { signal })
  // Images size the track as they load.
  track.addEventListener('load', update, { capture: true, signal })
}
