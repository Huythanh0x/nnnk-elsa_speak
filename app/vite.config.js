import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set to your repo name when deploying to GitHub Pages (e.g. '/elsa-speak/')
  // Leave as '/' if using a custom domain or root Pages site
  base: process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : '/',
})
