import 'dotenv/config';
import { getInsight } from './services/ai.js';

console.log(await getInsight({ assets: ['bitcoin', 'ethereum'], investorType: 'HODLer' }));
