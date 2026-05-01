import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    /** Required for `forbidden()` / `forbidden.tsx` (e.g. notary route for non-abogado). */
    authInterrupts: true,
  },
  turbopack: {
    root: path.resolve(dirname),
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    config.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'))
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ['@svgr/webpack'],
      },
    )
    fileLoaderRule.exclude = /\.svg$/i
    return config
  },
  images: {
    remotePatterns: [
      // Payload file URLs are absolute (same origin in prod); Next/Image requires an allowlist.
      {
        protocol: 'https',
        hostname: 'tuherenciafacil.com',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: 'www.tuherenciafacil.com',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: 'heionhub.com',
      },
      {
        protocol: 'https',
        hostname: 'www.heionhub.com',
      },
      {
        protocol: 'https',
        hostname: 'cuhvhkkiwmcrkfpzvkfw.storage.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')
const config = withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
// Payload 3.x injects experimental.enableServerFastRefresh which Next.js 16.2+ rejects
if (config.experimental) delete config.experimental.enableServerFastRefresh
if (config.experimental) config.experimental.authInterrupts = true
export default config
