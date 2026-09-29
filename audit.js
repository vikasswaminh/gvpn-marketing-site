const urls = ["blog", "privacy", "terms", "contact", "compatibility", "quickstart", "docs", "careers", "refund", "pricing"];
async function fetchUrl(u) {
  const res = await fetch(`https://meshwg.com/${u}`, { redirect: "manual" });
  const status = res.status;
  const loc = res.headers.get("location");
  let finalStatus = status;
  let canonical = "";
  let robots = "";
  if(status >= 300 && status < 400 && loc) {
    const finalUrl = new URL(loc, `https://meshwg.com/${u}`);
    const res2 = await fetch(finalUrl);
    finalStatus = res2.status;
    const text = await res2.text();
    const cMatch = text.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    if(cMatch) canonical = cMatch[1];
    const rMatch = text.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if(rMatch) robots = rMatch[1];
  } else if (status === 200) {
    const text = await res.text();
    const cMatch = text.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    if(cMatch) canonical = cMatch[1];
    const rMatch = text.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if(rMatch) robots = rMatch[1];
  }
  console.log(`/${u} -> ${status} -> ${loc} -> ${finalStatus} | Canonical: ${canonical} | Robots: ${robots}`);
}
async function main() {
  for(let u of urls) await fetchUrl(u);
}
main();
