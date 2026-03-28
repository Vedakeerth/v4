const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'app', 'api'), function(filePath) {
  if (filePath.endsWith('route.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    // Replace params: Promise<{ id: string }> with params: any
    content = content.replace(/\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*Promise<\{[^\}]+\}>\s*\}/g, '{ params }: any');
    // Also replace req: Request with req: NextRequest if it's imported (or just leave it, since `any` solves the typescript issue itself)
    // NextJS 15 only complains if the types of params don't match exactly. If we put `any`, it allows `Request` or `NextRequest`.
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', Math.random(), filePath);
    }
  }
});
