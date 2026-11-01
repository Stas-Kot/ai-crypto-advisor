import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const INVESTOR_TYPES = ['HODLer', 'Day Trader', 'NFT Collector'];
const CONTENT_TYPES = ['Market News', 'Charts', 'Social', 'Fun'];

router.get('/', requireAuth, async (req, res) => {
  const preference = await prisma.preference.findUnique({
    where: { userId: req.user.id },
  });
  res.json(preference);
});

router.post('/', requireAuth, async (req, res) => {
  const { assets, investorType, contentTypes } = req.body;

  if (!Array.isArray(assets) || assets.length === 0) {
    return res.status(400).json({ error: 'Select at least one asset' });
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

  const preference = await prisma.preference.upsert({
    where: { userId: req.user.id },
    update: { assets, investorType, contentTypes },
    create: { userId: req.user.id, assets, investorType, contentTypes },
  });

  res.json(preference);
});

export default router;
