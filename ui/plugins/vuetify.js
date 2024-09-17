/* global defineNuxtPlugin */
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { md3 } from 'vuetify/blueprints'

// Custom color scheme
const customDarkTheme = {
  dark: true,
  colors: {
    primary: '#37474F', // Charcoal
    secondary: '#607D8B', // Slate gray
    accent: '#FFB300', // Amber
    error: '#E53935', // Red
    info: '#90A4AE', // Light gray-blue
    success: '#43A047', // Dark green
    warning: '#F57C00', // Deep orange
    background: '#121212', // Very dark background
    surface: '#1E1E1E', // Dark gray
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'customDarkTheme',
      themes: {
        customDarkTheme,
      },
    },
    blueprint: md3,
  })

  nuxtApp.vueApp.use(vuetify)
})
