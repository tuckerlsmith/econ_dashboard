// Cloudflare Worker - FRED API Proxy
// Deploy at: https://dash.cloudflare.com/ -> Workers & Pages -> Create
// Paste this code, deploy, then update CORS_PROXY in js/fred.js

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    const response = await fetch(targetUrl);
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  },
};
