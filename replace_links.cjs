const fs = require("fs");
const path = require("path");
const targets = ["blog", "privacy", "terms", "contact", "compatibility", "quickstart", "docs", "careers", "refund", "pricing"];
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}
const allFiles = walk(path.join(process.cwd(), "src")).filter(f => f.match(/\.(astro|md|mdx|ts|js)$/));
let totalChanged = 0;
const changedFiles = [];
for (const file of allFiles) {
  let content = fs.readFileSync(file, "utf8");
  let originalContent = content;
  for (const t of targets) {
    content = content.replace(new RegExp(`href=["']\\/${t}["']`, "g"), `href="/${t}/"`);
    content = content.replace(new RegExp(`\\]\\(\\/${t}\\)`, "g"), `](/${t}/)`);
  }
  if (content !== originalContent) {
    fs.writeFileSync(file, content, "utf8");
    changedFiles.push(file);
    totalChanged++;
  }
}
console.log("Changed files:");
changedFiles.forEach(f => console.log(f));
console.log("Total changed files: " + totalChanged);
