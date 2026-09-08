const fs = require('fs');
const content = fs.readFileSync('src/pages/blog/how-to-build-a-multi-location-wireguard-network-with-routers.astro', 'utf8');

const titleMatch = content.match(/title\s*=\s*"([^"]+)"/);
const descMatch = content.match(/description\s*=\s*"([^"]+)"/);
const dateMatch = content.match(/datePublished\s*=\s*"([^"]+)"/);

const bodyStart = content.indexOf('<div class="bp-intro">');
const bodyEnd = content.indexOf('</BlogPost>');
const body = content.substring(bodyStart, bodyEnd);

const md = `---
title: '${titleMatch[1]}'
description: '${descMatch[1]}'
pubDate: ${dateMatch[1]}T00:00:00Z
author: 'MeshWG editorial team'
authorRole: 'Network Architecture'
tags: ['engineering guide']
cover: '/multi-location-routers.png'
---

${body}`;

fs.mkdirSync('src/content/blog', { recursive: true });
fs.writeFileSync('src/content/blog/how-to-build-a-multi-location-wireguard-network-with-routers.md', md);
console.log('Successfully migrated post');
