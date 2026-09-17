# Router product photos for the /compatibility page

Drop product photos here, one per supported model. They are loaded by
`src/components/CompatibilityGrid.astro` and shown on
[meshwg.com/compatibility](https://meshwg.com/compatibility/).

If a photo for a given slug is missing, the page automatically falls back
to a vendor-tinted SVG silhouette. So adding photos is incremental — drop
in one or all sixty-something at any time and the page picks them up on
the next deploy.

## Naming convention

Filename **must** be `{slug}.webp`, where `{slug}` matches the entry in
the `models` array inside `src/components/CompatibilityGrid.astro`.

For example:

| Model | Filename |
|---|---|
| TP-Link Archer AX73 | `tplink-archer-ax73.webp` |
| MikroTik RB5009UG+S+IN | `mikrotik-rb5009.webp` |
| Ubiquiti Dream Machine Pro | `ubnt-udm-pro.webp` |
| GL.iNet GL-MT3000 (Beryl AX) | `glinet-beryl-ax.webp` |
| Netgate 1100 | `netgate-1100.webp` |

If you add a new model to the `models` array, choose the slug carefully —
short, lowercase, hyphenated, no firmware-version suffix.

## Image spec

- **Format**: WebP (preferred) or AVIF. Fall back to PNG only if the
  source has transparency the WebP encoder can't preserve.
- **Size**: 200 × 150 px (4 : 3 landscape). Larger source images are fine
  to drop in temporarily; the build step will not currently resize them
  but display will still scale to the card's 4 : 3 aspect ratio.
- **Weight**: target under 10 KB per image. With 57 models that keeps
  the cumulative page weight comfortably under 600 KB.
- **Background**: transparent or a single off-white. The card cell uses
  a subtle vendor-tinted gradient behind each image, so transparent PNG
  or WebP shows that gradient through.
- **Crop**: the device should occupy roughly 70 % of the frame, centred.

## Where to source

For trademark and compatibility-context use, the cleanest sources are:

1. **Vendor product pages.** TP-Link, MikroTik, Ubiquiti, GL.iNet,
   Synology, Asus, Netgate, and Protectli all publish high-resolution
   product photography on their official product detail pages. Most
   vendor brand guidelines explicitly permit compatibility-context use
   ("works with X") without partnership claims; the image typically
   keeps the vendor's own copyright notice in the page's footer
   crediting block.
2. **Wikipedia / Wikimedia Commons.** Several router models have
   community-photographed images released under CC licences. Check the
   license tag before using.
3. **Commissioned product photography.** For a polished look, all 57
   models can be re-photographed at modest cost (a single afternoon's
   product-shoot session covering an SMB router catalogue).

## What MeshWG does *not* do here

- No bulk-scraping of vendor product photos. Each image should be
  reviewed individually for licence compatibility before dropping in.
- No alteration of vendor branding or product markings beyond cropping
  and white-balance normalisation.
- No labelling or watermarking that implies a partnership or
  endorsement that does not exist.
