import { autoEnableRichTextLink } from './autoEnableRichTextLink'
// NOTE: imageAspectRatio removed — FigmaCMS manages media sizes/processing
// import { imageAspectRatio } from './imageAspectRatio'
import { nestedDocs } from './nestedDocs'
import { seo } from './seo'
import { payloadCmdk } from '@veiag/payload-cmdk'

const cmdk = payloadCmdk({
  blurBg: true,
  submenu: {
    enabled: true,
  },
  icons: {
    collections: {
      pages: 'FileText',
      articles: 'Newspaper',
      media: 'Image',
      users: 'Users',
      tags: 'Tag',
    },
    globals: {
      header: 'PanelTop',
      footer: 'PanelBottom',
      'general-settings': 'Settings',
      'seo-settings': 'Search',
    },
  },
})

export const plugins = [autoEnableRichTextLink, nestedDocs, seo, cmdk]
