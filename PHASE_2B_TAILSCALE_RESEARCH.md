# Phase 2B: Tailscale Alternative Research & Content Plan

## 1. Search Intent
Users searching for "Tailscale alternative" are typically looking for solutions that resolve specific pain points with Tailscale, primarily:
- The per-user pricing model which scales poorly for multi-site organizations with many employees.
- The operational overhead of installing and managing endpoint agents (via MDM) on every device.
- The desire to deploy a mesh VPN natively at the router level to cover entire branch LANs seamlessly without individual client software.

## 2. Target Audience
- **Primary:** SMB IT Administrators, Network Engineers, and Managed Service Providers (MSPs).
- **Secondary:** Tech-savvy founders and operations managers trying to connect multiple physical offices without enterprise budget constraints.

## 3. Verified Tailscale Facts
- **Architecture:** Uses WireGuard at the data plane and a proprietary centralized server at the coordination plane.
- **Client/Endpoint Requirements:** Requires the Tailscale agent to be installed on every device (unless specifically configuring subnet routers, which still typically run on servers/VMs rather than native edge routers).
- **Pricing Model:** Free for up to 3 users; business tiers charge per user (e.g., ~$6/user/month for standard paid tiers).
- **Identity/Key Management:** Relies on third-party SSO (Google, Microsoft, Okta) to authenticate users and issue/rotate keys automatically.
- **NAT Traversal:** Uses DERP (Designated Encrypted Relay for Packets) servers to successfully punch through strict firewalls and double-NAT (CGNAT).

## 4. Verified MeshWG Facts (From Repository)
- **Architecture:** Uses standard WireGuard at the data plane and a managed centralized coordination plane.
- **Router Deployment (Agentless for LAN):** Deploys directly on standard branch routers (TP-Link, MikroTik, Ubiquiti, Asus, etc.), allowing all devices behind the router to participate in the mesh without any client software installed.
- **Pricing Model:** Charges per machine/router, not per user. Currently ₹349 ($4.20) per machine/month (billed annually), with the first 2 machines free forever.
- **Key Management:** Central coordination layer distributes keypairs, peer state, and policy enforcement across the router fleet.

## 5. Direct Factual Differences
- **Billing Metric:** Tailscale scales costs linearly with headcount (per-user). MeshWG scales costs linearly with physical infrastructure (per-router).
- **Endpoint Overhead:** Tailscale requires MDM deployment and client management on laptops/phones. MeshWG shifts the VPN termination to the edge router, making the VPN transparent to the end-user devices.

## 6. Claims Verification & Restrictions
- **"Tailscale alternative"** -> **VERIFIED.**
- **"per-user vs per-router"** -> **VERIFIED.** (Supported by MeshWG Pricing page and Tailscale public pricing).
- **"agentless"** -> **VERIFIED.** (For the LAN devices, the VPN is entirely agentless because it terminates at the router).
- **"doesn't charge per user"** -> **VERIFIED.** (MeshWG explicitly charges per machine/node).
- **"not installing clients on every laptop"** -> **VERIFIED.**
- **"5 sites × 50 users cost comparison"** -> **VERIFIED.** (10-branch with 100 staff costs $42/mo on MeshWG vs $600/mo on Tailscale Business is already cited on `/compare/tailscale-vs-wireguard/`).
- **"MDM profile benefit"** -> **VERIFIED.** (A direct operational consequence of router-based deployment).

**CLAIMS THAT MUST NOT BE PUBLISHED:**
- Do not claim MeshWG is "better" or "superior"—only that it serves a different operational shape (site-to-site vs user-to-service).
- Do not claim Tailscale is slow (Tailscale's data plane is identical to MeshWG's: WireGuard).
- Do not claim Tailscale cannot do site-to-site (Tailscale subnet routers exist, but they are conceptually different from native edge-router deployments).

## 7. Recommended Page Structure
1. **Hero Section:** Direct, honest positioning (Router-first vs User-first).
2. **The Core Architectural Difference:** Visualizing a per-device mesh vs a per-site mesh.
3. **The Financial Math (Cost Comparison):** A transparent breakdown of 5 sites x 50 users.
4. **Operational Overhead (The MDM Tax):** Why skipping client installation saves IT hours.
5. **Shared DNA (WireGuard):** Acknowledging that both use WireGuard and both are highly secure.
6. **When to Choose Which:** Honest assessment (Choose Tailscale for fully remote teams; Choose MeshWG for branch offices).
7. **Call to Action:** Link to free 2-router tier.

## 8. Proposed Title
`Tailscale Alternative for Branch Offices: MeshWG vs Tailscale`

## 9. Proposed Meta Description
`Looking for a Tailscale alternative that doesn't charge per user? Compare the differences between user-based mesh VPNs and router-based WireGuard deployments.`

## 10. Recommended Internal Links
- From `/compare/tailscale-vs-wireguard/` (to the new alternative page).
- From the Homepage (if there is an alternatives footer or section).
- To `/pricing/` (to substantiate the cost claims).
- To `/compatibility/` (to prove the router support claims).

## 11. Evidence/Source for Each Important Factual Claim
- *Tailscale pricing/model*: Tailscale official public pricing page (per user scaling).
- *MeshWG pricing*: `src/pages/pricing.astro` (₹349/machine/month).
- *WireGuard protocol usage*: `src/pages/compare/tailscale-vs-wireguard.astro` (Both use WireGuard data plane).
- *Agentless/Router deployment*: `src/pages/compatibility.astro` (Natively supported on 57+ routers).

## 12. Content Gaps
None. The repository already contains sufficient factual data, pricing math, and architectural philosophy (especially within the `tailscale-vs-wireguard` comparison page) to build a robust, honest pillar page without fabricating facts.

## 13. Risk Assessment
- **Thin Content Risk:** Low. The architectural and financial differences provide deep, highly specific content.
- **Reputational Risk:** Low, provided the tone remains respectful and acknowledges Tailscale's strengths for remote-first teams.

## 14. Final Recommendation
**READY TO IMPLEMENT**
