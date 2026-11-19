// 사용법: INPOCK_PASSWORD=비밀번호 node tools/add-products.mjs <inpock|recipe|tips> products.json [--dry-run]
// products.json 항목: title, url (필수) / desc, category, thumbnail(이미지 주소), thumbnailFile(내 컴퓨터 이미지 경로), time, level, expires
// thumbnail과 thumbnailFile이 모두 없으면 상품 URL에서 대표 이미지를 자동으로 가져옵니다.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname } from 'node:path';

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

let lastNum = config.links.reduce((m, l) => Math.max(m, Number(l.num) || 0), 0);
const nextNum = () => ++lastNum;

async function fetchOgImage(pageUrl) {
  try {
    const r = await fetch(pageUrl, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; inpock-bot)' } });
    const html = (await r.text()).slice(0, 300000);
    const m = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
           || html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
           || html.match(/name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
    return m ? new URL(m[1].replace(/&amp;/g, '&'), r.url || pageUrl).href : '';
  } catch { return ''; }
}

const thumbs = {};
const fresh = [];
for (const [i, p] of products.entries()) {
  if (!p.title || !p.url) throw new Error(`${i + 1}번째 상품에 title, url이 필요합니다.`);
  const id = `link-${Date.now()}-${i}`;
  let thumbnail = p.thumbnail || '';
  if (!thumbnail && p.thumbnailFile) {
    if (!existsSync(p.thumbnailFile)) throw new Error(`${i + 1}번째 상품의 이미지 파일을 찾을 수 없습니다: ${p.thumbnailFile}`);
    if (statSync(p.thumbnailFile).size > 5 * 1024 * 1024) throw new Error(`${i + 1}번째 상품의 이미지가 5MB를 넘습니다.`);
    const ext = (extname(p.thumbnailFile).slice(1) || 'jpg').toLowerCase();
    thumbs[id] = { base64: readFileSync(p.thumbnailFile).toString('base64'), ext };
    thumbnail = `images/thumb-${id}.${ext}`;
  }
  if (!thumbnail) {
    thumbnail = await fetchOgImage(p.url);
    if (!thumbnail) console.warn(`  ! ${i + 1}번째 상품(${p.title}): 이미지를 자동으로 찾지 못했습니다. thumbnail 또는 thumbnailFile을 넣어 주세요.`);
  }
  fresh.push({
    id,
    type: 'link',
    title: p.title,
    desc: p.desc || '',
    url: p.url,
    thumbnail,
    enabled: true,
    num: nextNum(),
    ...(p.category ? { category: p.category } : {}),
    ...(p.time ? { time: p.time } : {}),
    ...(p.level ? { level: p.level } : {}),
    ...(p.expires ? { expires: p.expires } : {}),
  });
}
config.links.unshift(...fresh);

console.log(`기존 ${config.links.length - products.length}개 + 새 ${products.length}개 = ${config.links.length}개`);
if (flag === '--dry-run') { console.log('(dry-run: 저장하지 않음)'); process.exit(0); }

const out = await fetch(SAVE_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password, site, config, ...(Object.keys(thumbs).length ? { thumbs } : {}) }),
});
const data = await out.json().catch(() => ({}));
if (!out.ok) { console.error('저장 실패:', data.error || out.status); process.exit(1); }
console.log('저장 완료! 약 1~2분 후 사이트에 반영됩니다.');
