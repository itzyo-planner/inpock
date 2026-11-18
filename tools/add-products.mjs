// 사용법: INPOCK_PASSWORD=비밀번호 node tools/add-products.mjs <inpock|recipe|tips> products.json [--dry-run]
// products.json: [{ "title": "...", "url": "...", "thumbnail": "https://...", "desc": "", "category": "" }, ...]
import { readFileSync } from 'node:fs';

const SAVE_URL = 'https://inpock-save.kawoohyun.workers.dev/save';
const SITE_URLS = {
  inpock: 'https://inpock-4ue.pages.dev',
  recipe: process.env.RECIPE_URL,
  tips:   process.env.TIPS_URL,
};

const [site, file, flag] = process.argv.slice(2);
const password = process.env.INPOCK_PASSWORD;
if (!SITE_URLS.hasOwnProperty(site) || !file) {
  console.error('사용법: INPOCK_PASSWORD=... node tools/add-products.mjs <inpock|recipe|tips> products.json [--dry-run]');
  process.exit(1);
}
if (!password) { console.error('INPOCK_PASSWORD 환경변수가 필요합니다.'); process.exit(1); }
if (!SITE_URLS[site]) { console.error(`${site.toUpperCase()}_URL 환경변수(사이트 주소)가 필요합니다.`); process.exit(1); }

const products = JSON.parse(readFileSync(file, 'utf-8'));
if (!Array.isArray(products) || !products.length) { console.error('products.json은 상품 배열이어야 합니다.'); process.exit(1); }

const res = await fetch(`${SITE_URLS[site]}/config.json?t=${Date.now()}`, { cache: 'no-store' });
if (!res.ok) { console.error('현재 config.json을 가져오지 못했습니다:', res.status); process.exit(1); }
const config = await res.json();
config.links ||= [];

const used = new Set(config.links.map(l => Number(l.num)).filter(Boolean));
const nextNum = () => { let n = 1; while (used.has(n)) n++; used.add(n); return n; };

products.forEach((p, i) => {
  if (!p.title || !p.url) throw new Error(`${i + 1}번째 상품에 title, url이 필요합니다.`);
  config.links.push({
    id: `link-${Date.now()}-${i}`,
    type: 'link',
    title: p.title,
    desc: p.desc || '',
    url: p.url,
    thumbnail: p.thumbnail || '',
    enabled: true,
    num: nextNum(),
    ...(p.category ? { category: p.category } : {}),
    ...(p.time ? { time: p.time } : {}),
    ...(p.level ? { level: p.level } : {}),
    ...(p.expires ? { expires: p.expires } : {}),
  });
});

console.log(`기존 ${config.links.length - products.length}개 + 새 ${products.length}개 = ${config.links.length}개`);
if (flag === '--dry-run') { console.log('(dry-run: 저장하지 않음)'); process.exit(0); }

const out = await fetch(SAVE_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password, site, config }),
});
const data = await out.json().catch(() => ({}));
if (!out.ok) { console.error('저장 실패:', data.error || out.status); process.exit(1); }
console.log('저장 완료! 약 1~2분 후 사이트에 반영됩니다.');
