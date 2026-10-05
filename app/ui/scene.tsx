import { SceneMotion } from '../actions/public/scene-motion.tsx'

// The persistent animated backdrop. Scrolling and sway are pure CSS (see
// styles/_scene.scss); SceneMotion only adds the bits CSS can't do: random bumps,
// seamless-loop timing and video autoplay.
export function Scene() {
  return () => (
    <div class="scene" aria-hidden="true">
      <svg width="0" height="0" class="scene__defs">
        <filter id="inkify" color-interpolation-filters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.125  0 0 0 0 0.176  0 0 0 0 0.169  -1.2 -1.2 -1.2 3.6 -0.3"
          />
        </filter>
      </svg>

      <div class="clouds">
        <div class="clouds__track">
          {[0, 1, 2].map((i) => (
            <div key={i} class="clouds__group">
              <img class="cloud cloud--a" src="/img/cloud.png" alt="" />
              <img class="cloud cloud--b" src="/img/cloud.png" alt="" />
            </div>
          ))}
        </div>
      </div>

      <div class="skyline">
        <div class="skyline__track">
          {[0, 1].map((i) => (
            <div key={i} class="skyline__copy">
              <img class="london" src="/img/london.png" alt="" />
              <div class="guatemala">
                <img class="guatemala__base" src="/img/guatemala.png" alt="" />
                <img class="guatemala__front" src="/img/guatemala.png" alt="" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div class="ground" />

      <div class="car">
        <div class="car__sway">
          <video
            class="car__video"
            src="/img/car.webm"
            autoplay
            loop
            muted
            playsInline
            aria-label="Los novios en un convertible clásico"
          />
        </div>
      </div>

      <SceneMotion />
    </div>
  )
}
