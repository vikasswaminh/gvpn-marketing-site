# Phase 2 Content Opportunities

Based on current SERP landscape and Topical Authority gaps, the following content opportunities have been identified to capture high-intent search traffic around router mesh VPNs.

## 1. Tailscale Alternative (Pillar Page)
- **Suggested URL:** `/alternatives/tailscale/`
- **Search intent:** Users looking for a Tailscale alternative that doesn't charge per user, or specifically wanting to run Tailscale on a router without installing clients on every laptop.
- **Target audience:** SMB IT admins, network engineers, managed service providers (MSPs).
- **What users expect to learn:** A direct, honest comparison of architecture, pricing, and operational overhead between Tailscale (per-user, client-based) and MeshWG (per-router, agentless).
- **Existing MeshWG pages that should link to it:** `/compare/tailscale-vs-wireguard/`, `/pricing/`, Homepage.
- **Existing MeshWG content that covers this:** `/compare/tailscale-vs-wireguard/` touches on it briefly.
- **Unique information MeshWG provides:** The explicit mathematical cost breakdown of 5 sites × 50 users on Tailscale vs MeshWG, plus the operational benefit of not installing MDM profiles on endpoints.
- **Is there enough factual information:** Yes.
- **Risk of thin content:** Low, provided the page goes deep into architecture rather than just a feature matrix.
- **Recommendation:** **High Priority / Implement in Phase 2B.**

## 2. ZeroTier Alternative (Pillar Page)
- **Suggested URL:** `/alternatives/zerotier/`
- **Search intent:** Users experiencing performance issues with ZeroTier or looking for an open-source/standard protocol alternative.
- **Target audience:** Homelabbers scaling to SMBs, network admins.
- **What users expect to learn:** The difference between ZeroTier's custom L2 emulation protocol and WireGuard's L3 routing, specifically regarding throughput and battery life.
- **Existing MeshWG pages that should link to it:** `/compare/zerotier-vs-wireguard/`.
- **Existing MeshWG content that covers this:** `/compare/zerotier-vs-wireguard/`.
- **Unique information MeshWG provides:** Focus on the native router integration (ZeroTier is notoriously difficult to run on generic router firmware compared to WireGuard).
- **Is there enough factual information:** Yes.
- **Risk of thin content:** Low.
- **Recommendation:** **Medium Priority / Implement in Phase 2B.**

## 3. Site-to-Site WireGuard Setup Guide (Blog/Docs)
- **Suggested URL:** `/blog/site-to-site-wireguard-setup-guide/`
- **Search intent:** Step-by-step instructions on connecting two physical locations via WireGuard.
- **Target audience:** Office IT, tech-savvy founders.
- **What users expect to learn:** Exactly how to generate keys, configure endpoints, and route subnets between Site A and Site B.
- **Existing MeshWG pages that should link to it:** `/quickstart/`, `/docs/`.
- **Existing MeshWG content that covers this:** Multiple blog articles discuss "site-to-site" conceptually, but there isn't a single definitive, actionable tutorial.
- **Unique information MeshWG provides:** Showing how to do it manually (for free), and then showing how MeshWG automates the exact same configuration for 3+ sites.
- **Is there enough factual information:** Yes.
- **Risk of thin content:** None.
- **Recommendation:** **High Priority / Implement in Phase 2C.**

## 4. Router Mesh VPN Guide (Pillar Page)
- **Suggested URL:** `/router-mesh-vpn/`
- **Search intent:** Users explicitly searching for mesh VPN solutions that run natively on routers rather than endpoints.
- **Target audience:** Network engineers, business owners with branch offices.
- **What users expect to learn:** Which routers support mesh VPNs, the performance limitations of ARM CPUs, and how to orchestrate them.
- **Existing MeshWG pages that should link to it:** `/compatibility/`, Homepage.
- **Existing MeshWG content that covers this:** `/what-is-wireguard/` mentions it, `/compatibility/` lists routers.
- **Unique information MeshWG provides:** Aggregate real-world throughput benchmarks across MikroTik, TP-Link, and Asus hardware.
- **Is there enough factual information:** Yes.
- **Risk of thin content:** Low.
- **Recommendation:** **Medium Priority / Research further.**
