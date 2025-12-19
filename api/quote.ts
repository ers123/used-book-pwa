import * as cheerio from 'cheerio';

type Provider = 'aladin' | 'yes24' | 'none';

type ProviderQuote = {
  is_buyable: boolean;
  price: number;
  error?: string;
  source_url?: string;
};

type BookQuote = {
  isbn: string;
  title: string;
  aladin: ProviderQuote;
  yes24: ProviderQuote;
  recommendation: Provider;
};

const QUOTE_TTL_MS = 1000 * 60 * 60 * 24 * 2; // 2 days (best-effort)
const quoteCache = new Map<string, { expiresAt: number; data: BookQuote }>();

const RATE_WINDOW_MS = 1000 * 60 * 10;
const RATE_MAX = 60;
const rate = new Map<string, { windowStart: number; count: number }>();

function getClientId(req: any) {
  const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function cleanIsbn(input: string) {
  return input.replace(/[^0-9Xx]/g, '').toUpperCase();
}

function isValidIsbn13(isbn13: string) {
  if (!/^\d{13}$/.test(isbn13)) return false;
  const digits = isbn13.split('').map((d) => Number(d));
  const sum = digits
    .slice(0, 12)
    .reduce((acc, d, idx) => acc + d * (idx % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return check === digits[12];
}

function isValidIsbn10(isbn10: string) {
  if (!/^\d{9}[\dX]$/.test(isbn10)) return false;
  const chars = isbn10.split('');
  const sum = chars.slice(0, 9).reduce((acc, c, idx) => acc + Number(c) * (10 - idx), 0);
  const last = chars[9] === 'X' ? 10 : Number(chars[9]);
  return (sum + last) % 11 === 0;
}

function isbn10ToIsbn13(isbn10: string) {
  const core = `978${isbn10.slice(0, 9)}`;
  const digits = core.split('').map((d) => Number(d));
  const sum = digits.reduce((acc, d, idx) => acc + d * (idx % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return `${core}${check}`;
}

function normalizeIsbnTo13(raw: string) {
  const cleaned = cleanIsbn(raw);
  if (cleaned.length === 13 && isValidIsbn13(cleaned)) return cleaned;
  if (cleaned.length === 10 && isValidIsbn10(cleaned)) return isbn10ToIsbn13(cleaned);
  return null;
}

function parseWon(value: string) {
  return Number(value.replace(/,/g, ''));
}

function extractBestBuybackPrice(text: string) {
  const matches = Array.from(text.matchAll(/([0-9]{1,3}(?:,[0-9]{3})*)\s*원/g));
  if (matches.length === 0) return 0;

  const candidates: number[] = [];
  for (const m of matches) {
    const idx = m.index ?? 0;
    const window = text.slice(Math.max(0, idx - 30), Math.min(text.length, idx + 30));
    if (/매입|바이백|중고|판매|보상/i.test(window)) {
      candidates.push(parseWon(m[1]));
    }
  }

  const pool = candidates.length ? candidates : matches.map((m) => parseWon(m[1]));
  return pool.reduce((max, n) => (n > max ? n : max), 0);
}

function extractTitle($: cheerio.CheerioAPI) {
  const og = $('meta[property="og:title"]').attr('content')?.trim();
  if (og) return og;
  const title = $('title').text().trim();
  if (!title) return null;
  return title.replace(/\s*-\s*(YES24|알라딘|Aladin).*/i, '').trim();
}

async function fetchText(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.7,en;q=0.6',
      },
      redirect: 'follow',
    });
    if (!res.ok) return { ok: false as const, status: res.status, url };
    const html = await res.text();
    return { ok: true as const, html, url };
  } finally {
    clearTimeout(timeout);
  }
}

async function tryUrls(urls: string[]) {
  for (const url of urls) {
    try {
      const r = await fetchText(url);
      if (r.ok && r.html.length > 200) return r;
    } catch {
      // ignore and try next
    }
  }
  return null;
}

async function fetchYes24Quote(isbn13: string): Promise<{ title: string | null; quote: ProviderQuote }> {
  // Best-effort: YES24 buyback pages can be JS-driven. We try multiple endpoints and fall back gracefully.
  const urls = [
    `https://m.yes24.com/buyback/search?query=${encodeURIComponent(isbn13)}`,
    `https://m.yes24.com/buyback/search?keyword=${encodeURIComponent(isbn13)}`,
    `https://m.yes24.com/buyback/search?searchKeyword=${encodeURIComponent(isbn13)}`,
    `https://m.yes24.com/buyback/search?searchWord=${encodeURIComponent(isbn13)}`,
  ];

  const hit = await tryUrls(urls);
  if (!hit) {
    return {
      title: null,
      quote: { is_buyable: false, price: 0, error: 'YES24 lookup failed (no response)', source_url: urls[0] },
    };
  }

  const $ = cheerio.load(hit.html);
  const title = extractTitle($);
  const text = $('body').text().replace(/\s+/g, ' ');

  const price = extractBestBuybackPrice(text);
  const notBuyable = /신청\s*불가|매입\s*불가|바이백\s*불가|품절/i.test(text);

  return {
    title,
    quote: {
      is_buyable: price > 0 && !notBuyable,
      price: price > 0 ? price : 0,
      error: price > 0 ? undefined : notBuyable ? 'Not buyable' : 'Unable to parse buyback price',
      source_url: hit.url,
    },
  };
}

async function fetchAladinQuote(isbn13: string): Promise<{ title: string | null; quote: ProviderQuote }> {
  const urls = [
    `https://www.aladin.co.kr/usedstore/wc2b_search.aspx?SearchWord=${encodeURIComponent(isbn13)}`,
    `https://www2.aladin.co.kr/usedstore/wc2b_search.aspx?SearchWord=${encodeURIComponent(isbn13)}`,
    `https://used.aladin.co.kr/shop/usedshop/wc2b_search.aspx?SearchWord=${encodeURIComponent(isbn13)}`,
    `https://www.aladin.co.kr/shop/usedshop/wc2b_search.aspx?SearchWord=${encodeURIComponent(isbn13)}`,
  ];

  const hit = await tryUrls(urls);
  if (!hit) {
    return {
      title: null,
      quote: { is_buyable: false, price: 0, error: 'Aladin lookup failed (no response)', source_url: urls[0] },
    };
  }

  const $ = cheerio.load(hit.html);
  const title = extractTitle($);
  const text = $('body').text().replace(/\s+/g, ' ');

  const price = extractBestBuybackPrice(text);
  const notBuyable = /매입\s*불가|매입\s*대상\s*아님|품절/i.test(text);

  return {
    title,
    quote: {
      is_buyable: price > 0 && !notBuyable,
      price: price > 0 ? price : 0,
      error: price > 0 ? undefined : notBuyable ? 'Not buyable' : 'Unable to parse buyback price',
      source_url: hit.url,
    },
  };
}

function recommend(aladin: ProviderQuote, yes24: ProviderQuote): Provider {
  if (aladin.is_buyable && yes24.is_buyable) {
    const diff = Math.abs(aladin.price - yes24.price);
    if (diff <= 500) return 'aladin';
    return aladin.price >= yes24.price ? 'aladin' : 'yes24';
  }
  if (aladin.is_buyable) return 'aladin';
  if (yes24.is_buyable) return 'yes24';
  return 'none';
}

function json(res: any, status: number, body: any, headers: Record<string, string> = {}) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  try {
    const clientId = getClientId(req);
    const now = Date.now();
    const rl = rate.get(clientId) ?? { windowStart: now, count: 0 };
    if (now - rl.windowStart > RATE_WINDOW_MS) {
      rl.windowStart = now;
      rl.count = 0;
    }
    rl.count += 1;
    rate.set(clientId, rl);
    if (rl.count > RATE_MAX) {
      return json(res, 429, { error: 'Too many requests. Slow down.' }, { 'cache-control': 'no-store' });
    }

    const isbnParam = (req.query?.isbn ?? req.query?.ISBN ?? req.query?.q ?? req.query?.query) as string | undefined;
    if (!isbnParam) {
      return json(res, 400, { error: 'isbn is required' }, { 'cache-control': 'no-store' });
    }

    const isbn13 = normalizeIsbnTo13(isbnParam);
    if (!isbn13) {
      return json(res, 400, { error: 'invalid isbn (provide ISBN-10 or ISBN-13)' }, { 'cache-control': 'no-store' });
    }

    const cached = quoteCache.get(isbn13);
    if (cached && cached.expiresAt > now) {
      return json(
        res,
        200,
        cached.data,
        { 'cache-control': 's-maxage=86400, stale-while-revalidate=604800' }
      );
    }

    const [aladin, yes24] = await Promise.all([fetchAladinQuote(isbn13), fetchYes24Quote(isbn13)]);
    const title = aladin.title || yes24.title || 'Title unavailable';

    const data: BookQuote = {
      isbn: isbn13,
      title,
      aladin: aladin.quote,
      yes24: yes24.quote,
      recommendation: recommend(aladin.quote, yes24.quote),
    };

    quoteCache.set(isbn13, { expiresAt: now + QUOTE_TTL_MS, data });

    return json(res, 200, data, { 'cache-control': 's-maxage=86400, stale-while-revalidate=604800' });
  } catch (err) {
    console.error('quote handler error', err);
    return json(res, 500, { error: 'lookup failed (server error)' }, { 'cache-control': 'no-store' });
  }
}
