/**
 * Fetches each lender's own published logo asset and writes assets/logos/.
 *
 * Sources were discovered by inspecting each lender's live site (see
 * find-bank-logos.ps1) - these are the brand files the banks themselves serve.
 * Three lenders ship their mark as inline SVG rather than a file, so that
 * markup is captured verbatim below.
 *
 * TRADEMARK: these are registered marks. Using them to show "lenders we
 * compare" is normal practice for an adviser, but each bank has brand
 * guidelines and some require written sign-off. Confirm before launch.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'logos');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/* ---------------------------------------------------------------- inline marks */
const ASB_PATH = 'M30.71 28.746h-7.257c-.32 0-.59.214-.59.57v3.3c0 .308.222.467.498.32 1.714-.914 7.27-3.868 7.376-3.922.205-.104.287-.268-.026-.268zm5.16 9.213h-4.313l-1.372-2.47H21.23l-1.293 2.47h-4.34c-.264 0-.5-.174-.328-.485 1.333-2.39 7.184-12.864 7.24-12.963.17-.292.276-.512.78-.512h4.77c.533 0 .613.22.785.516.05.084 5.988 10.556 7.35 12.956.177.31-.058.487-.326.487zm22.957-.526V24.53a.54.54 0 0 1 .546-.53h12.122c3.51 0 5.212.806 5.212 3.645 0 2.06-.713 2.686-1.74 3.047-.216.07-.198.234 0 .27 1.637.29 2.254 1.108 2.254 3.156 0 3.055-1.86 3.84-4.376 3.84H59.37a.534.534 0 0 1-.543-.523zm4.95-10.468v2.213l6.7-.003c.814 0 1.287-.32 1.287-1.107 0-.806-.473-1.103-1.286-1.103h-6.7zm0 5.44v2.42h6.8c.95 0 1.586-.37 1.586-1.176 0-.94-.635-1.243-1.586-1.243h-6.8zM15 24.573v7.032c0 .303.167.225.274.026.056-.1 3.103-5.486 4.047-7.146.153-.266-.012-.482-.33-.482h-3.403a.556.556 0 0 0-.586.573zm28.996 4.517h7.475c2.405 0 4.35 1.56 4.35 3.48v1.907c0 1.922-1.945 3.482-4.35 3.482h-8.733c-3.74 0-5.17-1.85-5.266-3.708-.002-.173-.06-.57.584-.57h4.372c.012.79.644 1.145 1.588 1.145h5.26c.952 0 1.585-.36 1.585-1.168 0-.94-.634-1.163-1.587-1.163h-6.64c-3.73 0-5.08-1.908-5.08-3.76v-1.383C37.553 25.5 39.43 24 41.745 24h9.304c2.293 0 4.157 1.476 4.19 3.306 0 .234.08.573-.59.573h-4.44a1.668 1.668 0 0 0-.01-.105l-.01-.052c-.107-.572-.56-.757-1.26-.757h-4.934c-.813 0-1.29.243-1.29 1.052 0 .785.477 1.07 1.29 1.07z';

