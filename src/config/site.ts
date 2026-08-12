import settingsData from '../data/settings.json';

export const SITE = {
  name: 'MR Glass Project w Warszawie',
  fullName: 'Pracownia Szkła Artystycznego MR Glass Project Maciej Rafalski',
  description: 'Pracownia szkła artystycznego w Warszawie. Projekty na zamówienie dla firm, hoteli i architektów.',
  url: 'https://mrglassproject.github.io',
  finalUrl: 'https://mrglassproject.com',
  lang: 'pl',
  locale: 'pl_PL',
  themeColor: '#FF8C00',
  bgColor: '#0A0A0B',
  ogImage: 'https://res.cloudinary.com/mrglassproject/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/home/og-default',
} as const;

export const CONTACT = {
  address:      settingsData.address,
  city:         settingsData.city,
  phone:        settingsData.phone,
  phoneWork:    settingsData.phone_workshops,
  phoneHref:    `tel:${settingsData.phone.replace(/\s/g, '')}`,
  phoneWorkHref:`tel:${settingsData.phone_workshops.replace(/\s/g, '')}`,
  email:        settingsData.email,
  emailHref:    `mailto:${settingsData.email}`,
  hours:        settingsData.hours,
  region: 'mazowieckie',
  country: 'PL',
  nip: '8762371621',
  regon: '387628069',
  hoursSchema: 'Mo-Fr 08:00-16:00',
  lat: 52.2121751,
  lng: 20.9779826,
  mapsUrl: 'https://maps.app.goo.gl/vXUA1MQB47HWjrjP9',
  mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2444.7178278804267!2d20.977982600000004!3d52.212175099999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecd7dea749169%3A0x37b3ffea814a8560!2sPracownia%20Szk%C5%82a%20Artystycznego%20Maciej%20Rafalski%20Glass%20Project!5e0!3m2!1spl!2spl!4v1770455090382!5m2!1spl!2spl',
} as const;

export const SOCIAL = {
  facebook:   'https://www.facebook.com/p/Mrglassproject-100063557379907/',
  instagram:  'https://www.instagram.com/maciejrafalski_glassproject/',
  tiktok:     'https://www.tiktok.com/@mr_glassproject',
  googleMaps: 'https://maps.app.goo.gl/vXUA1MQB47HWjrjP9',
} as const;

export const CLOUDINARY = {
  cloudName: 'mrglassproject',
  baseUrl: 'https://res.cloudinary.com',
} as const;

export const FORMSPARK = {
  formId: import.meta.env.PUBLIC_FORMSPARK_FORM_ID,
  url: 'https://submit-form.com',
} as const;

export const TURNSTILE = {
  siteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
} as const;

export const NAV = [
  { label: 'Start',         href: '/' },
  { label: 'Moja historia', href: '/about' },
  { label: 'Pracownia',     href: '/workshop' },
  { label: 'Realizacje',    href: '/portfolio' },
  { label: 'Oferta',        href: '/services' },
//{ label: 'Blog',          href: '/posts' },
  { label: 'Vouchery',        href: '/vouchers' },
  { label: 'FAQ',           href: '/faq' },
  { label: 'Kontakt',       href: '/contact' },
] as const;

export const NAV_CTA = {
  label: 'Warsztaty',
  href: '/workshops',
} as const;

export const FOOTER_NAV = [
  { label: 'Start',               href: '/' },
  { label: 'Oferta',              href: '/services' },
  { label: 'Warsztaty',           href: '/workshops' },
  { label: 'FAQ',                 href: '/faq' },
  { label: 'Kontakt',             href: '/contact' },
  { label: 'Regulamin',           href: '/terms' },
  { label: 'Polityka prywatności', href: '/privacy' },
] as const;

export const BUSINESS = {
  type:               ['LocalBusiness', 'ArtGallery'] as const,
  priceRange:         '$$',
  currenciesAccepted: 'PLN',
  paymentAccepted:    'Cash, Credit Card, Bank Transfer',
  areaServed:         'Warszawa',
} as const;

export const SAME_AS = Object.values(SOCIAL).filter(Boolean);

export const MEDIA = {
  logo: {
    src:       '/images/logo-glassproject-500x175px.webp',
    alt:       'Glass Project — Pracownia Szkła Artystycznego',
    width:     500,
    height:    175,
    navWidth:  128,
    navHeight: 45,
  },
  favicon: {
  ico:            '/favicons/favicon.ico',
  svg:            '/favicons/favicon.svg',
  appleTouchIcon: '/favicons/apple-touch-icon.png',
  icon96:         '/favicons/favicon-96x96.png',
  icon192:        '/favicons/web-app-manifest-192x192.png',
  icon512:        '/favicons/web-app-manifest-512x512.png',
  manifest:       '/favicons/manifest.webmanifest',
},
} as const;

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string): string {
  return `${BASE}${path}`;
}

export const ANALYTICS = {
  gtmId: 'GTM-KJBWFFDN',
} as const;