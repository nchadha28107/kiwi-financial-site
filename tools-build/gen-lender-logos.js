/* Generates the lender tile SVGs and the shared lender dataset.
   These are neutral typographic placeholders - drop the officially licensed
   brand SVGs in at the same paths to replace them. */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'logos');

const LENDERS = [
  { slug: 'anz', name: 'ANZ', mark: 'ANZ', colour: '#0072AC' },
  { slug: 'asb', name: 'ASB', mark: 'ASB', colour: '#E4002B' },
  { slug: 'bnz', name: 'BNZ', mark: 'BNZ', colour: '#00558C' },
  { slug: 'westpac', name: 'Westpac', mark: 'Westpac', colour: '#D5002B' },
  { slug: 'kiwibank', name: 'Kiwibank', mark: 'Kiwibank', colour: '#3B8B3B' },
  { slug: 'tsb', name: 'TSB', mark: 'TSB', colour: '#00447C' },
  { slug: 'sbs', name: 'SBS Bank', mark: 'SBS', colour: '#007B8A' },
  { slug: 'cooperative', name: 'The Co-operative Bank', mark: 'Co-op', colour: '#005E5D' },
  { slug: 'heartland', name: 'Heartland Bank', mark: 'Heartland', colour: '#6B2C91' },
  { slug: 'icbc', name: 'ICBC New Zealand', mark: 'ICBC', colour: '#C8102E' },
  { slug: 'boc', name: 'Bank of China NZ', mark: 'BOC', colour: '#A3122B' },
  { slug: 'resimac', name: 'Resimac', mark: 'Resimac', colour: '#1A3C5E' }
];

const W = 120, H = 48;

const svg = (l) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${l.name}">
  <title>${l.name}</title>
  <rect width="${W}" height="${H}" rx="8" fill="#fff"/>
  <rect x="6" y="${H / 2 - 9}" width="4" height="18" rx="2" fill="${l.colour}"/>
  <text x="18" y="${H / 2}" dominant-baseline="central" font-family="Inter, 'Segoe UI', Arial, sans-serif"
        font-size="${l.mark.length > 8 ? 13 : l.mark.length > 5 ? 15 : 18}" font-weight="800"
        letter-spacing="-0.4" fill="${l.colour}">${l.mark}</text>
</svg>
`;

fs.mkdirSync(OUT, { recursive: true });
LENDERS.forEach(l => {
  fs.writeFileSync(path.join(OUT, l.slug + '.svg'), svg(l), 'utf8');
  console.log('  wrote assets/logos/' + l.slug + '.svg');
});

fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'lenders.json'),
  JSON.stringify(LENDERS.map(({ slug, name, colour }) => ({ slug, name, colour, logo: 'assets/logos/' + slug + '.svg' })), null, 2),
  'utf8'
);
console.log('  wrote data/lenders.json');
