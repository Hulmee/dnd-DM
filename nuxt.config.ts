// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',
    port: 3000 // Ensure this matches your target port
  },
  ssr: false, // Disable server-side rendering for a purely client-side app
  css: ['@/assets/css/styles.scss']
  })
