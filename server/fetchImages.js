require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');

// Wikipedia file names that are generic site icons/logos, not real content images —
// filter these out so we don't end up with Wikipedia's own UI chrome as "topic photos".
const ICON_DENYLIST = [
  'commons-logo', 'wiktionary', 'wikiquote', 'wikisource', 'wikidata',
  'edit-icon', 'folder', 'question_book', 'ambox', 'padlock', 'symbol',
  'disambig', 'wiki_letter', 'flag_of', 'icon', '.svg',
];

function isUsableImage(url) {
  const lower = url.toLowerCase();
  if (!lower.match(/\.(jpg|jpeg|png)$/)) return false;
  return !ICON_DENYLIST.some((bad) => lower.includes(bad));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchImagesForTitle(title, attempt = 1) {
  // redirects=1 follows Wikipedia redirect pages (e.g. "Einstein" -> "Albert Einstein")
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&generator=images&titles=${encodeURIComponent(title)}&gimlimit=20&prop=imageinfo&iiprop=url|size&origin=*`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'KnowledgeUniverseProject/1.0 (educational portfolio project)',
    },
  });

  if (res.status === 429) {
    if (attempt >= 4) throw new Error('HTTP 429 (gave up after retries)');
    const backoff = 2000 * attempt;
    await sleep(backoff);
    return fetchImagesForTitle(title, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (likely rate-limited): ${text.slice(0, 60)}`);
  }

  const pages = data?.query?.pages;
  if (!pages) return [];

  const images = Object.values(pages)
    .map((p) => p.imageinfo?.[0])
    .filter(Boolean)
    .filter((info) => info.width >= 200 && info.height >= 200) // skip tiny icons
    .map((info) => info.url)
    .filter(isUsableImage);

  return images.slice(0, 3);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const topics = await Topic.find();
  console.log(`Fetching real images for ${topics.length} topics from Wikipedia...\n`);

  for (const topic of topics) {
    try {
      const images = await fetchImagesForTitle(topic.title);
      if (images.length > 0) {
        topic.images = images;
        await topic.save();
        console.log(`  ✓ ${topic.title} — found ${images.length} image(s)`);
      } else {
        console.log(`  ⚠ ${topic.title} — no usable images found, keeping existing`);
      }
    } catch (err) {
      console.log(`  ✗ ${topic.title} — fetch failed: ${err.message}`);
    }
    await sleep(2000); // space out requests to stay well under Wikipedia's rate limit
  }

  console.log('\nDone.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
