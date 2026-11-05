import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const INVESTOR_TYPES = ['HODLer', 'Day Trader', 'NFT Collector'];
const CONTENT_TYPES = ['Market News', 'Charts', 'Social', 'Fun'];
const ASSETS = ['bitcoin', 'ethereum', 'solana', 'cardano', 'dogecoin', 'ripple'];

router.get('/', requireAuth, async (req, res) => {
  const preference = await prisma.preference.findUnique({
    where: { userId: req.user.id },
  });
  res.json(preference);
});

router.post('/', requireAuth, async (req, res) => {
  const { assets, investorType, contentTypes } = req.body;

  if (!Array.isArray(assets) || assets.length === 0 || !assets.every(a => ASSETS.includes(a))) {
    return res.status(400).json({ error: 'Invalid assets' });
  }
  if (!INVESTOR_TYPES.includes(investorType)) {
    return res.status(400).json({ error: 'Invalid investor type' });
  }
  if (
    !Array.isArray(contentTypes) ||
    contentTypes.length === 0 ||
    !contentTypes.every(c => CONTENT_TYPES.includes(c))
  ) {
    return res.status(400).json({ error: 'Invalid content types' });
  }

  const uniqueAssets = [...new Set(assets)];
  const uniqueContentTypes = [...new Set(contentTypes)];

  const preference = await prisma.preference.upsert({
    where: { userId: req.user.id },
    update: { assets: uniqueAssets, investorType, contentTypes: uniqueContentTypes },
    create: { userId: req.user.id, assets: uniqueAssets, investorType, contentTypes: uniqueContentTypes },
  });

  res.json(preference);
});

export default router;
