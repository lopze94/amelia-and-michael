import { form, get, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: '/',
  location: get('/ubicacion'),
  rsvp: form('/confirmar'),
  gifts: get('/regalos'),
})