const INLINE = {
  asb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="15 24 63 14" role="img" aria-label="ASB"><title>ASB</title><path d="${ASB_PATH}" fill="#E4002B" fill-rule="evenodd"/></svg>\n`,

  bnz: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 49 24" role="img" aria-label="BNZ"><title>BNZ</title><path fill="#00254B" d="M5.29 13.87c.6-.68 1.78-1.13 2.79-1.09 2.23.09 3.63 1.32 3.63 3.73 0 4.63-2.75 7.23-6.84 7.23-1.6 0-3.44-.35-4.87-.89l2.38-13.4c.19-1.1.62-1.53 1.96-1.53h1.99zm-1.21 6.92c.37.1.45.11.93.11 1.69 0 2.87-1.61 2.87-3.86 0-1.03-.48-1.42-1.31-1.42-.72 0-1.62.64-1.75.91zm19.46 2.42c.12.26.43.54 1.14.53.81 0 1.73-.13 2.72-.13 1.56 0 2.11.1 4.14.13.8.01 1.23-.27 1.41-1.12.11-.49.22-1.07.34-1.89-.82.08-1.62.03-2.3-.01-.95-.06-1.95-.12-2.74-.05.36-.56.95-1.29 1.94-2.23.47-.44 1.31-1.15 2.21-2.12.9-.98 1.94-2.11 1.62-3.55-.99.07-1.7.1-3.01.1-1.62 0-3.64-.1-4.72-.1-.92 0-1.35.3-1.53 1.05-.15.63-.4 2-.4 2 .16-.05.88-.09 1.49-.09.61.01 2.26.04 2.61.09-.15.46-1.61 1.54-2.52 2.55-.57.63-1.52 1.71-2.01 2.53-1.26.67-1.98.47-1.86-.51l.52-2.92c.05-.56.21-1.17.18-1.7-.1-1.9-1.32-3.06-3.41-3.06-1.14 0-1.97.58-2.59 1.11 0 0-.16-.88-1.34-.94l-2.03-.01-1.64 9.32c-.23 1.22.2 1.4 1.29 1.39h2.07l1.25-6.99c.15-.33.89-1.05 1.8-1.05.59 0 1.1.29.98 1.05l-.64 3.76c-.16 1.21.25 2.18.66 2.55.54.56 1.3.81 2.07.84.87.05 1.83-.16 2.3-.53"/><path fill="#FAA819" d="m42.21 0 .26 1.69c.03.16.17.28.33.27h1.78l-1.61 1.05c-.16.1-.24.29-.22.44l.26 1.69-1.26-1.04c-.12-.1-.32-.1-.47 0l-1.62 1.05.84-1.69c.08-.16.05-.35-.07-.45l-1.26-1.05h1.78c.18-.01.34-.11.42-.27zm-5.53 3.5.26 1.69c.03.16.17.28.33.27h1.78l-1.61 1.05c-.15.09-.24.27-.22.45l.26 1.69-1.27-1.05c-.12-.1-.32-.1-.47 0l-1.62 1.05.83-1.69c.08-.16.05-.35-.07-.45l-1.26-1.05h1.78c.18-.01.34-.11.42-.27zm9.82 0 .26 1.69c.03.16.17.28.33.27h1.78l-1.61 1.05a.48.48 0 0 0-.22.45l.26 1.69-1.26-1.05c-.12-.1-.32-.1-.47 0l-1.62 1.05.84-1.69c.08-.16.05-.35-.07-.45l-1.26-1.05h1.78c.18-.01.34-.11.42-.27zm-6.32 7.27.26 1.69c.03.16.17.28.33.27h1.78l-1.61 1.05a.5.5 0 0 0-.22.45l.26 1.69-1.26-1.04c-.12-.1-.32-.1-.47 0l-1.62 1.05.84-1.69c.08-.16.05-.35-.07-.44l-1.26-1.05h1.78c.18-.01.34-.11.42-.27z"/></svg>\n`,

  // Kiwibank publish the wordmark in white for dark UI; #201D1E is their dark variant.
  kiwibank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 185 36" role="img" aria-label="Kiwibank"><title>Kiwibank</title><defs><path id="kba" d="M0 0h28.904v28.953H0z"/><path id="kbc" d="M0 0h28.956v28.901H0z"/></defs><g fill="none" fill-rule="evenodd"><g transform="translate(0 7.047)"><mask id="kbb" fill="#fff"><use xlink:href="#kba" xmlns:xlink="http://www.w3.org/1999/xlink"/></mask><path d="M7.034 21.897V0L2.102 4.932A7.18 7.18 0 0 0 0 10.008v18.945h28.904v-7.056H7.034z" fill="#2E8752" mask="url(#kbb)"/></g><g transform="translate(7.044)"><mask id="kbd" fill="#fff"><use xlink:href="#kbc" xmlns:xlink="http://www.w3.org/1999/xlink"/></mask><path d="M21.9 0H10.008c-1.904 0-3.73.756-5.076 2.103L0 7.035h21.9V28.9h7.056V0h-7.055z" fill="#19E480" mask="url(#kbd)"/></g><path d="M67.393 28.898h-5.635l-7.642-9.98v9.98H49.68V7.019h4.436v9.56l7.433-9.56h5.304l-8.482 10.34zm1.348 0h4.316V13.463h-4.316v15.435zm4.736-19.721c0 1.408-1.14 2.488-2.578 2.488-1.468 0-2.577-1.08-2.577-2.488 0-1.409 1.109-2.518 2.577-2.518 1.439 0 2.578 1.11 2.578 2.518zm22.777 4.286h4.226l-5.365 15.435H91.01l-3.416-9.62-3.417 9.62H80.07l-5.365-15.435h4.406l3.207 9.59 3.327-9.59h4.075l3.327 9.59zm5.905 15.435h4.316V13.463h-4.316v15.435zm4.735-19.721c0 1.408-1.139 2.488-2.577 2.488-1.469 0-2.578-1.08-2.578-2.488 0-1.409 1.11-2.518 2.578-2.518 1.438 0 2.577 1.11 2.577 2.518zm14.566 12.018c0-2.487-1.528-4.316-3.746-4.316-2.308 0-3.896 1.829-3.896 4.316 0 2.488 1.588 4.346 3.896 4.346 2.218 0 3.746-1.858 3.746-4.346m4.286.03c0 4.586-3.327 7.972-7.373 7.972-1.768 0-3.297-.689-4.466-1.858v1.559h-4.316V6.12h4.316v8.931c1.169-1.169 2.698-1.858 4.466-1.858 4.046 0 7.373 3.417 7.373 8.032m13.427-.03c0-2.487-1.59-4.316-3.897-4.316-2.217 0-3.746 1.829-3.746 4.316 0 2.488 1.529 4.346 3.746 4.346 2.308 0 3.897-1.858 3.897-4.346zm-.27-7.732h4.316v15.435h-4.316v-1.379a6.235 6.235 0 0 1-4.286 1.678c-4.046 0-7.373-3.386-7.373-7.972 0-4.615 3.327-8.032 7.373-8.032 1.678 0 3.147.63 4.286 1.708v-1.438zm21.339 5.634v9.8h-4.316v-8.72c0-2.159-.779-3.298-2.517-3.298-1.799 0-2.698 1.2-2.698 3.297v8.722h-4.315V13.463h4.285v1.408c.93-1.079 2.428-1.708 3.927-1.708 3.566 0 5.634 2.278 5.634 5.934m17.893 9.801h-5.125l-5.425-6.983v6.983h-4.316V6.12h4.316v13.397l5.245-6.054h5.125l-6.354 7.133zm6.473-2.368c0 1.439-1.138 2.548-2.577 2.548-1.47 0-2.578-1.11-2.578-2.548 0-1.439 1.109-2.547 2.578-2.547 1.439 0 2.577 1.108 2.577 2.547" fill="#201D1E"/></g></svg>\n`
};

