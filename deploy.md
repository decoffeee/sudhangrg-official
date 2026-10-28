# Deploying

The site is a Next.js 15 app. The home page is prerendered at build time, but
it still needs a Node server (or Vercel) at runtime for image optimisation
(`next/image`) and the generated Open Graph image. A plain static export is
not supported as-is.

## Requirements

- Node.js 20 or newer (Next 15 needs ≥ 18.18; 20 LTS or 22 LTS recommended)
- pnpm 10 (`corepack enable` gives you the version pinned in `package.json`'s `packageManager`)

`pnpm-lock.yaml` is the source of truth. `package-lock.json` is kept in sync
for hosts that only run npm. Whichever you use, use it everywhere.

## Environment variables

| Name | Required | Example | Used for |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | `https://sudhangurung.com` | Canonical URLs, Open Graph, `sitemap.xml`, `robots.txt` |

No trailing slash. Without it, every absolute URL falls back to
`http://localhost:3000`, which breaks link previews and search indexing.
It is read at **build** time (`NEXT_PUBLIC_*` values are inlined), so set it
before building and rebuild if it changes.

For local production testing, copy `.env.example` to `.env.local`
(`.env*.local` is git-ignored).

## Option A — Vercel (recommended)

1. Push to GitHub (`origin` is `decoffeee/sudhangrg-official`).
2. On vercel.com: **Add New → Project → Import** the repository.
   Framework, install (`pnpm install`) and build (`pnpm build`) commands are
   detected automatically; leave them as they are.
3. Under **Settings → Environment Variables**, add `NEXT_PUBLIC_SITE_URL` for
   the Production environment (and Preview if you want correct previews).
4. Under **Settings → Git**, set the production branch to `main`. Every other
   branch (for example `dev/iteration`) gets its own preview URL.
5. Add the domain under **Settings → Domains** and follow the DNS
   instructions shown there.

To ship: merge into `main` and push. Vercel builds and deploys on its own.

## Option B — Your own server (VPS, Docker host, etc.)

```bash
git clone https://github.com/decoffeee/sudhangrg-official.git
cd sudhangrg-official
corepack enable
pnpm install --frozen-lockfile
NEXT_PUBLIC_SITE_URL=https://your-domain.com pnpm build
PORT=3000 pnpm start
```

Keep it running with a process manager, for example pm2:

```bash
npm i -g pm2
pm2 start "pnpm start" --name sudhangrg
pm2 save && pm2 startup
```

Put a reverse proxy (nginx, Caddy) in front for HTTPS and point it at
`localhost:3000`. Optimised images are cached in `.next/cache/images`; keep
that directory between restarts so images are not re-encoded on every boot.

To update:

```bash
git pull
pnpm install --frozen-lockfile
pnpm build
pm2 restart sudhangrg
```

## Before every deploy

```bash
pnpm install --frozen-lockfile
pnpm build          # also type-checks; must finish without errors
pnpm start          # then open http://localhost:3000 and check:
```

- The intro counts to 100, then shows the sound card; both choices dismiss it.
- The page scrolls top to bottom without stalls, and the Gorkha 3D map builds
  as it comes into view.
- Judge smoothness on `pnpm start`, not `pnpm dev`: the dev server is much
  heavier and is not representative.

## Large files

`public/music/` holds the background track (~9 MB) and `public/images/` the
photos. Both are committed and served as static files, so no extra storage is
needed. If the repository grows much larger, move the audio to a CDN and
update `MUSIC` in `src/components/motion/Loader.tsx`.
