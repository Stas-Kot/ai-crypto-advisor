import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { getPrices } from '../services/coingecko.js';
import { getNews } from '../services/news.js';
import { getInsight } from '../services/ai.js';
import { getMeme } from '../services/memes.js';

const router = Router();

async function getDailyInsight(userId, preference) {
  const date = new Date().toISOString().slice(0, 10);

  const existing = await prisma.dailyInsight.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (existing) return { id: `insight-${date}`, text: existing.text };

  const text = await getInsight({
    assets: preference.assets,
    investorType: preference.investorType,
  });

  await prisma.dailyInsight.upsert({
    where: { userId_date: { userId, date } },
    update: { text },
    create: { userId, date, text },
  });

  return { id: `insight-${date}`, text };
}

router.get('/', requireAuth, async (req, res) => {
  const preference = await prisma.preference.findUnique({
    where: { userId: req.user.id },
  });
  if (!preference) {
    return res.status(400).json({ error: 'Complete onboarding first' });
  }

  const wants = type => preference.contentTypes.includes(type);

  // Sections the user did not choose are not requested at all (undefined).
  const [news, prices, insight, meme] = await Promise.allSettled([
    wants('Market News') ? getNews(preference.assets) : undefined,
    wants('Charts') ? getPrices(preference.assets) : undefined,
    getDailyInsight(req.user.id, preference),
    wants('Fun') ? getMeme() : undefined,
  ]);

  const errors = {};
  const value = (r, name) => {
    if (r.status === 'fulfilled') return r.value;
    errors[name] = r.reason?.message;
    console.error(`Dashboard section "${name}" failed:`, r.reason?.message);
    return null;
  };

  res.json({
    preference,
    news: value(news, 'news'),
    prices: value(prices, 'prices'),
    insight: value(insight, 'insight'),
    meme: value(meme, 'meme'),
    errors,
  });
});

export default router;