/* ---------------------------------------------------------------- remote files */
const REMOTE = {
  anz: 'https://www.anz.co.nz/content/dam/anzconz/media/logo/logo-anz.svg',
  tsb: 'https://www.tsb.co.nz/themes/TSB/logo.svg',
  cooperative: 'https://www.co-operativebank.co.nz/assets/logo-DJhg3BnK.svg',
  heartland: 'https://www.heartland.co.nz/Images/heartland-bank-logo-black.svg',
  resimac: 'https://cdn.prod.website-files.com/690ee64fa9ecaee51c2f25ac/6907fbb66ea665d3cba936e5_Logo.svg',
  westpac: 'https://www.westpac.co.nz/_resources/themes/app/dist/images/westpac-logo.png',
  sbs: 'https://www.sbsbank.co.nz/assets/Uploads/sbs-bank-white.png',
  icbc: 'https://v.icbc.com.cn/userfiles/Resources/ICBC/haiwai/Newzealand/photo/201609/logo_ICBCNewzealand.jpg',
  boc: 'https://www.bankofchina.com/images/boc2013_ovs_ft_logo.png'
};

const META = {
  anz:         { name: 'ANZ',                   colour: '#0072AC' },
  asb:         { name: 'ASB',                   colour: '#E4002B' },
  bnz:         { name: 'BNZ',                   colour: '#00254B' },
  westpac:     { name: 'Westpac',               colour: '#D5002B' },
  kiwibank:    { name: 'Kiwibank',              colour: '#2E8752' },
  tsb:         { name: 'TSB',                   colour: '#00447C' },
  sbs:         { name: 'SBS Bank',              colour: '#007B8A', invert: true },
  cooperative: { name: 'The Co-operative Bank', colour: '#005E5D' },
  heartland:   { name: 'Heartland Bank',        colour: '#6B2C91' },
  icbc:        { name: 'ICBC New Zealand',      colour: '#C8102E' },
  boc:         { name: 'Bank of China NZ',      colour: '#A3122B' },
  resimac:     { name: 'Resimac',               colour: '#1A3C5E' }
};

const ORDER = ['anz', 'asb', 'bnz', 'westpac', 'kiwibank', 'tsb', 'sbs', 'cooperative', 'heartland', 'icbc', 'boc', 'resimac'];

async function download(slug, url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/svg+xml,image/*,*/*' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = url.split('?')[0].match(/\.(svg|png|jpe?g)$/i)?.[1].toLowerCase() || 'png';
  const file = `${slug}.${ext === 'jpeg' ? 'jpg' : ext}`;
  fs.writeFileSync(path.join(OUT, file), buf);
  return { file, bytes: buf.length };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const manifest = [];

  for (const slug of ORDER) {
    const m = META[slug];
    let file;
    try {
      if (INLINE[slug]) {
        file = `${slug}.svg`;
        fs.writeFileSync(path.join(OUT, file), INLINE[slug], 'utf8');
        console.log(`  inline  ${file}`);
      } else {
        const r = await download(slug, REMOTE[slug]);
        file = r.file;
        console.log(`  fetched ${file.padEnd(18)} ${r.bytes} bytes`);
      }
    } catch (err) {
      console.log(`  ! ${slug}: ${err.message} - keeping existing file if present`);
      file = fs.existsSync(path.join(OUT, `${slug}.svg`)) ? `${slug}.svg` : null;
    }
    if (!file) continue;
    manifest.push({
      slug,
      name: m.name,
      colour: m.colour,
      logo: `assets/logos/${file}`,
      invert: !!m.invert
    });
  }

  fs.writeFileSync(path.join(__dirname, '..', 'data', 'lenders.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`\n  wrote data/lenders.json (${manifest.length} lenders)`);
})();
