const cache = new Map();
const TTL_MS = 60 * 1000;

export async function getPrices(ids) {
  const key = [...ids].sort().join(',');
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < TTL_MS) {
    return cached.data;
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${key}&vs_currencies=usd&include_24hr_change=true`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko error: ${response.status}`);
  }

  const raw = await response.json();
  const data = Object.entries(raw).map(([id, values]) => ({
    id,
    price: values.usd,
    change24h: values.usd_24h_change,
  }));

  cache.set(key, { time: Date.now(), data });
  return data;
}
