import { clientEntry, ref } from 'remix/component'
import type { Handle } from 'remix/component'

interface Turnstile {
  render(
    node: HTMLElement,
    options: { sitekey: string; theme: string; action: string },
  ): string
  remove(widgetId: string): void
}

let loading: Promise<Turnstile> | undefined

// Loaded from here rather than a <script> tag in the page: markup swapped in by client-side
// navigation never executes its scripts.
function loadTurnstile() {
  loading ??= new Promise<Turnstile>((resolve, reject) => {
    let script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve((window as any).turnstile)
    script.onerror = () => {
      loading = undefined
      reject(new Error('Failed to load Turnstile'))
    }
    document.head.append(script)
  })
  return loading
}

// Renders the widget; Turnstile adds its `cf-turnstile-response` input to the surrounding form.
export const Captcha = clientEntry(
  import.meta.url,
  function Captcha(handle: Handle<{ siteKey: string; action: string }>) {
    return () => (
      <div
        mix={ref((node, signal) => {
          let widgetId: string | undefined
          loadTurnstile().then(
            (turnstile) => {
              if (signal.aborted) return
              widgetId = turnstile.render(node, {
                sitekey: handle.props.siteKey,
                theme: 'light',
                action: handle.props.action,
              })
              signal.addEventListener('abort', () => turnstile.remove(widgetId!))
            },
            (error) => console.error(error),
          )
        })}
      />
    )
  },
)
