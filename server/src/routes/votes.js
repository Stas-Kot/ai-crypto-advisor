import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const SECTIONS = ['news', 'prices', 'insight', 'meme'];

router.get('/', requireAuth, async (req, res) => {
  const votes = await prisma.vote.findMany({
    where: { userId: req.user.id },
    select: { section: true, itemId: true, value: true },
  });
  res.json(votes);
});

router.post('/', requireAuth, async (req, res) => {
  const { section, itemId, value, metadata } = req.body;

  if (!SECTIONS.includes(section)) {
    return res.status(400).json({ error: 'Invalid section' });
  }
  if (!itemId || typeof itemId !== 'string') {
    return res.status(400).json({ error: 'itemId is required' });
  }
  if (value !== 1 && value !== -1) {
    return res.status(400).json({ error: 'value must be 1 or -1' });
  }

  const preference = await prisma.preference.findUnique({
    where: { userId: req.user.id },
  });

  const context = {
    ...(metadata ?? {}),
    investorType: preference?.investorType ?? null,
    assets: preference?.assets ?? [],
  };

  const vote = await prisma.vote.upsert({
    where: {
      userId_section_itemId: { userId: req.user.id, section, itemId },
    },
    update: { value, metadata: context },
    create: { userId: req.user.id, section, itemId, value, metadata: context },
  });

  res.json(vote);
});

router.delete('/', requireAuth, async (req, res) => {
  const { section, itemId } = req.body;

  if (!SECTIONS.includes(section) || !itemId || typeof itemId !== 'string') {
    return res.status(400).json({ error: 'section and itemId are required' });
  }

  await prisma.vote.deleteMany({
    where: { userId: req.user.id, section, itemId },
  });

  res.json({ ok: true });
});

export default router;
