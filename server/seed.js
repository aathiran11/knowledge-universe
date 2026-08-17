require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');

// Deterministic placeholder images via picsum.photos (seeded by slug, so they stay
// consistent across reseeds). Swap these for real curated/historical photo URLs later —
// no code changes needed, just update the `images` arrays below.
function imgs(slug, count = 3) {
  return Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${slug}-${i}/400/400`);
}

const topics = [
  { slug: 'coffee', title: 'Coffee', tagline: 'A brewed drink from roasted coffee beans, first cultivated in the Ethiopian highlands.', color: '#c2410c', related: ['ethiopia', 'espresso', 'brazil'], images: imgs('coffee') },
  { slug: 'ethiopia', title: 'Ethiopia', tagline: 'East African nation widely considered the birthplace of coffee cultivation.', color: '#0891b2', related: ['coffee', 'africa'], images: imgs('ethiopia') },
  { slug: 'espresso', title: 'Espresso', tagline: 'A concentrated coffee brewed by forcing hot water through fine grounds under pressure.', color: '#7c3aed', related: ['coffee', 'italy', 'latte'], images: imgs('espresso') },
  { slug: 'brazil', title: 'Brazil', tagline: "The world's largest coffee producer since the 1840s.", color: '#16a34a', related: ['coffee', 'south-america'], images: imgs('brazil') },
  { slug: 'africa', title: 'Africa', tagline: 'The continent where coffee cultivation first began, in Ethiopia.', color: '#db2777', related: ['ethiopia', 'coffee'], images: imgs('africa') },
  { slug: 'italy', title: 'Italy', tagline: 'Popularized espresso culture and the modern coffee bar in the 20th century.', color: '#0d9488', related: ['espresso', 'coffee'], images: imgs('italy') },
  { slug: 'latte', title: 'Latte', tagline: 'An espresso drink made with steamed milk, originating in Italy.', color: '#eab308', related: ['espresso', 'coffee'], images: imgs('latte') },
  { slug: 'south-america', title: 'South America', tagline: 'Home to Brazil and Colombia, two of the largest coffee producing nations.', color: '#dc2626', related: ['brazil', 'coffee'], images: imgs('south-america') },
  { slug: 'einstein', title: 'Einstein', tagline: 'Physicist best known for developing the theory of relativity.', color: '#2563eb', related: ['relativity', 'physics', 'tesla'], images: imgs('einstein') },
  { slug: 'relativity', title: 'Relativity', tagline: "Einstein's theory describing how space and time are linked.", color: '#9333ea', related: ['einstein', 'physics'], images: imgs('relativity') },
  { slug: 'physics', title: 'Physics', tagline: 'The study of matter, energy, and the fundamental forces of nature.', color: '#059669', related: ['einstein', 'tesla', 'relativity'], images: imgs('physics') },
  { slug: 'tesla', title: 'Tesla', tagline: 'Inventor known for pioneering work in alternating current electrical systems.', color: '#0284c7', related: ['physics', 'einstein'], images: imgs('tesla') },
  { slug: 'tokyo', title: 'Tokyo', tagline: "Japan's capital, one of the most populous metropolitan areas in the world.", color: '#e11d48', related: ['japan', 'shibuya'], images: imgs('tokyo') },
  { slug: 'japan', title: 'Japan', tagline: 'An island nation in East Asia known for its blend of ancient tradition and technology.', color: '#f97316', related: ['tokyo', 'shibuya'], images: imgs('japan') },
  { slug: 'shibuya', title: 'Shibuya', tagline: 'A Tokyo district famous for its scramble crossing, one of the busiest in the world.', color: '#65a30d', related: ['tokyo', 'japan'], images: imgs('shibuya') },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding topics...');

  for (const t of topics) {
    await Topic.findOneAndUpdate({ slug: t.slug }, t, { upsert: true, new: true });
    console.log(`  ✓ ${t.title}`);
  }

  console.log(`Done. ${topics.length} topics seeded.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
