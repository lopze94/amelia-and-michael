// Cross-fades (slightly staggered) the page content on client-side navigation. Right as a navigation starts, a
// copy of the current <main> is pinned on top of the page; once the new content renders it
// fades in while the copy fades out. The scene behind keeps running, so it isn't part of it.
// The old content is almost gone by the time the new content starts to appear.
const FADE_OUT = 250
const FADE_IN = 450
const FADE_IN_DELAY = 200
const GIVE_UP = 3000

export function installPageTransitions() {
  let navigation = (window as any).navigation as EventTarget | undefined
  if (!navigation) return
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let ghost: HTMLElement | undefined

  function clearGhost() {
    ghost?.remove()
    ghost = undefined
  }

  navigation.addEventListener('navigate', (event: any) => {
    if (reduced.matches || !event.canIntercept || event.hashChange || event.downloadRequest != null) return
    if (event.destination.url === location.href && event.navigationType !== 'reload') return

    let main = document.querySelector<HTMLElement>('main')
    if (!main) return
    clearGhost()

    // Lives on <html>, outside the rendered tree, so the renderer never reconciles it.
    let copy = main.cloneNode(true) as HTMLElement
    let style = getComputedStyle(main)
    copy.style.fontFamily = style.fontFamily
    copy.style.color = style.color
    copy.style.pointerEvents = 'none'
    copy.setAttribute('aria-hidden', 'true')
    copy.inert = true
    document.documentElement.append(copy)
    ghost = copy

    let observer = new MutationObserver(() => {
      observer.disconnect()
      clearTimeout(timer)
      let fresh = document.querySelector<HTMLElement>('main')
      fresh?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: FADE_IN,
        delay: FADE_IN_DELAY,
        easing: 'ease',
        fill: 'both',
      })
      copy.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: FADE_OUT,
        easing: 'ease-out',
        fill: 'both',
      }).finished.then(() => {
        if (ghost === copy) clearGhost()
        else copy.remove()
      })
    })
    observer.observe(main.parentElement!, { childList: true, subtree: true, characterData: true })
    let timer = setTimeout(() => {
      observer.disconnect()
      if (ghost === copy) clearGhost()
    }, GIVE_UP)
  })
}
