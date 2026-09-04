/**
 * inpock-save worker
 * POST /save  → GitHub API로 config.json 저장
 *
 * Cloudflare 환경변수 (Secrets):
 *   ADMIN_PASSWORD  - 관리자 비밀번호
 *   GH_TOKEN        - GitHub Personal Access Token (repo 권한)
 */

const SITE_MAP = {
  inpock: { owner: 'itzyo-planner', repo: 'inpock',       branch: 'main' },
  recipe: { owner: 'itzyo-planner', repo: 'itzyo-recipe',  branch: 'main' },
  tips:   { owner: 'itzyo-planner', repo: 'itzyo-tips',    branch: 'main' },
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/save') {
      return handleSave(request, env);
    }

    return json({ error: 'Not found' }, 404);
  },
};

async function handleSave(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: '잘못된 요청 형식' }, 400);
  }

  const { password, site, config, profileImage, thumbs } = body;

  if (password !== env.ADMIN_PASSWORD) {
    return json({ error: '비밀번호가 올바르지 않습니다' }, 403);
  }

  const siteInfo = SITE_MAP[site];
  if (!siteInfo) return json({ error: '알 수 없는 사이트: ' + site }, 400);

  const { owner, repo, branch } = siteInfo;
  const token = env.GH_TOKEN;

  if (!token) return json({ error: 'GH_TOKEN 환경변수가 설정되지 않았습니다' }, 500);

  try {
    const thumbUrls = {};

    // 1. 프로필 사진
    if (profileImage?.base64) {
      await ghUpload(owner, repo, 'images/profile.jpg', profileImage.base64, token, branch, 'chore: 프로필 사진 업데이트');
    }

    // 2. 링크 썸네일
    if (thumbs && typeof thumbs === 'object') {
      for (const [linkId, { base64, ext }] of Object.entries(thumbs)) {
        const path = `images/thumb-${linkId}.${ext}`;
        await ghUpload(owner, repo, path, base64, token, branch, 'chore: 링크 썸네일 업로드');
        thumbUrls[linkId] = path;
      }
    }

    // 3. config.json
    const configJson = JSON.stringify(config, null, 2);
    const configB64  = btoa(unescape(encodeURIComponent(configJson)));
    await ghUpload(owner, repo, 'config.json', configB64, token, branch, 'chore: 관리자 페이지에서 콘텐츠 업데이트');

    return json({ ok: true, thumbUrls });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

async function ghUpload(owner, repo, path, base64, token, branch, message) {
  // 현재 SHA 조회 (파일이 이미 존재하는 경우 필요)
  let sha;
  try {
    const r = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
    );
    if (r.ok) sha = (await r.json()).sha;
  } catch {}

  const body = { message, content: base64, branch };
  if (sha) body.sha = sha;

  const r = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(`${path} 저장 실패: ${err.message || r.status}`);
  }
  return r.json();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
