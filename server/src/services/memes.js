import { readFile } from 'node:fs/promises';

const SUBREDDIT = 'cryptocurrencymemes';

async function loadFallback() {
  const file = new URL('../data/memes.json', import.meta.url);
  const memes = JSON.parse(await readFile(file, 'utf-8'));
  return memes[Math.floor(Math.random() * memes.length)];
}

async function fetchRemoteMeme() {
  const response = await fetch(`https://meme-api.com/gimme/${SUBREDDIT}`, {
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error(`meme-api error: ${response.status}`);

  const meme = await response.json();
  if (meme.nsfw || !meme.url || !/\.(jpe?g|png|gif)$/i.test(meme.url)) {
    throw new Error('Meme is not a safe image post');
  }

  const postId = meme.postLink?.split('/').pop() ?? meme.url.split('/').pop();
  return { id: `reddit-${postId}`, title: meme.title, url: meme.url };
}

export async function getMeme() {
  try {
    return await fetchRemoteMeme();
  } catch (err) {
    console.error(`Meme source failed, using fallback: ${err.message}`);
    return loadFallback();
  }
}