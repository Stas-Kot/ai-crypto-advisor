import { readFile } from 'node:fs/promises';

const cache = new Map();
const TTL_MS = 5 * 60 * 1000;

const SYMBOLS = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  cardano: 'ADA',
  dogecoin: 'DOGE',
  ripple: 'XRP',
};

async function loadFallback() {
  const file = new URL('../data/news.fallback.json', import.meta.url);
  return JSON.parse(await readFile(file, 'utf-8'));
}

export async function getNews(assets = []) {
  const key = [...assets].sort().join(',');
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < TTL_MS) {
    return cached.data;
  }

  const apiKey = process.env.CRYPTOPANIC_KEY;
  if (!apiKey) return loadFallback();

  try {
    const currencies = assets
      .map(a => SYMBOLS[a])
      .filter(Boolean)
      .join(',');
    let url = `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&public=true`;
    if (currencies) url += `&currencies=${currencies}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`CryptoPanic error: ${response.status}`);

    const raw = await response.json();
    const data = raw.results.slice(0, 6).map(post => ({
      id: String(post.id),
      title: post.title,
      source: post.source?.title ?? 'CryptoPanic',
      url: post.url,
      published: post.published_at,
    }));

    if (data.length === 0) return loadFallback();

    cache.set(key, { time: Date.now(), data });
    return data;
  } catch (err) {
    console.error(err.message);
    return loadFallback();
  }
}
