// import { readFile } from 'node:fs/promises';

// const SUBREDDIT = 'cryptocurrencymemes';
// const TTL_MS = 10 * 60 * 1000;

// let cache = { time: 0, memes: [] };

// async function loadFallback() {
//   const file = new URL('../data/memes.json', import.meta.url);
//   return JSON.parse(await readFile(file, 'utf-8'));
// }

// async function fetchRedditMemes() {
//   if (cache.memes.length && Date.now() - cache.time < TTL_MS) {
//     return cache.memes;
//   }

//   const response = await fetch(`https://www.reddit.com/r/${SUBREDDIT}/hot.json?limit=50`, {
//     headers: { 'User-Agent': 'crypto-advisor/1.0' },
//     signal: AbortSignal.timeout(4000),
//   });
//   if (!response.ok) throw new Error(`Reddit error: ${response.status}`);

//   const json = await response.json();
//   const memes = json.data.children
//     .map(child => child.data)
//     .filter(p => !p.over_18 && !p.stickied && /\.(jpe?g|png|gif)$/i.test(p.url))
//     .map(p => ({ id: `reddit-${p.id}`, title: p.title, url: p.url }));

//   if (memes.length === 0) throw new Error('No image posts found');

//   cache = { time: Date.now(), memes };
//   return memes;
// }

// export async function getMeme() {
//   let memes;
//   try {
//     memes = await fetchRedditMemes();
//   } catch (err) {
//     console.error(`Meme source failed, using fallback: ${err.message}`);
//     memes = await loadFallback();
//   }
//   return memes[Math.floor(Math.random() * memes.length)];
// }

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