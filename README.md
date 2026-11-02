# V.K. Nguyen — personal site + G1 Motion Lab

Personal homepage for **V.K. Nguyen** (Physics & Philosophy, Reed College) with an interactive Unitree G1 laboratory: MuJoCo WASM + one pretrained ONNX policy in the browser.

## Pages

| URL | Purpose |
|-----|---------|
| `/` | Story: mind (physics/philosophy) → make → lab |
| `/lab.html` | Full motion laboratory |

## Quick start

Requires **Node.js ≥ 20.19** (or ≥ 22.12).

```bash
export PATH="$PWD/.tools/node/bin:$PATH"   # if needed
npm install
npm run dev
npm run build && npm run preview
```

## Host on Netlify (recommended)

1. Connect the repo in Netlify (build settings are in [`netlify.toml`](netlify.toml): `npm run build` → `dist`, Node 22).
2. Site URL is at the domain root (`/`). `VITE_BASE=/` is set in `netlify.toml`.
3. Lab: `/lab` or `/lab.html`.

The lab already runs **without** COOP/COEP (single-threaded MuJoCo + ONNX WASM), so Netlify’s default CDN is enough. `netlify.toml` sets WASM MIME types and long cache headers for the large assets (~10 MB MuJoCo, ~11 MB ORT, ~3 MB policy, ~36 MB robot meshes).

## Host on GitHub Pages

See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Enable **Settings → Pages → GitHub Actions**. Project sites use base `/<repo>/` automatically in CI.

## Content

Copy lives in [`src/home/content.ts`](src/home/content.ts). Do not invent jobs or papers.
