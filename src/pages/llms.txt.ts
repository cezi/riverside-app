// src/pages/llms.txt.ts
// Generuje /llms.txt podczas astro build
// Standard: https://llmstxt.org

import type { APIRoute } from 'astro';
import { SITE, CONTACT, SOCIAL } from '../config/site';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const workshops    = await getCollection('workshops',    e => e.data.active);
  const faqEntries   = await getCollection('faq');

  const sortedFaq = faqEntries.sort((a, b) => a.data.order - b.data.order);
  const sortedWS  = workshops.sort((a, b) => a.data.order - b.data.order);

  const content = `# ${SITE.fullName}

> Pracownia szkła artystycznego w Warszawie. Maciej Rafalski — hutnik i artysta szkła z ponad 20-letnim doświadczeniem. Realizujemy projekty na zamówienie dla firm, hoteli, architektów i osób prywatnych. Techniki: hutnictwo szkła (szkło dmuchane), fusing.

## Informacje ogólne

- Lokalizacja: ${CONTACT.address}, ${CONTACT.city}
- Telefon: ${CONTACT.phone}
- Email: ${CONTACT.email}
- Godziny pracy: ${CONTACT.hours}
- Strona WWW: ${SITE.finalUrl}
- Google Maps: ${CONTACT.mapsUrl}

## Oferta — dla firm i instytucji

Realizujemy szklane obiekty dla przestrzeni komercyjnych:
- Instalacje świetlne i dekoracyjne do lobby, recepcji, restauracji
- Elementy architektoniczne według dokumentacji projektowej (panele, ścianki, detale fasad)
- Nagrody, statuetki, obiekty okolicznościowe z logo firmy
- Serie upominków biznesowych (min. 5–10 szt.)
- Współpraca z architektami i projektantami wnętrz

Proces współpracy: brief → wycena (3–5 dni roboczych) → umowa o dzieło → realizacja → dostawa z dokumentacją techniczną. Wystawiamy faktury VAT.

## Oferta — dla osób prywatnych

- Formy dekoracyjne: rzeźby, misy, dekoracje ścienne
- Szkło użytkowe: wazony, naczynia, oświetlenie
- Personalizowane upominki i prezenty
- Obiekty na zamówienie według pomysłu klienta

## Warsztaty

${sortedWS.map(w => `### ${w.data.title}
- Poziom: ${w.data.level}
- Czas: ${w.data.duration}
- Maks. osób: ${w.data.maxPersons}
- Cena: ${w.data.price} zł / osoba${w.data.pricePair ? ` (${w.data.pricePairLabel})` : ''}
- Rezerwacja: ${w.data.setmoreUrl}
`).join('\n')}

## FAQ

- [Najczęściej zadawane pytania](.../faq/): Informacje o zamówieniach, warsztatach, voucherach i rezerwacjach

## Klienci (wybrani)

OBI, Wasalaa, Le Collet, AD 100, MedEstelle Institute, LUX MED, Miasto Warszawa, Castorama, TVN Style, Radio Kolor, Polsat, PGE Narodowy

## Technologia i materiały

Technika hutnicza (szkło dmuchane): formowanie ręczne z rozgrzanej masy szklanej w temperaturze 1200°C. Każdy obiekt powstaje ręcznie — nie ma dwóch identycznych egzemplarzy.

Fusing: stapianie kawałków szkła w piecu hutniczym. Umożliwia tworzenie dużych form, paneli i obiektów architektonicznych.

Surowce: szkło recyklingowe (stłuczka z odpadów przemysłowych).

## Social media

- Facebook: ${SOCIAL.facebook}
- Instagram: ${SOCIAL.instagram}
- TikTok: ${SOCIAL.tiktok}

## Mapa strony

- ${SITE.finalUrl}/ — Strona główna
- ${SITE.finalUrl}/about/ — Historia Macieja Rafalskiego
- ${SITE.finalUrl}/workshop/ — Pracownia, narzędzia, zespół
- ${SITE.finalUrl}/portfolio/ — Galeria realizacji (dla domu / dla firm)
- ${SITE.finalUrl}/services/ — Oferta dla firm i osób prywatnych
- ${SITE.finalUrl}/workshops/ — Warsztaty ze szkła
- ${SITE.finalUrl}/vouchers/ — Vouchery na warsztaty
- ${SITE.finalUrl}/faq/ — Najczęstsze pytania
- ${SITE.finalUrl}/contact/ — Kontakt i formularz
- ${SITE.finalUrl}/posts/ — Blog
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
