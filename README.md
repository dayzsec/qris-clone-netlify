# QRIS Clone — Netlify-ready (Vite + React + Tailwind + Framer Motion)

## Run locally
```bash
npm install
npm run dev
```
Open the shown localhost URL (default: http://localhost:5173).

## Build & preview
```bash
npm run build
npm run preview
```

## Deploy via GitHub → Netlify
1. Push this folder to a GitHub repo.
2. In Netlify: Add new site → Import from Git → select repo.
3. Build command: `npm run build` — Publish dir: `dist`.
4. Netlify will auto-deploy on each `git push`.

> Note: commit the generated `package-lock.json` after `npm install` locally for reproducible builds.
