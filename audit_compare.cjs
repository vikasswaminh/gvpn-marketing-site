const fs = require('fs');
const urls = [
  "https://meshwg.com/blog/how-to-set-up-a-wireguard-mesh-vpn/"
];

async function checkUrl(url) {
  try {
    const res = await fetch(url, { redirect: 'manual' });
    let finalUrl = url;
    let status = res.status;
    let headers = Object.fromEntries(res.headers.entries());
    let xRobots = headers['x-robots-tag'] || 'none';
    let content = await res.text();
    let robots = 'none';
    let canonical = 'none';
    let h1 = 'none';
    let title = 'none';
    let desc = 'none';

    if (status >= 300 && status < 400 && headers['location']) {
      const loc = headers['location'];
      const res2 = await fetch(new URL(loc, url).toString());
      status = `${status} -> ${res2.status}`;
      finalUrl = res2.url;
      content = await res2.text();
      let h2 = Object.fromEntries(res2.headers.entries());
      xRobots = `${xRobots} -> ${h2['x-robots-tag'] || 'none'}`;
    }

    const cMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    if(cMatch) canonical = cMatch[1];
    
    const rMatch = content.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if(rMatch) robots = rMatch[1];

    const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) h1 = h1Match[1].replace(/<[^>]+>/g, '').trim().substring(0, 50);

    const tMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (tMatch) title = tMatch[1].replace(/<[^>]+>/g, '').trim();

    const dMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
    if (dMatch) desc = dMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 50);

    const wordCount = content.replace(/<[^>]+>/g, ' ').split(/\s+/).length;

    console.log(`URL: ${url}`);
    console.log(`  Status: ${status}`);
    console.log(`  Canonical: ${canonical}`);
    console.log(`  Title: ${title}`);
    console.log(`  Word count approx: ${wordCount}`);
    console.log('--------------------------------------------------');
  } catch(e) {
    console.error(`Error on ${url}:`, e.message);
  }
}

async function main() {
  for (const u of urls) await checkUrl(u);
}
main();
