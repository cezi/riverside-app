/**
 * Glass Project — Cloudflare Worker
 * Obsługa voucherów: Stripe webhook → generowanie PDF → wysyłka e-mail (Resend)
 *
 * Wymagane sekrety (wrangler secret put ...):
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   RESEND_API_KEY
 *
 * Wymagana zmienna (wrangler.toml [vars]):
 *   SITE_URL = "https://mrglassproject.com"
 */

import { FONTS, LOGO_BASE64 } from './assets';

// ─── Typy środowiska ──────────────────────────────────────────────────────────

export interface Env {
  STRIPE_SECRET_KEY:      string;
  STRIPE_WEBHOOK_SECRET:  string;
  RESEND_API_KEY:         string;
  SITE_URL:               string;
}

// ─── Pomocnicze — HMAC-SHA256 (weryfikacja Stripe) ───────────────────────────

async function stripeVerify(
  payload: string,
  header: string,
  secret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(',').map(p => p.split('=')),
  );
  const t   = parts['t'];
  const v1  = parts['v1'];
  if (!t || !v1) return false;

  const signed = `${t}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  // Ochrona przed atakami timing
  const encoder = new TextEncoder();
  const a = encoder.encode(hex);
  const b = encoder.encode(v1);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ─── Generowanie kodu vouchera ────────────────────────────────────────────────

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bez O, 0, I, 1
  let code = 'GP-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += '-';
  }
  return code; // np. GP-ABCD-EFGH
}

// ─── Generowanie SVG vouchera (przez Satori) ─────────────────────────────────

async function generateVoucherSvg(data: {
  recipientName: string;
  workshopTitle: string;
  price:         number;
  code:          string;
  validUntil:    string;
}): Promise<string> {
  // Dynamiczny import — Satori jest duże, ładuj tylko gdy potrzebne
  const { default: satori } = await import('satori');

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width:           '800px',
          height:          '450px',
          background:      'linear-gradient(135deg, #0A0A0B 0%, #1a1a1f 100%)',
          border:          '2px solid #FF8C00',
          borderRadius:    '16px',
          padding:         '48px',
          fontFamily:      'Inter',
          color:           '#ffffff',
          display:         'flex',
          flexDirection:   'column',
          justifyContent:  'space-between',
          position:        'relative',
        },
        children: [
          // Nagłówek z logo
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
              children: [
                {
                  type: 'img',
                  props: { src: LOGO_BASE64, width: 160, height: 56, style: { objectFit: 'contain' } },
                },
                {
                  type: 'div',
                  props: {
                    style: { color: '#FF8C00', fontSize: '16px', letterSpacing: '3px', textTransform: 'uppercase' },
                    children: 'Voucher Prezentowy',
                  },
                },
              ],
            },
          },
          // Środek — warsztaty i cena
          {
            type: 'div',
            props: {
              style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '16px', color: '#A1A1AA', letterSpacing: '1px', textTransform: 'uppercase' },
                    children: 'Uprawnia do uczestnictwa w:',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '28px', fontWeight: 700, lineHeight: 1.2 },
                    children: data.workshopTitle,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '16px', color: '#A1A1AA', marginTop: '8px' },
                    children: `Dla: ${data.recipientName}`,
                  },
                },
              ],
            },
          },
          // Stopka — kod i data ważności
          {
            type: 'div',
            props: {
              style: {
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'flex-end',
                borderTop:      '1px solid #A1A1AA',
                paddingTop:     '24px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column' },
                    children: [
                      {
                        type: 'div',
                        props: { style: { fontSize: '14px', color: '#A1A1AA', marginBottom: '4px' }, children: 'KOD VOUCHERA' },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize:       '22px',
                            fontWeight:     700,
                            letterSpacing:  '3px',
                            color:          '#FF8C00',
                            fontVariantNumeric: 'tabular-nums',
                          },
                          children: data.code,
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { textAlign: 'right', display: 'flex', flexDirection: 'column' },
                    children: [
                      {
                        type: 'div',
                        props: { style: { fontSize: '14px', color: '#A1A1AA', marginBottom: '4px' }, children: 'WARTOŚĆ' },
                      },
                      {
                        type: 'div',
                        props: { style: { fontSize: '24px', fontWeight: 700 }, children: `${data.price} zł` },
                      },
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: '14px', color: '#A1A1AA', marginTop: '8px' },
                          children: `Ważny do: ${data.validUntil}`,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width:  800,
      height: 450,
      fonts: FONTS,
    },
  );

  return svg;
}

// ─── Konwersja SVG → PNG przez @resvg/resvg-wasm ─────────────────────────────

let wasmInitialized = false;

async function svgToPng(svg: string): Promise<Uint8Array> {
  const { Resvg, initWasm } = await import('@resvg/resvg-wasm');
  const wasmModule = await import('@resvg/resvg-wasm/index_bg.wasm');
  
  if (!wasmInitialized) {
    await initWasm(wasmModule.default);
    wasmInitialized = true;
  }

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 800 } });
  return resvg.render().asPng();
}

// ─── Wysyłka e-mail z voucherem (Resend) ─────────────────────────────────────

async function sendVoucherEmail(params: {
  to:            string;
  recipientName: string;
  workshopTitle: string;
  code:          string;
  validUntil:    string;
  pngBase64:     string;
  resendApiKey:  string;
  siteUrl:       string;
}): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voucher z MR Glass Project</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">

  <table width="100%" cellpadding="0" cellspacing="0" style="display:block;width:100%;max-width:520px;height:auto;background:#f4f4f5;">
    <tr><td align="center" style="padding:32px 16px;">

      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Nagłówek ciemny -->
        <tr><td style="background:#0A0A0B;padding:28px 40px;text-align:center">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;color:#FF8C00;font-size:16px;letter-spacing:3px;text-transform:uppercase;">MR Glass Project </p>
                <p style="margin:4px 0 0;color:#ffffff;font-size:22px;font-weight:bold;">Voucher Prezentowy</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Treść główna -->
        <tr><td style="padding:40px;">

          <p style="color:#18181b;margin:0 0 8px;font-size:16px;">Dzień dobry <strong style="color:#18181b;">${params.recipientName}</strong>,</p>
          <p style="color:#18181b;margin:0 0 8px;font-size:16px;">Zakup vouchera zakończył się pomyślnie. Twoja płatność została przyjęta.</p>
          <p style="color:#18181b;margin:0 0 28px;font-size:16px;line-height:1.6;">
            Poniżej znajdziesz voucher na warsztaty oraz informacje potrzebne do rezerwacji terminu.  
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:28px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;color:#9a3412;font-size:16px;text-transform:uppercase;letter-spacing:1px;">Rodzaj Warsztatu</p>
              <p style="margin:0;color:#18181b;font-size:22px;font-weight:bold;">${params.workshopTitle}</p>
            </td></tr>
          </table>

          <!-- Zdjęcie vouchera -->
          <img src="cid:voucher-image"
               alt="Voucher prezentowy MR Glass Project, kod ${params.code}, ważny do ${params.validUntil}"
               width="520"
               style="border-radius:8px;display:block;margin:0 auto 28px;border:1px solid #e4e4e7;">

          <!-- Kod i data ważności -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td width="50%" style="padding:16px;background:#f9f9f9;border-radius:8px 0 0 8px;border:1px solid #e4e4e7;border-right:none;">
                <p style="margin:0 0 4px;color:#71717a;font-size:16px;text-transform:uppercase;letter-spacing:1px;">Kod vouchera</p>
                <p style="margin:0;color:#FF8C00;font-size:22px;font-weight:bold;letter-spacing:3px;">${params.code}</p>
              </td>
              <td width="50%" style="padding:16px;background:#f9f9f9;border-radius:0 8px 8px 0;border:1px solid #e4e4e7;text-align:right;">
                <p style="margin:0 0 4px;color:#71717a;font-size:16px;text-transform:uppercase;letter-spacing:1px;">Ważny do</p>
                <p style="margin:0;color:#18181b;font-size:16px;font-weight:bold;">${params.validUntil}</p>
              </td>
            </tr>
          </table>

          <p style="color:#18181b;margin:0 0 8px;font-size:16px;">
          Ważne informacje!
          </p>
          <p style="color:#18181b;font-size:16px;line-height:1.6;margin:0 0 28px;">
            Pamiętaj, że zawsze możesz zmienić termin warsztatów na maksymalnie tydzień - 7 dni - przed ich rozpoczęciem. <br />
            Warsztaty odbędą się przy zapisaniu się minimum 4 osób.
          </p>

          <p style="color:#18181b;margin:0 0 8px;font-size:16px;">Jak zarezerwować termin? </p>
          <p style="color:#18181b;font-size:16px;line-height:1.6;margin:0 0 28px;">
            Przejdź do formularza kontaktowego, napisz wiadomość i podaj kod vouchera w treści wiadomości. Termin zostanie potwierdzony przez pracownię.
          </p>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
            <tr style="text-align:center">
              <td>
                <a href="${params.siteUrl}/contact"
                   style="display:inline-block;background:#FF8C00;color:#000000;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">
                  Umów termin warsztatów →
                </a>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Stopka -->
        <tr><td style="text-align: center;padding:20px 40px;background:#f9fafb;border-top:1px solid #e4e4e7;">
          <p style="margin:0;color:#71717a;font-size:12px;line-height:1.6;">
            <strong style="color:#3f3f46;">MR Glass Project Maciej Rafalski</strong> · Pracownia Szkła Artystycznego <br>
            ul. Grójecka 79 lok. 7, 02-094 Warszawa<br>
            e-mail: <a href="mailto:rezerwacje@mrglassproject.com" style="color:#FF8C00;text-decoration:none;">rezerwacje@mrglassproject.com</a><br>
            www: <a href="https://mrglassproject.com/" style="color:#FF8C00;text-decoration:none;">mrglassproject.com</a>
          </p>
        </td></tr>

      </table>

      <p style="color:#a1a1aa;font-size:12px;text-align:center;margin:16px 0 0;">
        Wiadomość została wygenerowana automatycznie. W razie pytań możesz odpowiedzieć na ten e-mail.
      </p>

    </td></tr>
  </table>

</body>
</html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.resendApiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    'MR Glass Project <noreply@mrglassproject.com>',
      to:      [params.to],
      reply_to: 'rezerwacje@mrglassproject.com',
      cc:      ['rezerwacje@mrglassproject.com', 'glassprojectwarszawa@gmail.com'],   
      subject: `🎁 Twój voucher na warsztaty - ${params.workshopTitle}`,
      html,
      attachments: [
        {
          filename:    `voucher-${params.code}.png`,
          content:     params.pngBase64,
          content_id:  'voucher-image',
          content_type:'image/png',
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend error ${response.status}: ${err}`);
  }
}

