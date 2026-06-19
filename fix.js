const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Fix Math.random()
      if (content.includes('Math.random()')) {
        if (!content.includes('secureRandom')) {
          content = 'const secureRandom = () => { const arr = new Uint32Array(1); crypto.getRandomValues(arr); return arr[0] / 4294967296; };\n' + content;
        }
        content = content.replace(/Math\.random\(\)/g, 'secureRandom()');
        changed = true;
      }

      // Fix onClick on divs and svgs
      const divRegex = /<(div|span|svg|button)([^>]*)onClick=\{([^}]+)\}([^>]*)>/g;
      content = content.replace(divRegex, (match, tag, p1, p2, p3) => {
        if (tag === 'button') return match; // Buttons are already interactive
        if (match.includes('role=') || match.includes('onKeyDown=')) return match;
        return `<${tag}${p1}onClick={${p2}} onKeyDown={(e) => { if(e.key==='Enter' || e.key===' ') { (${p2})(e); } }}${p3} role="button" tabIndex={0}>`;
      });

      if (content !== fs.readFileSync(fullPath, 'utf8')) changed = true;

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}
processDir('src');
