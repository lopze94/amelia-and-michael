import { Car } from './public/car.tsx'
import { Clouds } from './public/clouds.tsx'
import { Skyline } from './public/skyline.tsx'
import styles from './scene.module.scss.ts'

// The page is layered back to front: clouds (Scene), page content, then the skyline + ground
// line and the car (SceneFront). Both scene layers fade in together (see entry.ts).
export function Scene() {
  return () => (
    <div class={styles.scene} data-scene aria-hidden="true">
      {/* Recolors the cloud image to ink, with alpha derived from darkness. */}
      <svg width="0" height="0" class={styles.defs}>
        <filter id="inkify" color-interpolation-filters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.125  0 0 0 0 0.176  0 0 0 0 0.169  -1.2 -1.2 -1.2 3.6 -0.3"
          />
        </filter>
        {/* Scales the video's pure white down to the page's paper color (#fcfcfa). */}
        <filter id="paperify" color-interpolation-filters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.988 0 0 0 0  0 0.988 0 0 0  0 0 0.98 0 0  0 0 0 1 0"
          />
        </filter>
      </svg>
      <Clouds />
    </div>
  )
}

export function SceneFront() {
  return () => (
    <div class={styles.scene} data-scene aria-hidden="true">
      <Skyline />
      <Car />
    </div>
  )
}
