// Pages Function: POST /p/event
//
// Proxies pageview / outbound-link / custom events from the browser
// to the self-hosted Plausible ingest endpoint at
// https://analytics.networkershome.com/api/event.
//
// Critical headers for Plausible to compute correct stats:
//   - X-Forwarded-For: the visitor's real IP. Plausible reads this to
//     geolocate (country) and to dedupe same-visitor pageviews. Without
//     it, every visit looks like it came from Cloudflare's edge IP and
//     country/dedupe stats are garbage.
//   - User-Agent: the visitor's real UA. Plausible uses this to
//     break down by browser/OS.
//
// Returns whatever Plausible returns (202 on success, 400 on bad payload).

const UPSTREAM = "https://analytics.networkershome.com/api/event";

export async function onRequestPost({ request }) {
  const cfIP =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "";

  const body = await request.text();

  const upstream = await fetch(UPSTREAM, {
    method: "POST",
    headers: {
      "content-type": request.headers.get("content-type") || "text/plain",
      "user-agent": request.headers.get("user-agent") || "",
      "x-forwarded-for": cfIP,
      "x-forwarded-host": "meshwg.com",
    },
    body,
  });

  // Pass status through. Body is usually empty on 202. CORS headers so
  // the browser fetch from the inline script doesn't fail same-origin
  // checks if it ever ends up cross-origin (it shouldn't from meshwg.com).
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "text/plain",
      "access-control-allow-origin": "*",
      "cache-control": "no-store",
    },
  });
}

// Browsers send a preflight OPTIONS to /p/event when the script is on a
// different origin than the page. We return a generic permissive preflight
// so cross-origin embeds (if anyone ever does that) don't break.
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
    },
  });
}
