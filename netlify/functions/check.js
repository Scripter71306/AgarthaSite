const fetch = require('node-fetch');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { hash } = JSON.parse(event.body || '{}');
    const submitted = (hash || '').trim().toLowerCase();
    if (!submitted)
      return { statusCode: 400, body: JSON.stringify({ ok:false }) };

    const OWNER = process.env.GITHUB_OWNER;
    const REPO  = process.env.GITHUB_REPO;
    const PATH  = process.env.CODES_PATH || 'codes.json';
    const TOKEN = process.env.GITHUB_TOKEN;

    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
    const resp = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        Authorization: `token ${TOKEN}`
      }
    });

    if (!resp.ok)
      return { statusCode: 500, body: JSON.stringify({ ok:false }) };

    const codes = JSON.parse(await resp.text());
    for (const h of codes) {
      const a = Buffer.from(String(h || '').trim().toLowerCase(),'hex');
      const b = Buffer.from(submitted,'hex');
      if (a.length === b.length && crypto.timingSafeEqual(a,b)) {
        return { statusCode: 200, body: JSON.stringify({ ok:true }) };
      }
    }
    return { statusCode: 200, body: JSON.stringify({ ok:false }) };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ ok:false }) };
  }
};
