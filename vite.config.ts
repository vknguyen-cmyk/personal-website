import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

// GitHub Pages project sites need `/<repo>/`; user/org sites and local use `/`.
// Override with VITE_BASE, or let CI set it from GITHUB_REPOSITORY.
function resolveBase(): string {
  const fromEnv = process.env.VITE_BASE?.trim();
  if (fromEnv) return fromEnv.endsWith('/') ? fromEnv : `${fromEnv}/`;
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (process.env.GITHUB_ACTIONS === 'true' && repo && !repo.endsWith('.github.io')) {
    return `/${repo}/`;
  }
  return '/';
}
const BASE = resolveBase();

// Policy artifacts live at repo `policies/g1-samples/` — serve them at
// `/policies/` in dev/preview, and copy into `dist/policies/` on build.
function servePolicies(): Plugin {
  const dir = resolve(__dirname, 'policies');
  const mount = '/policies/';
  return {
    name: 'wbc-serve-policies',
    configureServer(server) {
      server.middlewares.use(mount, (req, res, next) => {
        serveFromDir(dir, req.url ?? '', res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(`${BASE}policies/`, (req, res, next) => {
        serveFromDir(dir, req.url ?? '', res, next);
      });
    },
    closeBundle() {
      const out = resolve(__dirname, 'dist', 'policies');
      if (existsSync(dir)) cpSync(dir, out, { recursive: true });
    },
  };
}

// Minimal static file streamer for the policy middleware (dev/preview only).
function serveFromDir(
  dir: string,
  url: string,
  res: import('node:http').ServerResponse,
  next: () => void,
): void {
  const rel = decodeURIComponent((url.split('?')[0] ?? '')).replace(/^\/+/, '');
  const file = resolve(dir, rel);
  if (!file.startsWith(dir) || !existsSync(file)) {
    next();
    return;
  }
  const types: Record<string, string> = {
    '.onnx': 'application/octet-stream',
    '.bin': 'application/octet-stream',
    '.json': 'application/json',
    '.yaml': 'text/yaml',
    '.png': 'image/png',
  };
  const ext = file.slice(file.lastIndexOf('.'));
  res.setHeader('Content-Type', types[ext] ?? 'application/octet-stream');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  import('node:fs').then(({ createReadStream }) => createReadStream(file).pipe(res));
}

export default defineConfig({
  base: BASE,
  plugins: [servePolicies()],
  // onnxruntime-web ships prebuilt wasm; let Vite leave it alone.
  optimizeDeps: { exclude: ['onnxruntime-web'] },
  server: {
    // Cursor + this workspace already exhaust Linux inotify (ENOSPC). Polling
    // avoids `fs.watch` so `npm run dev` still starts.
    watch: {
      usePolling: true,
      interval: 400,
      ignored: [
        '**/.git/**',
        '**/dist/**',
        '**/*.onnx',
        '**/*.wasm',
        '**/*.STL',
        '**/*.stl',
        '**/policies/**/reference/**',
        '**/public/robots/**',
      ],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lab: resolve(__dirname, 'lab.html'),
      },
    },
  },
});
