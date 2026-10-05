import { clientEntry, ref } from 'remix/component'

import { bindLoopDuration, CITY_SPEED } from './loop-duration.ts'
import styles from './skyline.module.scss.ts'

const COPIES = 2

export const Skyline = clientEntry(import.meta.url, function Skyline() {
  return () => (
    <>
      <div class={styles.skyline}>
        <div
          class={styles.track}
          mix={ref((node, signal) => bindLoopDuration(node, COPIES, CITY_SPEED, signal))}
        >
          {Array.from({ length: COPIES }, (_, i) => (
            <div key={i} class={styles.copy}>
              <img class={styles.london} src="/img/london.png" alt="" />
              <div class={styles.guatemala}>
                <img class={styles.base} src="/img/guatemala.png" alt="" />
                <img class={styles.front} src="/img/guatemala.png" alt="" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div class={styles.ground} />
    </>
  )
})
