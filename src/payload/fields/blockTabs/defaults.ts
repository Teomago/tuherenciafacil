import type { Field } from 'payload'
import { getTranslation } from '@/payload/i18n/getTranslation'
import { blockPrefix } from './blockPrefix'
import { blockSuffix } from './blockSuffix'
import { containerType } from '../containerType'
import { htmlTag } from './htmlTag'
import { selectSize } from '../selectSize'
import type { SizeVariants } from '../selectSize'


/**
 * Tab names in order.
 * Extension point: add new tab names here (e.g. 'analytics') and wire in blockTabs.ts + TAB_LABELS.
 */
export const TAB_NAMES = ['general', 'design', 'settings'] as const

export type TabName = (typeof TAB_NAMES)[number]

/** Tag options for htmlTag default field. */
export type HtmlTagOption = 'div' | 'section' | 'article'

/** Container type options for containerType default field. */
export type ContainerTypeOption = 'none' | 'default' | 'post'

/**
 * Config for default block tab field options and default values.
 * Lives outside the fields argument; stable, reliable, extensible.
 * Extension point: add more keys (e.g. background, margin) when new default fields are added.
 */
export type BlockTabsDefaultsConfig = {
  htmlTag?: {
    options?: HtmlTagOption[]
    defaultValue?: HtmlTagOption
  }
  containerType?: {
    options?: ContainerTypeOption[]
    defaultValue?: ContainerTypeOption
  }
  padding?: {
    options?: SizeVariants[]
    defaultValue?: SizeVariants
  }
  margin?: {
    options?: SizeVariants[]
    defaultValue?: SizeVariants
  }
}

/**
 * Default fields for the General tab (content).
 * prefix: when true, adds blockPrefix() before content fields.
 * suffix: when true, adds blockSuffix() after content fields (analog of blockPrefix; no headings).
 * Extension point: add more shared general fields here (e.g. intro text).
 */
export const getGeneralDefaultFields = (prefix = false, suffix = false): Field[] => {
  const fields: Field[] = []
  if (prefix) {
    fields.push(blockPrefix())
  }
  if (suffix) {
    fields.push(blockSuffix())
  }
  return fields
}

export type BlockTabsVariant = 'block' | 'inline'

/**
 * Default fields for the Design tab (spacing, etc.).
 * Uses config for spacing/spacingType options and defaults when provided.
 * Inline variant: no block-level spacing (returns []).
 */
export const getDesignDefaultFields = (
  config?: BlockTabsDefaultsConfig,
  variant: BlockTabsVariant = 'block',
): Field[] => {
  if (variant === 'inline') return []
  const paddingConfig = config?.padding
  const marginConfig = config?.margin
  
  const paddingOptions = paddingConfig?.options
  const marginOptions = marginConfig?.options
  
  const includeNonePadding = paddingOptions?.includes('none') ?? true
  const includeNoneMargin = marginOptions?.includes('none') ?? true
  
  const paddingVariants = paddingOptions?.filter((v) => v !== 'none')
  const marginVariants = marginOptions?.filter((v) => v !== 'none')

  return [
    {
      type: 'row',
      fields: [
        selectSize({
          variants: paddingVariants,
          includeNone: includeNonePadding,
          overrides: {
            name: 'padding',
            label: 'Padding',
            admin: { width: '50%', custom: { renderIn: 'block' } },
            ...(paddingConfig?.defaultValue != null && {
              defaultValue: paddingConfig.defaultValue,
            }),
          },
        }),
        {
          name: 'customPadding',
          type: 'text',
          label: 'Custom Padding',
          admin: {
            condition: (_, siblingData) => siblingData?.padding === 'custom',
            description: 'Enter a valid CSS padding value.',
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        selectSize({
          variants: marginVariants,
          includeNone: includeNoneMargin,
          overrides: {
            name: 'margin',
            label: 'Margin',
            admin: { width: '50%', custom: { renderIn: 'block' } },
            ...(marginConfig?.defaultValue != null && {
              defaultValue: marginConfig.defaultValue,
            }),
          },
        }),
        {
          name: 'customMargin',
          type: 'text',
          label: 'Custom Margin',
          admin: {
            condition: (_, siblingData) => siblingData?.margin === 'custom',
            description: 'Enter a valid CSS margin value (e.g., -64px, 10vh).',
            width: '50%',
          },
        },
      ],
    },
  ]
}

/**
 * Default fields for the Settings tab (id, htmlTag, container, prefix/suffix toggles).
 * Inline variant: no block-level settings (returns []).
 */
export const getSettingsDefaultFields = (
  prefix = false,
  suffix = false,
  config?: BlockTabsDefaultsConfig,
  variant: BlockTabsVariant = 'block',
): Field[] => {
  if (variant === 'inline') return []
  const htmlTagConfig = config?.htmlTag
  const containerTypeConfig = config?.containerType
  const fields: Field[] = [
    {
      name: 'id',
      type: 'text',
      admin: {
        description: getTranslation('fields:idDescription'),
      },
    },
    {
      type: 'row',
      fields: [
        htmlTag({
          tags: htmlTagConfig?.options,
          overrides:
            htmlTagConfig?.defaultValue != null ? { defaultValue: htmlTagConfig.defaultValue } : {},
        }),
        containerType({
          types: containerTypeConfig?.options,
          overrides:
            containerTypeConfig?.defaultValue != null
              ? { defaultValue: containerTypeConfig.defaultValue }
              : {},
        }),
      ],
    },
  ]
  if (prefix || suffix) {
    fields.push({
      type: 'row',
      fields: [
        ...(prefix
          ? [
              {
                name: 'withPrefix',
                label: getTranslation('fields:withPrefix'),
                type: 'checkbox',
                defaultValue: true,
                admin: { width: '50%' },
              } as Field,
            ]
          : []),
        ...(suffix
          ? [
              {
                name: 'withSuffix',
                label: getTranslation('fields:withSuffix'),
                type: 'checkbox',
                defaultValue: false,
                admin: { width: '50%' },
              } as Field,
            ]
          : []),
      ],
    })
  }
  return fields
}
