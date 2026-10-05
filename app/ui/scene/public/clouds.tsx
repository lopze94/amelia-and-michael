import { clientEntry, ref } from 'remix/component'

import styles from './clouds.module.scss.ts'
import { bindLoopDuration, CLOUD_SPEED } from './loop-duration.ts'

const COPIES = 3

export const Clouds = clientEntry(import.meta.url, function Clouds() {
  return () => (
    <div class={styles.clouds}>
      <div
        class={styles.track}
        mix={ref((node, signal) => bindLoopDuration(node, COPIES, CLOUD_SPEED, signal))}
      >
        {Array.from({ length: COPIES }, (_, i) => (
          <div key={i} class={styles.group}>
            <img class={`${styles.cloud} ${styles.large}`} src="/img/cloud.png" alt="" />
            <img class={`${styles.cloud} ${styles.small}`} src="/img/cloud.png" alt="" />
          </div>
        ))}
      </div>
    </div>
  )
})
