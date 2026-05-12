// Pages Function: GET /p/script.js
//
// Proxies the Plausible tracker JS from the self-hosted analytics instance
// at analytics.networkershome.com to a same-origin path on meshwg.com.
// Why: most adblock filter lists block third-party analytics hosts by
// default — even Plausible's. Serving the script from our own origin
// makes the script invisible to those filters, recovering ~20% of
// otherwise-blocked pageviews. Privacy properties are unchanged: still
// no cookies, still no fingerprinting, still no PII.
//
// The upstream variant is "outbound-links.hash" — same bundle the Astro
// layout used to point at directly. If we want to add the file-downloads
// plugin or the 404 plugin later, change the UPSTREAM path here and the
// tracker keeps working with no template change.

const UPSTREAM = "https://analytics.networkershome.com/js/script.outbound-links.hash.js";

export async function onRequestGet({ request }) {
  // Cache at the Pages edge for 24h. The script changes only when Plausible
  // ships a new tracker version, which is rare — and stale-while-revalidate
  // means visitors never wait on this fetch.
  const upstream = await fetch(UPSTREAM, {
    cf: { cacheTtl: 86400, cacheEverything: true },
    headers: { "user-agent": request.headers.get("user-agent") || "" },
  });

  // Pass through body + content-type, but force our own cache headers.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/javascript",
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
    },
  });
}
