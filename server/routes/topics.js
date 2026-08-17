const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');

const ICON_DENYLIST = ['commons-logo', 'wiktionary', 'wikiquote', 'wikisource', 'wikidata', 'edit-icon', 'folder', 'question_book', 'ambox', 'padlock', 'symbol', 'disambig', 'wiki_letter', 'flag_of', 'icon', '.svg'];
function isUsableImage(url) {
  const lower = url.toLowerCase();
  if (!lower.match(/\.(jpg|jpeg|png)$/)) return false;
  return !ICON_DENYLIST.some((bad) => lower.includes(bad));
}
function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET /api/topics/random
router.get('/random', async (req, res) => {
  try {
    const count = await Topic.countDocuments();
    if (count === 0) return res.status(404).json({ error: 'No topics yet' });
    const random = await Topic.findOne().skip(Math.floor(Math.random() * count));
    res.json(random);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get random topic' });
  }
});

// GET /api/topics/search?q=
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const results = await Topic.find({ title: { $regex: q, $options: 'i' } })
      .limit(8).select('slug title color');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// POST /api/topics  (admin: create)
router.post('/', async (req, res) => {
  try {
    const { title, tagline, color, related, images, videoUrl } = req.body;
    if (!title || !tagline) return res.status(400).json({ error: 'title and tagline are required' });

    const slug = slugify(title);
    const topic = await Topic.findOneAndUpdate(
      { slug },
      { slug, title, tagline, color: color || '#6b7280', related: related || [], images: images || [], videoUrl },
      { upsert: true, new: true }
    );
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// PUT /api/topics/:slug  (admin: update)
router.put('/:slug', async (req, res) => {
  try {
    const { title, tagline, color, related, images, videoUrl } = req.body;
    const topic = await Topic.findOneAndUpdate(
      { slug: req.params.slug.toLowerCase() },
      { title, tagline, color, related, images, videoUrl },
      { new: true }
    );
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// DELETE /api/topics/:slug  (admin: delete)
router.delete('/:slug', async (req, res) => {
  try {
    const result = await Topic.findOneAndDelete({ slug: req.params.slug.toLowerCase() });
    if (!result) return res.status(404).json({ error: 'Topic not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// GET /api/topics/:slug  (falls back to Wikipedia, then DuckDuckGo, and caches result if not found locally)
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    let topic = await Topic.findOne({ slug });
    if (topic) return res.json(topic);

    const title = slug.replace(/-/g, ' ');
    const palette = ['#c2410c', '#0891b2', '#7c3aed', '#16a34a', '#db2777', '#0d9488', '#eab308', '#dc2626', '#2563eb', '#9333ea', '#059669', '#0284c7', '#e11d48', '#f97316', '#65a30d'];
    const color = palette[Math.abs(hashCode(slug)) % palette.length];

    // Layer 1: Wikipedia (best coverage for people/places/history/science, free, no key)
    const wiki = await tryWikipedia(title);
    if (wiki) {
      topic = await Topic.create({ slug, title: wiki.title, tagline: wiki.tagline, color, images: wiki.images, related: wiki.related || [] });
      return res.json(topic);
    }

    // Layer 2: DuckDuckGo Instant Answer (free, no key, weaker coverage — catches some things Wikipedia misses)
    const ddg = await tryDuckDuckGo(title);
    if (ddg) {
      topic = await Topic.create({ slug, title: ddg.title, tagline: ddg.tagline, color, images: ddg.images, related: ddg.related || [] });
      return res.json(topic);
    }

    // Layer 3 (not implemented): a real web search API (Google Custom Search / Bing / SerpAPI)
    // would go here if you add an API key later — see README for notes. Without one,
    // free sources only cover a subset of what a full search engine would.

    return res.status(404).json({ error: 'Topic not found' });
  } catch (err) {
    console.error('Topic lookup failed:', err.message);
    res.status(404).json({ error: 'Topic not found' });
  }
});

async function tryWikipedia(title) {
  // Step 1: resolve the best-matching real Wikipedia title via search — this handles
  // casing, nicknames, and partial matches (e.g. "thalapathy vijay" -> "Vijay (actor)")
  // that a naive direct summary lookup would miss.
  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&format=json&srlimit=1&origin=*`,
    { headers: { 'User-Agent': 'KnowledgeUniverseProject/1.0 (educational portfolio project)' } }
  );
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json();
  const bestMatch = searchData?.query?.search?.[0]?.title;
  if (!bestMatch) return null;

  // Step 2: fetch the real summary using the resolved, correctly-cased title.
  const summaryRes = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch)}`,
    { headers: { 'User-Agent': 'KnowledgeUniverseProject/1.0 (educational portfolio project)' } }
  );
  if (!summaryRes.ok) return null;

  const summary = await summaryRes.json();
  if (summary.type === 'disambiguation' || !summary.extract) return null;

  const imgRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&generator=images&titles=${encodeURIComponent(bestMatch)}&gimlimit=20&prop=imageinfo&iiprop=url|size&origin=*`,
    { headers: { 'User-Agent': 'KnowledgeUniverseProject/1.0 (educational portfolio project)' } }
  );
  let images = [];
  if (imgRes.ok) {
    const imgData = await imgRes.json();
    const pages = imgData?.query?.pages;
    if (pages) {
      images = Object.values(pages)
        .map((p) => p.imageinfo?.[0]).filter(Boolean)
        .filter((info) => info.width >= 200 && info.height >= 200)
        .map((info) => info.url).filter(isUsableImage).slice(0, 3);
    }
  }
  if (images.length === 0 && summary.thumbnail?.source) images = [summary.thumbnail.source];

  const related = await fetchRelated(bestMatch).catch(() => []);

  return {
    title: summary.title || bestMatch,
    tagline: summary.extract.split('. ').slice(0, 2).join('. ') + '.',
    images,
    related,
  };
}

// Combines two strategies so "related" is almost never empty:
// 1. Real outgoing links from the article (best relevance when the page has enough of them)
// 2. Wikipedia's "morelike" search, which finds textually similar articles by content —
//    works even for stats/table-heavy pages that have few in-body wikilinks.
async function fetchRelated(title) {
  const fromLinks = await fetchRelatedLinks(title).catch(() => []);
  if (fromLinks.length >= 3) return fromLinks;

  const fromSimilar = await fetchMoreLike(title).catch(() => []);
  const combined = [...fromLinks];
  for (const slug of fromSimilar) {
    if (!combined.includes(slug) && combined.length < 5) combined.push(slug);
  }
  return combined;
}

async function fetchMoreLike(title) {
  const res = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent('morelike:' + title)}&gsrlimit=6&format=json&origin=*`,
    { headers: { 'User-Agent': 'KnowledgeUniverseProject/1.0 (educational portfolio project)' } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return [];

  return Object.values(pages)
    .map((p) => p.title)
    .filter((t) => t && !LINK_NOISE_PATTERNS.some((re) => re.test(t)))
    .slice(0, 5)
    .map((t) => slugify(t));
}
const LINK_NOISE_PATTERNS = [
  /^list of /i, /^index of /i, /^outline of /i, /^wikipedia:/i, /^template:/i,
  /^category:/i, /^portal:/i, /^help:/i, /^international standard/i,
  /^iso \d/i, /\(disambiguation\)$/i, /^geographic coordinate/i,
];

async function fetchRelatedLinks(title) {
  const res = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&prop=links&titles=${encodeURIComponent(title)}&plnamespace=0&pllimit=30&format=json&origin=*`,
    { headers: { 'User-Agent': 'KnowledgeUniverseProject/1.0 (educational portfolio project)' } }
  );
  if (!res.ok) return [];

  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return [];

  const links = Object.values(pages)
    .flatMap((p) => p.links || [])
    .map((l) => l.title)
    .filter((t) => t && !LINK_NOISE_PATTERNS.some((re) => re.test(t)))
    .filter((t) => t.length > 2 && t.length < 60);

  // Take a handful spread across the list rather than just the first few (which tend
  // to be generic terms like "Latin" or "Common Era" near the top of many articles).
  const picked = [];
  const step = Math.max(1, Math.floor(links.length / 5));
  for (let i = 0; i < links.length && picked.length < 5; i += step) {
    picked.push(links[i]);
  }

  return picked.map((t) => slugify(t));
}

async function tryDuckDuckGo(title) {
  const res = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(title)}&format=json&no_html=1&skip_disambig=1`
  );
  if (!res.ok) return null;
  const data = await res.json();

  const abstract = data.AbstractText || data.Answer || '';
  if (!abstract) return null;

  const resolvedTitle = data.Heading || title;
  const tagline = abstract.split('. ').slice(0, 2).join('. ') + (abstract.includes('. ') ? '.' : '');

  // Even though the summary came from DDG, Wikipedia often still has a page for the
  // same title we can pull outgoing links from — try it so connections aren't empty.
  const related = await fetchRelated(resolvedTitle).catch(() => []);

  return {
    title: resolvedTitle,
    tagline,
    images: data.Image ? [`https://duckduckgo.com${data.Image}`] : [],
    related,
  };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// GET /api/topics  (list all)
router.get('/', async (req, res) => {
  try {
    const all = await Topic.find().select('slug title color').sort({ title: 1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list topics' });
  }
});

module.exports = router;
