/**
 * Endpoint /preview — tylko w trybie development
 * Zwraca PNG bezpośrednio w przeglądarce
 *
 * Użycie:
 * wrangler dev
 * Otwórz: http://localhost:8787/preview
 *
 * Parametry URL (opcjonalne):
 * ?name=Jan+Kowalski
 * ?title=Warsztaty+z+Fusingu
 * ?code=GP-TEST-1234
 * ?amount=390
 */

import { generateVoucherPng } from './voucher';

export async function handlePreview(req: Request): Promise<Response> {
  // Tylko lokalnie — blokuj na produkcji
  const host = new URL(req.url).hostname;
  if (host !== 'localhost' && !host.includes('127.0.0.1')) {
    return new Response('Not found', { status: 404 });
  }

  const url    = new URL(req.url);
  const params = url.searchParams;

  try {
    const png = await generateVoucherPng({
      recipientName: params.get('name')   ?? 'Jan Kowalski',
      voucherTitle:  params.get('title')  ?? 'Warsztaty z Fusingu',
      voucherCode:   params.get('code')   ?? 'GP-ABCD-1234',
      workshopLevel: params.get('level')  ?? 'fusing',
      amount:        Number(params.get('amount') ?? 390),
      currency:      'PLN',
    });

    return new Response(png, {
      headers: {
        'Content-Type':  'image/png',
        'Cache-Control': 'no-store',
        // Wymusza wyświetlenie w przeglądarce zamiast pobierania
        'Content-Disposition': 'inline; filename="voucher-preview.png"',
      },
    });

  } catch (err) {
    return new Response(
      `Błąd generowania vouchera:\n${err instanceof Error ? err.message : String(err)}`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      },
    );
  }
}
