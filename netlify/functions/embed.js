// embed.js — simple proxy that fetches the target site and returns HTML
// WARNING: This is a simple proxy and may not work if the target site blocks framing or requires CORS.
// Also some sites deny being embedded via X-Frame-Options or Content-Security-Policy.
// We stream the HTML through so the client only sees this function's URL.

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    // The real target URL — keep it server-side only.
    const TARGET = 'https://vecka.nu/'; // <-- server-side constant, not in client

    const resp = await fetch(TARGET, {
      headers: { 'User-Agent': 'Netlify-Embed-Proxy' }
    });

    if (!resp.ok) {
      return { statusCode: 502, body: 'Bad gateway' };
    }

    // Return the HTML body directly with same-type
    const body = await resp.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        // prevent caching to be safe
        'Cache-Control': 'no-store, private'
      },
      body
    };
  } catch (err) {
    console.error('embed error', err);
    return { statusCode: 500, body: 'Server error' };
  }
};
