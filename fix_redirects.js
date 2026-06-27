const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('e:/free_fire/app', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    if (content.includes('redirect("/login")')) {
      content = content.replace(/redirect\("\/login"\)/g, 'redirect("/v1/auth/login")');
      changed = true;
    }
    
    if (content.includes('router.push("/login")')) {
      content = content.replace(/router\.push\("\/login"\)/g, 'router.push("/v1/auth/login")');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated ' + filePath);
    }
  }
});
