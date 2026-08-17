const topics = {
  coffee: {
    title: 'Coffee',
    tagline: 'A brewed drink from roasted coffee beans, first cultivated in the Ethiopian highlands.',
    color: '#c2410c',
    related: ['ethiopia', 'espresso', 'brazil'],
  },
  ethiopia: {
    title: 'Ethiopia',
    tagline: 'East African nation widely considered the birthplace of coffee cultivation.',
    color: '#0891b2',
    related: ['coffee', 'africa'],
  },
  espresso: {
    title: 'Espresso',
    tagline: 'A concentrated coffee brewed by forcing hot water through fine grounds under pressure.',
    color: '#7c3aed',
    related: ['coffee', 'italy', 'latte'],
  },
  brazil: {
    title: 'Brazil',
    tagline: "The world's largest coffee producer since the 1840s.",
    color: '#16a34a',
    related: ['coffee', 'south america'],
  },
  africa: {
    title: 'Africa',
    tagline: 'The continent where coffee cultivation first began, in Ethiopia.',
    color: '#db2777',
    related: ['ethiopia', 'coffee'],
  },
  italy: {
    title: 'Italy',
    tagline: 'Popularized espresso culture and the modern coffee bar in the 20th century.',
    color: '#0d9488',
    related: ['espresso', 'coffee'],
  },
  latte: {
    title: 'Latte',
    tagline: 'An espresso drink made with steamed milk, originating in Italy.',
    color: '#eab308',
    related: ['espresso', 'coffee'],
  },
  'south america': {
    title: 'South America',
    tagline: 'Home to Brazil and Colombia, two of the largest coffee producing nations.',
    color: '#dc2626',
    related: ['brazil', 'coffee'],
  },
  einstein: {
    title: 'Einstein',
    tagline: 'Physicist best known for developing the theory of relativity.',
    color: '#2563eb',
    related: ['relativity', 'physics', 'tesla'],
  },
  relativity: {
    title: 'Relativity',
    tagline: "Einstein's theory describing how space and time are linked.",
    color: '#9333ea',
    related: ['einstein', 'physics'],
  },
  physics: {
    title: 'Physics',
    tagline: 'The study of matter, energy, and the fundamental forces of nature.',
    color: '#059669',
    related: ['einstein', 'tesla', 'relativity'],
  },
  tesla: {
    title: 'Tesla',
    tagline: 'Inventor known for pioneering work in alternating current electrical systems.',
    color: '#0284c7',
    related: ['physics', 'einstein'],
  },
  tokyo: {
    title: 'Tokyo',
    tagline: "Japan's capital, one of the most populous metropolitan areas in the world.",
    color: '#e11d48',
    related: ['japan', 'shibuya'],
  },
  japan: {
    title: 'Japan',
    tagline: 'An island nation in East Asia known for its blend of ancient tradition and technology.',
    color: '#f97316',
    related: ['tokyo', 'shibuya'],
  },
  shibuya: {
    title: 'Shibuya',
    tagline: 'A Tokyo district famous for its scramble crossing, one of the busiest in the world.',
    color: '#65a30d',
    related: ['tokyo', 'japan'],
  },
};

export default topics;
