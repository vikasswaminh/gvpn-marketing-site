# Phase 3 SEO Plan (Revised)

## 1. Phase 3 Objective
The primary objective of Phase 3 is to continue expanding MeshWG's Topical Authority by building out the remaining high-intent content opportunities identified in Phase 2A and Phase 2B. This phase will focus on capturing traffic for "ZeroTier alternatives" and "Site-to-Site WireGuard setup".

## 2. Current SEO/Content Status (Post-Phase 1, 2A, 2B)
- **Phase 1:** Technical foundation optimized. Dynamic sitemaps, canonicals, robots.txt, and redirects are functioning perfectly. Metadata on core pages was rewritten for search intent without keyword stuffing. Schema (`FAQPage`, `BreadcrumbList`, `Organization`) was cleanly implemented.
- **Phase 2A:** Internal linking architecture was strengthened. Content gaps were mapped out, revealing a strong need for dedicated "Alternatives" pages and step-by-step router guides.
- **Phase 2B:** The `/alternatives/tailscale/` pillar page was successfully launched based on verified claims (pricing, architecture).

## 3. Pages that Phase 3 Should Target
- `src/pages/alternatives/zerotier.astro` (New Page)
- `src/content/blog/site-to-site-wireguard-setup-guide.md` (New Page)
- `src/pages/compare/zerotier-vs-wireguard.astro` (Modify - Add internal link)
- `src/components/Footer.astro` (Modify - **Optional**, only if "Alternatives" fits the existing navigation architecture naturally)

## 4. Phase 3 Research / Verification Step (Pre-Implementation)
**Before any files are modified or created, the following claims must be researched and verified:**

### A. Claims Verified from the Repository
- **MeshWG Architecture:** Uses a single managed hub, enforces strict organization isolation, applies policies before traffic reaches the destination, and doesn't route to the public internet (Verified from `src/pages/docs.astro`).
- **MeshWG Pricing:** Flat rate per machine/router (Verified from `src/pages/pricing.astro`).
- **Router Compatibility:** Supports TP-Link, MikroTik, OpenWrt, Ubiquiti, OPNsense natively (Verified from `src/pages/quickstart.astro`).
- **MeshWG Configuration:** Uses standard `wg-quick` format, no custom agents required (Verified from `src/pages/docs.astro`).

### B. Claims Requiring External Verification (Do Not Use Until Verified)
- **ZeroTier Performance:** Any claims regarding ZeroTier's performance, battery life, or throughput compared to WireGuard.
- **ZeroTier Architecture:** Claims regarding ZeroTier's custom L2 emulation vs WireGuard's L3 routing.
- **ZeroTier on Routers:** Claims that ZeroTier is notoriously difficult or unsupported on generic router firmware.
- **ZeroTier Migration Benefits:** Any unsupported guarantees about improvements after migrating away from ZeroTier.
- **E-E-A-T/Security Claims:** Any claims about MeshWG security audits, SOC2, pentest results, or explicit privacy badges (unless existing documentation proving this is found).

### C. Proposed SEO / Content Ideas
- **Site-to-Site WireGuard Setup Guide:** A manual tutorial demonstrating how to connect two physical locations using raw WireGuard (generating keys, configuring endpoints manually), and contrasting that with MeshWG's automated approach.
- **ZeroTier Alternative Page:** A factual comparison of MeshWG and ZeroTier, focusing strictly on verified differences in pricing, architecture (if verified), and management overhead.

## 5. Keyword / Search-Intent Opportunities
- **ZeroTier Alternative:** Intent is driven by users seeking an open-source/standard protocol alternative (WireGuard) that runs natively on routers, or those exploring alternatives to ZeroTier's management model.
- **Site-to-Site WireGuard Setup:** Intent is informational and instructional. Users are looking for exact, step-by-step instructions on connecting two physical locations manually.

## 6. Content Gaps & Differentiation
- **Setup Guide vs Quickstart/Docs:** 
  - *Current `quickstart.astro`:* Focuses on *vendor-specific UI steps* to connect a router to MeshWG.
  - *Current `docs.astro`:* Explains MeshWG's centralized architecture and the `wg-quick` config it generates.
  - *New `site-to-site-wireguard-setup-guide.md`:* Will provide a *manual* WireGuard setup tutorial (generating keys via CLI, configuring `wg0.conf` manually on two Linux boxes/routers) to capture informational search intent, and then present MeshWG as the automated alternative.
- **ZeroTier Alternative Pillar Page:** Needs to highlight MeshWG's native WireGuard integration and pricing structure compared to ZeroTier (pending verification of ZeroTier facts).

## 7. Technical & Schema Opportunities
- **Technical:** Ensure new routes are automatically picked up by `@astrojs/sitemap`.
- **Schema:** Add `FAQPage` schema to the new `/alternatives/zerotier.astro` page to capture "People Also Ask" SERP features. The new blog post will automatically receive `BlogPosting` and `BreadcrumbList` schema via the existing dynamic layout.

## 8. Exact Files That Would Need Modification
1. **[NEW]** `src/pages/alternatives/zerotier.astro`
2. **[NEW]** `src/content/blog/site-to-site-wireguard-setup-guide.md`
3. **[MODIFY]** `src/pages/compare/zerotier-vs-wireguard.astro` (To add internal link)
4. **[MODIFY]** `src/components/Footer.astro` (**Optional**, to add the new "Alternatives" link block)

## 9. Risks of Duplicate/Thin/Overlapping Content
- **ZeroTier Alternative vs Compare Page:** Risk of overlapping with `/compare/zerotier-vs-wireguard/`. 
  - *Mitigation:* The comparison page must remain strictly focused on protocol differences (once verified), while the alternative page focuses holistically on the product, pricing, and management overhead.
- **Setup Guide vs Quickstart:** Risk of the blog post overlapping with `/quickstart/`.
  - *Mitigation:* The blog post focuses on *manual* WireGuard CLI configuration, while the quickstart focuses on pasting MeshWG configs into vendor UIs.

## 10. Expected SEO Benefit
- **Increased Organic Traffic:** Capturing mid-to-low funnel search traffic exploring ZeroTier alternatives.
- **Topical Authority:** Solidifying the site as an authority on "site-to-site VPNs" and router-based WireGuard meshes by providing a genuinely useful manual guide.
*(Note: These benefits are expected based on SEO best practices; specific ranking or traffic volume guarantees cannot be made).*

## 11. Implementation Sequence
1. **Step 1 (Research):** Verify ZeroTier architectural/performance claims and check for any existing MeshWG security audits.
2. **Step 2:** Create `src/pages/alternatives/zerotier.astro` using *only* verified factual comparisons and `FAQPage` schema.
3. **Step 3:** Create `src/content/blog/site-to-site-wireguard-setup-guide.md` focusing on manual setup vs MeshWG.
4. **Step 4:** Update `src/pages/compare/zerotier-vs-wireguard.astro` to link contextually to the new alternative page.
5. **Step 5 (Optional):** Evaluate if an "Alternatives" footer block fits the navigation architecture and update `src/components/Footer.astro` if appropriate.
6. **Step 6:** Run `npm run build` to verify static generation, sitemap integrity, and absence of errors.

---
*Awaiting review and approval before proceeding with research and implementation.*
