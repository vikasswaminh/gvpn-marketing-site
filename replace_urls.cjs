const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.md') || file.endsWith('.astro') || file.endsWith('.ts') || file.endsWith('.txt')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('.');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('https://vpn.meshwg.com')) {
    content = content.replace(/https:\/\/vpn\.meshwg\.com\/(signup|login|dashboard)/g, 'https://github.com/vikasswaminh/gvpn-marketing-site#quick-start');
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
