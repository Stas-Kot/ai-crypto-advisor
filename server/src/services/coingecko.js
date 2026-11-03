const cache = new Map();
const TTL_MS = 60 * 1000;

const SYMBOLS = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  cardano: 'ADA',
  dogecoin: 'DOGE',
  ripple: 'XRP',
};

async function fromCoinGecko(ids) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);
  const raw = await response.json();
  const data = Object.entries(raw).map(([id, v]) => ({
    id,
    price: v.usd,
    change24h: v.usd_24h_change ?? 0,
  }));
  if (data.length === 0) throw new Error('CoinGecko returned no data');
  return data;
}

async function fromCryptoCompare(ids) {
  const symbols = ids.map(id => SYMBOLS[id]).filter(Boolean);
  if (symbols.length === 0) throw new Error('No known symbols');
  const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbols.join(',')}&tsyms=USD`;
  const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error(`CryptoCompare error: ${response.status}`);
  const raw = await response.json();
  const data = ids
    .filter(id => SYMBOLS[id] && raw.RAW?.[SYMBOLS[id]]?.USD)
    .map(id => {
      const usd = raw.RAW[SYMBOLS[id]].USD;
      return { id, price: usd.PRICE, change24h: usd.CHANGEPCT24HOUR ?? 0 };
    });
  if (data.length === 0) throw new Error('CryptoCompare returned no data');
  return data;
}

export async function getPrices(ids) {
  const sorted = [...ids].sort();
  const key = sorted.join(',');
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < TTL_MS) {
    return cached.data;
  }

  const errors = [];
  for (const source of [fromCoinGecko, fromCryptoCompare]) {
    try {
      const data = await source(sorted);
      cache.set(key, { time: Date.now(), data });
      return data;
    } catch (err) {
      errors.push(err.message);
    }
  }

  if (cached) return cached.data;
  throw new Error(errors.join(' | '));
}
