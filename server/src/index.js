import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from './routes/auth.js';
import preferencesRoutes from './routes/preferences.js';
import dashboardRoutes from './routes/dashboard.js';
import votesRoutes from './routes/votes.js';
import { prisma } from './db.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/votes', votesRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get('/api/me', requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true },
    });
    res.json(user);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
