const FALLBACKS = {
  HODLer:
    'Long-term holders often benefit from ignoring daily noise. Consider reviewing your allocation once a month instead of reacting to every price move.',
  'Day Trader':
    'Volatility is your friend only with discipline. Define your entry, exit and stop-loss before opening a position, and never risk more than you can afford to lose.',
  'NFT Collector':
    'NFT markets are driven by community and liquidity. Check trading volume and holder distribution before buying, not just the floor price.',
};

export async function getInsight({ assets = [], investorType = 'HODLer' }) {
  const fallback = FALLBACKS[investorType] ?? FALLBACKS.HODLer;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return fallback;

  const prompt = `You are a concise crypto analyst. Give one short "insight of the day" (3-4 sentences) for a ${investorType} who is interested in: ${assets.join(', ') || 'the crypto market'}. Be practical, avoid hype. Do not give financial advice or price predictions, and do not mention specific upgrades, dates or prices; keep it general and practical.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);

    const json = await response.json();
    const choice = json.choices?.[0];
    const text = choice?.message?.content?.trim();
    if (!text || choice.finish_reason === 'length') return fallback;
    return text;
  } catch (err) {
    console.error(err.message);
    return fallback;
  }
}
