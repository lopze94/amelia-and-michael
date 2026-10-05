import { Car } from './public/car.tsx'
import { Clouds } from './public/clouds.tsx'
import { Skyline } from './public/skyline.tsx'
import styles from './scene.module.scss.ts'

// The persistent animated backdrop, back to front: clouds, skyline + ground line, car.
export function Scene() {
  return () => (
    <div class={styles.scene} aria-hidden="true">
      {/* Recolors the cloud image to ink, with alpha derived from darkness. */}
      <svg width="0" height="0" class={styles.defs}>
        <filter id="inkify" color-interpolation-filters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.125  0 0 0 0 0.176  0 0 0 0 0.169  -1.2 -1.2 -1.2 3.6 -0.3"
          />
        </filter>
      </svg>
      <Clouds />
      <Skyline />
      <Car />
    </div>
  )
}