// ─── Główny handler ───────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Healthcheck
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'glassproject-voucher-worker' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stripe Webhook
    if (url.pathname === '/webhook/stripe' && request.method === 'POST') {
      const signature = request.headers.get('stripe-signature');
      if (!signature) {
        return new Response('Missing stripe-signature', { status: 400 });
      }

      const body = await request.text();

      // Weryfikacja podpisu
      const valid = await stripeVerify(body, signature, env.STRIPE_WEBHOOK_SECRET);
      if (!valid) {
        return new Response('Invalid signature', { status: 401 });
      }

      let event: any;
      try {
        event = JSON.parse(body);
      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }

      // Obsługujemy tylko checkout.session.completed
      if (event.type !== 'checkout.session.completed') {
        return new Response('Event ignored', { status: 200 });
      }

      const session  = event.data.object;
      const metadata = session.metadata ?? {};

      // Wymagane metadane z Stripe Checkout
      const recipientName = metadata.recipient_name ?? session.customer_details?.name ?? 'drogi kliencie';
      const recipientEmail = metadata.recipient_email ?? session.customer_details?.email;
      const workshopTitle  = metadata.workshop_title  ?? 'Warsztaty ze Szkła Artystycznego';
      const price          = Math.round((session.amount_total ?? 0) / 100); // grosze → zł

      if (!recipientEmail) {
        console.error('Brak e-mail odbiorcy w sesji Stripe:', session.id);
        return new Response('Missing recipient email', { status: 422 });
      }

      // Generuj voucher
      const code = generateVoucherCode();
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() + 1);
      const validUntil = validDate.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });

      try {
        const svg      = await generateVoucherSvg({ recipientName, workshopTitle, price, code, validUntil });
        const png      = await svgToPng(svg);
        const pngBase64 = btoa(String.fromCharCode(...png));

        await sendVoucherEmail({
          to: recipientEmail,
          recipientName,
          workshopTitle,
          code,
          validUntil,
          pngBase64,
          resendApiKey: env.RESEND_API_KEY,
          siteUrl:      env.SITE_URL,
        });

        console.log(`Voucher ${code} wysłany na ${recipientEmail} (sesja ${session.id})`);
      } catch (err) {
        console.error('Błąd generowania/wysyłki vouchera:', err);
        // Zwracamy 200 żeby Stripe nie ponawiał — logujemy błąd ręcznie
        return new Response('Voucher processing error (logged)', { status: 200 });
      }

      return new Response('OK', { status: 200 });
    }

    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;