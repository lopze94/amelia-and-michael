import { clientEntry, ref } from 'remix/component'

import { CITY_SPEED } from './loop-duration.ts'
import { runSkyline } from './skyline-loop.ts'
import styles from './skyline.module.scss.ts'

export const Skyline = clientEntry(import.meta.url, function Skyline() {
  return () => (
    <>
      <div class={styles.skyline}>
        {/* Children are generated and removed imperatively by runSkyline. */}
        <div
          class={styles.track}
          mix={ref((node, signal) => runSkyline(node, styles, CITY_SPEED, signal))}
        />
      </div>
      <div class={styles.ground} />
    </>
  )
})
