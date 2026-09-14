import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;
const rootDir = process.cwd();

// Define 3D and media MIME types
express.static.mime.define({
  'model/gltf-binary': ['glb'],
  'model/gltf+json': ['gltf'],
  'application/octet-stream': ['hdr', 'exr', 'fbx', 'bin'],
  'application/wasm': ['wasm'],
  'image/ktx2': ['ktx2'],
  'text/plain': ['cube', 'obj', 'mtl'],
  'application/javascript': ['js', 'mjs']
});

// Enable CORS and Cross-Origin Resource Policy
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.enable('strict routing');

// Aliases for legacy build requests to serve directly from live src/dessert/ engine
app.get('/build/three.module.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'src/dessert/Dessert.js'));
});
app.get('/build/three.webgpu.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'src/dessert/Dessert.webgpu.js'));
});
app.get('/build/three.tsl.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'src/dessert/Dessert.dsl.js'));
});
app.get('/build/three.core.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'src/dessert/Dessert.core.js'));
});

// Clean redirects for main modules if accessed without trailing slash
app.use((req, res, next) => {
  const p = req.path;
  if (p === '/editor' || p === '/examples' || p === '/docs' || p === '/manual') {
    return res.redirect(301, p + '/' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : ''));
  }
  next();
});

// Serve directory listing for browsing repo folders (e.g. /src/, /build/, /examples/models/)
app.use((req, res, next) => {
  const pathname = decodeURIComponent(req.path);
  const targetPath = path.join(rootDir, pathname);

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    const indexPath = path.join(targetPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      // Generate directory listing
      try {
        const files = fs.readdirSync(targetPath)
          .filter(f => !f.startsWith('.'))
          .map(f => ({
            name: f,
            isDir: fs.statSync(path.join(targetPath, f)).isDirectory()
          }))
          .sort((a, b) => {
            if (a.isDir && !b.isDir) return -1;
            if (!a.isDir && b.isDir) return 1;
            return a.name.localeCompare(b.name);
          });

        const base = pathname.endsWith('/') ? pathname : pathname + '/';
        const items = files.map(({ name, isDir }) => {
          const icon = isDir ? '📁' : '📄';
          return `<a href="${base}${name}${isDir ? '/' : ''}" style="display:flex;align-items:center;gap:8px;padding:8px 12px;color:#38bdf8;text-decoration:none;border-radius:6px;font-family:monospace;font-size:13px;border-bottom:1px solid #1e293b;">
            <span>${icon}</span>
            <span>${name}</span>
          </a>`;
        }).join('');

        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DESSERT - ${pathname}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 24px; }
    h1 { font-size: 18px; font-weight: 600; color: #f8fafc; border-bottom: 1px solid #334155; padding-bottom: 12px; }
    .container { max-width: 900px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
    a:hover { background: #334155 !important; }
    .back { color: #94a3b8; margin-bottom: 12px; display: inline-block; text-decoration: none; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <a href="../" class="back">← Back</a>
    <h1>Directory: ${pathname}</h1>
    <div style="display:flex;flex-direction:column;gap:2px;margin-top:16px;">
      ${items}
    </div>
  </div>
</body>
</html>`;
        return res.status(200).send(html);
      } catch (err) {
        return next(err);
      }
    }
  }
  next();
});

// Serve all static assets from workspace root
app.use(express.static(rootDir, {
  index: ['index.html'],
  dotfiles: 'ignore',
  extensions: ['html', 'js', 'json']
}));

// Fallback 404
app.use((req, res) => {
  res.status(404).send(`Cannot find ${req.path}`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(` DESSERT 3D Engine & Studio Server`);
  console.log(` Running at http://0.0.0.0:${PORT}/`);
  console.log(`   - Suite Hub:    http://0.0.0.0:${PORT}/`);
  console.log(`   - 3D Editor:    http://0.0.0.0:${PORT}/editor/`);
  console.log(`   - Examples:     http://0.0.0.0:${PORT}/examples/`);
  console.log(`   - Docs:         http://0.0.0.0:${PORT}/docs/`);
  console.log(`   - Manual:       http://0.0.0.0:${PORT}/manual/`);
  console.log(`========================================`);
});
