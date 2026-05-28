export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return json({ error: 'url 파라미터가 필요합니다.' }, 400);
    }

    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
        cf: { cacheTtl: 300 },
      });

      if (!res.ok) return json({ error: `대상 URL 오류 (${res.status})` }, 502);

      const html = await res.text();

      const image =
        extract(html, /property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
        extract(html, /content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
        extract(html, /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
        extract(html, /content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i) ||
        null;

      return json({ image });
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  },
};

function extract(html, regex) {
  const m = html.match(regex);
  return m ? m[1] : null;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
