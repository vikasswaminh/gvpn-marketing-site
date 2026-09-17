# Phase 3 SEO Research

## Objective
Verify claims regarding ZeroTier's architecture, performance, pricing, and router compatibility, as well as MeshWG's security/audit status, before implementing the Phase 3 SEO Plan.

---

### 1. ZeroTier Architecture and Networking Model
- **Claim:** ZeroTier emulates a Layer 2 (Ethernet) virtual switch, whereas WireGuard operates at Layer 3 (IP routing).
- **Source:** Verified via web search (official ZeroTier documentation and industry consensus) and existing MeshWG `zerotier-vs-wireguard.astro` page.
- **Verification Status:** **Verified**. ZeroTier creates a virtualized network that functions like a physical Ethernet switch.
- **How to safely word it:** "ZeroTier is a Layer 2 network virtualization platform that emulates an Ethernet switch. WireGuard is a Layer 3 IP routing protocol."

### 2. ZeroTier Layer 2 vs WireGuard Layer 3
- **Claim:** ZeroTier's Layer 2 approach natively supports broadcast and multicast traffic (e.g., legacy Windows networking, industrial protocols), whereas WireGuard's Layer 3 approach does not natively pass broadcast traffic.
- **Source:** Verified via web search and existing MeshWG `zerotier-vs-wireguard.astro` page.
- **Verification Status:** **Verified**.
- **How to safely word it:** "Because ZeroTier emulates Layer 2, it supports broadcast and multicast traffic for legacy protocols (like mDNS or BACnet). WireGuard operates at Layer 3, meaning it routes IP packets and does not natively pass broadcast traffic, making it better suited for modern IP workloads."

### 3. ZeroTier Router / Platform Support
- **Claim:** ZeroTier is notoriously difficult or unsupported on generic router firmware.
- **Source:** Web search reveals ZeroTier *is* supported on OpenWrt, OPNsense, Ubiquiti, and MikroTik, but with strict hardware limitations. For example, MikroTik only supports ZeroTier on RouterOS v7+ and strictly on **ARM and ARM64 architectures** (MIPS architectures are not supported).
- **Verification Status:** **Partially Verified (Needs nuanced wording)**. It is not "unsupported", but it is hardware/architecture restricted compared to WireGuard.
- **How to safely word it:** "While ZeroTier can run on routers, it often requires specific hardware architectures. For example, on MikroTik, ZeroTier is restricted to ARM/ARM64 architectures on RouterOS v7+, whereas WireGuard is supported more broadly across router architectures."

### 4. ZeroTier Pricing (2026)
- **Claim:** ZeroTier charges per device on paid plans.
- **Source:** Verified via web search of current ZeroTier pricing.
- **Verification Status:** **Verified**.
- **Pricing details:** 
  - Basic: Free (up to 10 devices).
  - Essential: Starts at $18/month (includes 10 devices), then $2.00/month per additional device.
  - Scale: Starts at $179/month (includes 100 devices), then $1.80/month per additional device.
- **How to safely word it:** "ZeroTier's Essential plan starts at $18/month and charges $2.00 per month for each additional device. MeshWG charges a flat rate per machine/router, regardless of the number of users connecting through it."

### 5. Performance, Throughput, and Battery Usage
- **Claim:** WireGuard is faster than ZeroTier (1 Gbps+ vs 200-400 Mbps).
- **Source:** Verified via web search and MeshWG's existing `zerotier-vs-wireguard.astro`. WireGuard runs in the Linux kernel, whereas ZeroTier runs in userspace, which inherently adds overhead.
- **Verification Status:** **Verified (for Linux/hardware routers)**.
- **How to safely word it:** "Because WireGuard runs in the Linux kernel on supported platforms, it typically achieves higher throughput (often saturating 1 Gbps links) with lower latency. ZeroTier runs entirely in userspace, which generally caps throughput at lower thresholds (e.g., 200-400 Mbps on consumer hardware) due to the overhead of userspace processing and Ethernet framing."
- *Note:* Do not make explicit claims about battery life improvements or guaranteed migration benefits without specific benchmarks.

### 6. MeshWG Security / Privacy / Audit Evidence
- **Claim:** MeshWG has SOC2 compliance, third-party pentests, or specific privacy certifications.
- **Source:** Repository search (grep for `SOC2`, `audit`, `pentest`).
- **Verification Status:** **Unverified.** No evidence of formal third-party security audits or SOC2 compliance was found in the repository.
- **How to safely word it:** **DO NOT USE.** We cannot make claims about SOC2, pentests, or external security audits. We *can* reiterate the verified architectural security claims from `docs.astro`: "Keys are encrypted at rest," "No path to the public internet," and "Policies apply before traffic reaches the destination."

---

## Conclusion for Implementation
- The architectural difference (L2 vs L3) is factual and forms the strongest basis for the comparison page.
- Pricing claims can be used factually ($2.00/device/month vs flat-rate router pricing).
- Router compatibility should be framed around ZeroTier's ARM/ARM64 requirements on MikroTik vs WireGuard's broader support, rather than claiming ZeroTier is "unsupported."
- Avoid any unverified trust badges, SOC2 claims, or unproven battery-life metrics.
