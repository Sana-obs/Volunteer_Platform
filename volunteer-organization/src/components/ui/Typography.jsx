import { createElement } from 'react'

const VARIANT_STYLES = {
  display: `
    font-display
    text-4xl sm:text-5xl md:text-6xl
    leading-[1.15]
    font-bold
    text-heading
  `,

  sectionTitle: `
    font-display
    text-3xl sm:text-4xl md:text-5xl
    leading-[1.2]
    font-bold
    text-heading
  `,

  h1: `
    font-display
    text-3xl sm:text-4xl md:text-5xl
    leading-tight
    font-bold
    text-heading
  `,
  h2: `
    font-display
    text-2xl sm:text-3xl md:text-4xl
    leading-tight
    font-bold
    text-heading
  `,
  h3: `
    font-display
    text-xl sm:text-2xl md:text-3xl
    leading-snug
    font-bold
    text-heading
  `,
  h4: `
    font-display
    text-lg sm:text-xl md:text-2xl
    leading-snug
    font-semibold
    text-heading
  `,
  h5: `
    font-display
    text-base sm:text-lg md:text-xl
    leading-normal
    font-semibold
    text-heading
  `,
  h6: `
    font-display
    text-sm sm:text-base md:text-lg
    leading-normal
    font-semibold
    text-heading
  `,

  subtitle: `
    font-display
    text-xl md:text-2xl
    leading-tight
    font-bold
    text-primary
    capitalize
  `,

  lead: `
    font-body
    text-lg md:text-xl
    leading-relaxed
    text-body
  `,
  body: `
    font-body
    text-base
    leading-6
    text-body
  `,
  bodySm: `
    font-body
    text-sm
    leading-5
    text-body
  `,
  caption: `
    font-body
    text-xs
    leading-4
    text-body
  `,
  overline: `
    font-body
    text-xs
    leading-4
    uppercase
    tracking-[0.12em]
    text-body
  `,
}

const COLOR_STYLES = {
  inherit: '',
  primary: 'text-primary',
  heading: 'text-heading',
  body: 'text-body',
  black: 'text-black',
  white: 'text-white',
  danger: 'text-danger',
  muted: 'text-heading/60',
}

const ALIGN_STYLES = {
  inherit: '',
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
}

const WEIGHT_STYLES = {
  normal: '',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
}

function resolveElement(variant) {
  const map = {
    display: 'h1',
    sectionTitle: 'h2',
    subtitle: 'h3',
    lead: 'p',
    body: 'p',
    bodySm: 'p',
    caption: 'span',
    overline: 'span',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
  }
  return map[variant] || 'p'
}

// Variants hard-code text-heading/text-body (for the light public site). In the
// dark admin panel, pass an explicit text-adminTextHi!/text-adminTextLo! — the
// ! is required because Tailwind resolves same-specificity conflicts by CSS
// generation order, not JSX class order.
export default function Typography({
  variant = 'body',
  as,
  children,
  className = '',
  color = 'inherit',
  align = 'inherit',
  weight = 'normal',
  gutterBottom = false,
  truncate = false,
  ...props
}) {
  const elementTag = as || resolveElement(variant)

  const classes = [
    VARIANT_STYLES[variant] || VARIANT_STYLES.body,
    COLOR_STYLES[color],
    ALIGN_STYLES[align],
    WEIGHT_STYLES[weight],
    gutterBottom ? 'mb-4' : '',
    truncate ? 'truncate overflow-hidden whitespace-nowrap' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return createElement(elementTag, { className: classes, ...props }, children)
}
