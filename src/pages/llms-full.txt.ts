// src/pages/llms-full.txt.ts
// Rozszerzona wersja llms.txt z pełną treścią kluczowych stron
// Przeznaczona dla modeli które indeksują głębiej

import type { APIRoute } from 'astro';
import { SITE, CONTACT } from '../config/site';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const workshops  = await getCollection('workshops',  e => e.data.active);
  const faqEntries = await getCollection('faq');
  const projects   = await getCollection('projects',   e => e.data.published);
  const posts      = await getCollection('posts',      e => e.data.published);

  const sortedWS      = workshops.sort((a, b) => a.data.order - b.data.order);
  const sortedFaq     = faqEntries.sort((a, b) => a.data.order - b.data.order);
  const sortedProj    = projects.sort((a, b) => a.data.order - b.data.order);
  const sortedPosts   = posts.sort((a, b) =>
    b.data.date.valueOf() - a.data.date.valueOf()
  );

  const projectsDom = sortedProj.filter(p => p.data.category === 'dla-domu');
  const projectsFirm = sortedProj.filter(p => p.data.category === 'dla-firm');

  const content = `# ${SITE.fullName} — pełna treść

Wygenerowano: ${new Date().toISOString()}
URL: ${SITE.finalUrl}

---

## O pracowni

Pracownia Szkła Artystycznego Maciej Rafalski Glass Project mieści się w Warszawie na Ochocie (ul. Grójecka 79). Maciej Rafalski to hutnik i artysta szkła z ponad 20-letnim doświadczeniem — wiedzę przekazywali mu hutnicy pracujący w rodzinnej hucie szkła od 5. roku życia. W 2005 roku założył własną pracownię.

Pracownia specjalizuje się w dwóch technikach:

1. **Hutnictwo szkła (szkło dmuchane)** — ręczne formowanie rozgrzanej masy szklanej w temperaturze 1200°C przy użyciu piszczeli szklanej. Każdy obiekt jest niepowtarzalny. Przy piecu pracuje Józef Badzioch — wieloletni mistrz i współpracownik.

2. **Fusing** — stapianie kawałków szkła w piecu hutniczym. Technika umożliwia tworzenie dużych obiektów, paneli architektonicznych i form przestrzennych niemożliwych do uzyskania metodą dmuchania.

Materiały: głównie szkło recyklingowe — stłuczka szklana z odpadów przemysłowych.

Filozofia: szkło stawia warunki — nie da się go zmusić do określonego zachowania. Finalna forma jest zapisem konkretnego dnia, warunków i decyzji. Nie ma dwóch takich samych obiektów.

---

## Realizacje portfolio

### Dla firm (${projectsFirm.length} realizacji)

${projectsFirm.map(p => `- **${p.data.title}**${p.data.year ? ` (${p.data.year})` : ''}${p.data.description ? `: ${p.data.description}` : ''}${p.data.dimensions ? ` — wymiary: ${p.data.dimensions}` : ''}`).join('\n') || '- Realizacje dostępne na stronie portfolio'}

### Dla domu (${projectsDom.length} realizacji)

${projectsDom.map(p => `- **${p.data.title}**${p.data.year ? ` (${p.data.year})` : ''}${p.data.description ? `: ${p.data.description}` : ''}${p.data.dimensions ? ` — wymiary: ${p.data.dimensions}` : ''}`).join('\n') || '- Realizacje dostępne na stronie portfolio'}

---

## Oferta szczegółowa

### Dla firm i instytucji

**Przestrzenie komercyjne (hotele, restauracje, biura):**
Tworzymy obiekty dekoracyjne, elementy świetlne oraz formy dedykowane recepcjom, lobby, restauracjom i przestrzeniom eventowym. Obiekty, które definiują charakter miejsca — nie zdobią go, lecz go tworzą.

**Elementy architektoniczne:**
Wytwarzamy szklane formy będące integralną częścią architektury — od rzeźb i instalacji artystycznych, przez dekoracyjne panele i moduły ścienne z reliefem, po podświetlane sufity oraz elementy fasad. Realizujemy według dokumentacji projektowej, dostarczamy specyfikację techniczną. Chętnie współpracujemy z architektami i projektantami wnętrz.

**Identyfikacja wizualna i projekty specjalne:**
Nagrody, statuetki, obiekty okolicznościowe, limitowane edycje produktowe, upominki biznesowe z logo firmy. Techniki nanoszenia logo: dostępne — skonsultuj indywidualnie.

**Proces B2B:**
Brief → konsultacja (spotkanie w pracowni lub online) → oferta z opisem technicznym i harmonogramem (5–7 dni roboczych) → umowa o dzieło + zaliczka → realizacja z raportowaniem postępu → dostawa z dokumentacją techniczną. Możliwy harmonogram płatności etapowych. Faktury VAT.

### Dla osób prywatnych

Formy dekoracyjne (rzeźby, misy, dekoracje ścienne), szkło użytkowe (wazony, naczynia, patery, oświetlenie, detale meblowe), personalizowane upominki i prezenty, obiekty na zamówienie według pomysłu klienta. Możliwa dostawa kurierska w specjalnym opakowaniu na terenie całej Polski.

---

## Warsztaty — szczegółowy opis

${sortedWS.map(w => `### ${w.data.title}

${w.data.description}

- **Czas trwania:** ${w.data.duration}
- **Maksymalna liczba osób:** ${w.data.maxPersons}
- **Cena:** ${w.data.price} zł / osoba${w.data.pricePair ? `\n- **Oferta dla pary:** ${w.data.pricePairLabel} (${w.data.pricePair} zł)` : ''}
- **Rezerwacja:** ${w.data.setmoreUrl}
`).join('\n')}

Warsztaty odbywają się w pracowni, w małych grupach. Wymagany wiek: 18+. Możliwe warsztaty dla grup zorganizowanych (min. 5 osób). Dostępne vouchery na prezent.

---

## FAQ — pełne odpowiedzi

${sortedFaq.map(f => `### ${f.data.question}\n\n${f.data.answer}`).join('\n\n---\n\n')}

---

## Posty i aktualności

${sortedPosts.length > 0
  ? sortedPosts.map(p => `### ${p.data.title} (${p.data.date.toLocaleDateString('pl-PL')})\n\n${p.data.excerpt}\n\nURL: ${SITE.finalUrl}/posts/${p.slug}`).join('\n\n')
  : 'Brak opublikowanych postów.'}

---

## Dane kontaktowe i firmowe

- **Nazwa:** ${SITE.fullName}
- **Adres:** ${CONTACT.address}, ${CONTACT.city}
- **Telefon:** ${CONTACT.phone}
- **Email:** ${CONTACT.email}
- **Godziny pracy:** ${CONTACT.hours}
- **NIP:** ${CONTACT.nip}
- **REGON:** ${CONTACT.regon}
- **Google Maps:** ${CONTACT.mapsUrl}
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
