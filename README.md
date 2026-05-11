# gvpn-marketing-site

Marketing site for [MeshWG](https://github.com/vikasswaminh/meshwg) — the
open-source SDWAN/ZTNA controller built on standard WireGuard.

Static Astro site, deployed to Cloudflare Pages.

## Stack

- **Astro 4** — static output (`output: 'static'`), zero JS shipped to the
  browser by default
- **Design tokens** — single source of truth in `src/styles/tokens.css`;
  every component reads from CSS vars
- **Fonts** — Geist + Geist Mono via Google Fonts
- **No analytics, no trackers** — intentionally

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # outputs to ./dist
npm run preview      # serve ./dist locally
```

## Project structure

```
src/
├── pages/
│   └── index.astro              # the marketing page
├── layouts/
│   └── Base.astro               # html shell + fonts + meta
├── components/
│   ├── Nav.astro
│   ├── Hero.astro
│   ├── VendorStrip.astro
│   ├── HowItWorks.astro
│   ├── ConfigBlock.astro
│   ├── Features.astro
│   ├── Compare.astro
│   ├── Deploy.astro
│   ├── FAQ.astro
│   ├── CTA.astro
│   ├── Footer.astro
│   ├── BrandMark.astro
│   ├── Check.astro
│   └── icons/
│       ├── IconBuilding.astro
│       ├── IconRouter.astro
│       └── IconShield.astro
└── styles/
    └── tokens.css               # design tokens (colors, radii, fonts, layout)

public/
└── favicon.svg
```

## Content policy

Every claim on the site has to map to something that actually exists in
the [MeshWG repo](https://github.com/vikasswaminh/meshwg). No
made-up customer logos, no fabricated metrics, no aspirational features.
If a section refers to a feature, it points at the file or e2e step that
implements it. If a number appears (e.g. "24-step harness, ~3 min"), it
matches the harness output.

The source design (from Claude Design) contained several
SaaS-shaped claims that aren't true of this project today — pricing
tiers, SOC 2 certification, cloud relay regions, SSO providers — and
those have been removed or replaced with honest equivalents.

## Cloudflare Pages deployment

This repo is wired for [Cloudflare Pages](https://pages.cloudflare.com/)
with these settings (configure once in the CF dashboard):

| Setting              | Value                  |
|----------------------|------------------------|
| Production branch    | `master`               |
| Build command        | `npm run build`        |
| Build output dir     | `dist`                 |
| Node version         | `20` or newer          |
| Root directory       | (repo root)            |

CF Pages auto-builds on every push to `master`. Preview deployments
auto-build on every other branch / PR.

## License

The site code is MIT — same as the underlying product.
