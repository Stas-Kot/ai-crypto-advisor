import { readFile } from 'node:fs/promises';

export async function getMeme() {
  const file = new URL('../data/memes.json', import.meta.url);
  const memes = JSON.parse(await readFile(file, 'utf-8'));
  return memes[Math.floor(Math.random() * memes.length)];
}
