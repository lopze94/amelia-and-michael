// Endless skyline: buildings are spawned on the right, scrolled left, and removed from the DOM
// as soon as they leave the viewport. At most MAX_PER_KIND images of each kind exist at once.
const MAX_PER_KIND = 3
const MIN_OVERLAP = 56
const MAX_OVERLAP = 288

export const SKYLINE_KINDS = [
  { src: '/img/london.png', className: 'london' },
  { src: '/img/guatemala.png', className: 'guatemala' },
] as const

type Kind = (typeof SKYLINE_KINDS)[number]

interface Piece {
  kind: Kind
  node: HTMLImageElement
  x: number
  right: number
  z: number
}

export function runSkyline(
  track: HTMLElement,
  classNames: Record<Kind['className'], string>,
  speed: number,
  signal: AbortSignal,
) {
  let pieces: Piece[] = []
  let offset = 0
  let z = 0

  let count = (kind: Kind) => pieces.filter((p) => p.kind === kind).length

  function spawnPiece(): boolean {
    // Strictly alternate London / Guatemala; the first piece is random.
    let prev = pieces[pieces.length - 1]
    let kind = prev
      ? SKYLINE_KINDS.find((k) => k !== prev.kind)!
      : SKYLINE_KINDS[Math.floor(Math.random() * SKYLINE_KINDS.length)]
    if (count(kind) >= MAX_PER_KIND) return false

    let node = document.createElement('img')
    node.src = kind.src
    node.alt = ''
    node.decoding = 'sync'
    node.className = classNames[kind.className]

    let last = pieces[pieces.length - 1]
    // Random in front of / behind the previous piece.
    z = last ? z + (Math.random() < 0.5 ? 1 : -1) : 0
    node.style.zIndex = String(z)
    node.style.visibility = 'hidden'
    track.append(node)

    // Height and aspect-ratio come from CSS, so the width is known before the image loads.
    let width = node.offsetWidth
    let overlap = MIN_OVERLAP + Math.random() * (MAX_OVERLAP - MIN_OVERLAP)
    let x = last ? last.right - overlap : offset
    node.style.transform = `translate3d(${x}px, 0, 0)`
    node.style.visibility = ''
    pieces.push({ kind, node, x, right: x + width, z })
    return true
  }

  // Keep the DOM topped up to the cap, so a replacement is appended the moment the left-most
  // piece is removed, well off-screen to the right, and its image is loaded before it is seen.
  function fill() {
    while (spawnPiece());
  }

  function prune() {
    while (pieces.length > 0 && pieces[0].right <= offset) {
      pieces.shift()!.node.remove()
    }
  }

  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let last = performance.now()
  let frame = 0

  function tick(now: number) {
    // Clamp so a backgrounded tab doesn't jump the scene when it resumes.
    let dt = Math.min(now - last, 100) / 1000
    last = now
    offset += dt * speed * (reduced.matches ? 0.25 : 1)
    track.style.transform = `translate3d(${-offset}px, 0, 0)`
    prune()
    fill()
    frame = requestAnimationFrame(tick)
  }

  for (let kind of SKYLINE_KINDS) new Image().src = kind.src // warm the HTTP cache
  fill()
  frame = requestAnimationFrame(tick)

  signal.addEventListener('abort', () => {
    cancelAnimationFrame(frame)
    for (let p of pieces) p.node.remove()
    pieces = []
  })
}
