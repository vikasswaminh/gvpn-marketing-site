---
title: "WireGuard Mesh VPN and VLANs: How to Connect Selected Networks Securely (2026 Guide)"
description: "WireGuard Mesh VPN and VLANs: Learn how to isolate, route, and selectively interconnect 802.1Q local subnets across multi-site mesh overlays without bridging broadcast domains."
slug: "wireguard-mesh-vpn-and-vlans-connect-selected-networks-securely"
pubDate: 2026-09-17
updatedDate: 2026-09-17
author: "MeshWG Network Architecture Team"
tags: ["Network Architecture & Zero Trust", "WireGuard VLAN routing", "802.1Q WireGuard trunking", "selective network isolation VPN", "Layer 3 mesh VPN segmentation", "WireGuard AllowedIPs subnet routing", "site-to-site inter-VLAN routing", "MeshWG router mesh"]
seoKeywords: ["WireGuard Mesh VPN and VLANs", "WireGuard VLAN routing", "802.1Q WireGuard trunking", "selective network isolation VPN", "Layer 3 mesh VPN segmentation", "WireGuard AllowedIPs subnet routing", "site-to-site inter-VLAN routing", "MeshWG router mesh"]
cover: "../../assets/images/wireguard_vlan_cover.png"
---

> **Related Reading:** [How WireGuard Site-to-Site VPN Works (2026 Protocol Guide)](/blog/wireguard-site-to-site-vpn-how-it-works-2026/)
> 
> **Related Reading:** [Managing Multiple WireGuard Tunnels & Mesh VPN Guide (2026)](/blog/manage-multiple-wireguard-tunnels-mesh-vpn-2026/)
> 
> **Related Reading:** [Agentless WireGuard Mesh VPN on Existing Routers](/blog/wireguard-mesh-vpn-without-agent-existing-routers/)

<article class="tldr-box">
  <h3>TL;DR</h3>
  <ul>
    <li><strong>WireGuard is Strictly Layer 3:</strong> WireGuard operates as a virtual <code>tun</code> device processing raw IPv4/IPv6 datagrams. It cannot transport raw Ethernet frames or 802.1Q tags across the tunnel. VLAN tags must terminate at the local gateway router before traffic enters the encrypted overlay.</li>
    <li><strong>Selective Subnet Isolation:</strong> You never need to bridge an entire physical office network. By terminating VLANs at the local switch and router, you can bridge an isolated Server or ERP VLAN across regional offices while ensuring Guest, IoT, and Management VLANs remain completely unreachable across the WAN.</li>
    <li><strong>Cryptokey Routing as a Cryptographic Firewall:</strong> WireGuard's <code>AllowedIPs</code> directive functions as both an outbound route table and an inbound cryptographic packet filter. Packets originating from unlisted local VLAN subnets are discarded in kernel space before transmission.</li>
    <li><strong>Avoid Layer 2 WAN Bridging (VXLAN/GRETAP):</strong> Attempting to bridge Layer 2 broadcast domains across public broadband introduces severe broadcast storm vulnerabilities, BUM traffic saturation, and heavy MTU penalties. Routed Layer 3 segmentation is faster, cleaner, and far more resilient.</li>
    <li><strong>Control Plane Automation Eliminates Configuration Decay:</strong> Hand-rolling multi-VLAN mesh configurations across more than three locations triggers an exponential configuration crisis. A modern control plane like MeshWG automates peer discovery across CGNAT, synchronizes AllowedIPs, and enforces segment isolation on your existing routers without proprietary appliances.</li>
  </ul>
</article>



Modern corporate networks do not run on flat address spaces. A retail branch, regional clinic, industrial plant, or engineering office isolates its local traffic into dedicated IEEE 802.1Q Virtual Local Area Networks (VLANs). Point-of-sale systems live in one isolated subnet, industrial controllers in another, internal application servers in a third, and untrusted visitor Wi-Fi or IoT sensors in a strictly fenced guest VLAN.

The challenge starts when geographically distributed offices must communicate. The local ERP database in Branch A needs to replicate with the warehouse cluster in Branch B. Remote engineers must access staging environments hosted in an AWS or Hetzner VPC. However, under no circumstances should an insecure smart TV on the guest Wi-Fi in Branch A be able to route a single packet to the database VLAN in Branch B.

Legacy networking tackled this problem by deploying proprietary, six-figure hardware SD-WAN appliances or by setting up fragile Layer 2 VPN bridges that saturated WAN uplinks with broadcast noise. In 2026, the standard architecture is a routed WireGuard Mesh VPN integrated with local VLAN gateways.

This guide provides an exhaustive engineering breakdown of connecting selected VLANs securely across a WireGuard mesh: the protocol boundary between 802.1Q tags and Layer 3 cryptokey routing, why Layer 2 WAN bridging fails, production router configurations across Linux, OpenWrt, MikroTik, and OPNsense, MTU/MSS clamping math, firewall zoning, and how to scale multi-site isolation using a cloud control plane like MeshWG.

<h2 id="under-the-hood">Under the Hood: Layer 2 802.1Q Tagging vs. WireGuard Cryptokey Routing</h2>

To build a resilient multi-network interconnect, you must understand where Layer 2 ends and Layer 3 begins. Confusing switch VLAN tagging with WireGuard tunnel encapsulation is the most common cause of broken routing tables, silent drops, and security leaks.

### How IEEE 802.1Q VLAN Tagging Operates

On physical local infrastructure, network segmentation takes place at the Data Link Layer (Layer 2). Ethernet switches use IEEE 802.1Q frame tagging to multiplex several distinct broadcast domains across shared physical cabling:

- **Access Ports:** Connect directly to end-user devices (workstations, printers, IP phones). Frames traversing access ports are standard, untagged Ethernet II frames. The switch assigns them an internal VLAN ID based on the physical port configuration.
- **Trunk Ports:** Interconnect switches, hypervisors, and routers. When an Ethernet frame traverses a trunk port, the switch inserts a 4-byte 802.1Q tag directly between the Source MAC Address and the EtherType field:
  - **TPID (Tag Protocol Identifier, 2 bytes):** Set to 0x8100 to indicate an 802.1Q tagged frame.
  - **TCI (Tag Control Information, 2 bytes):** Contains a 3-bit Priority Code Point (PCP for Layer 2 QoS), a 1-bit Drop Eligible Indicator (DEI), and a 12-bit VLAN Identifier (VID) supporting VLAN IDs from 1 to 4094.

At the router, the operating system instantiates virtual sub-interfaces (such as `eth0.10`, `eth0.20`, or `vlan10`, `vlan20`). The router strips the 802.1Q header upon frame ingress, inspects the underlying Layer 3 IP packet, matches it against its IP routing table, applies firewall policies, and forwards the packet out the appropriate egress interface.

### WireGuard Operates Strictly at Layer 3

WireGuard does not process Ethernet frames. It creates a virtual network interface of type `tun` (network tunnel), not `tap` (network tap / Ethernet bridge).

When an operating system passes a packet to a WireGuard interface (`wg0`):

1. It passes a raw IPv4 or IPv6 packet. There is no Ethernet header, no source MAC address, no destination MAC address, and zero 802.1Q VLAN tags.
2. WireGuard executes **Cryptokey Routing**: it inspects the destination IP address in the packet header, matches it against its internal table of `AllowedIPs` assigned to configured peers using a longest-prefix match, encrypts the payload using ChaCha20-Poly1305, wraps it in an outer UDP datagram, and transmits it to the peer’s public UDP endpoint.
3. Upon receiving a packet on its UDP listening port, WireGuard authenticates the sender using the Noise_IK handshake, decrypts the datagram, and verifies whether the inner source IP address is permitted in that peer’s `AllowedIPs`. If valid, the raw IP packet is injected into the local kernel networking stack for standard routing.

Because WireGuard is strictly Layer 3, you cannot pass 802.1Q tagged frames directly across a standard WireGuard tunnel. The VLAN tags must be stripped at the local router interface before the payload enters the WireGuard tunnel.

### Why Layer 2 WAN Bridging (VXLAN-over-WireGuard) is an Anti-Pattern

Engineers coming from legacy data center environments frequently ask: *"Can we run VXLAN or GRETAP over WireGuard so that our VLANs span seamlessly across our remote branches?"*

While technically possible—by creating a VXLAN virtual interface, pointing its remote endpoint to a WireGuard overlay address, and bridging the local Ethernet VLAN to the VXLAN tunnel—doing this across the public internet introduces severe operational penalties:

| Operational Metric | Layer 2 Bridging (VXLAN over WireGuard) | Routed Layer 3 Interconnect (Pure WireGuard) |
| --- | --- | --- |
| **BUM Traffic Handling** | Floods Broadcast, Unknown Unicast, and Multicast over WAN | Zero broadcast packets transmitted; all traffic is routed unicast |
| **MTU Overhead Penalty** | Heavy: 50–70 bytes (Outer IP + UDP + WG + VXLAN + Ethernet) | Minimal: 32 bytes WireGuard + 28 bytes outer IP/UDP |
| **Failure Domain** | Shared: A switching loop or ARP storm at Site A crashes Site B | Isolated: Layer 2 failures remain completely confined to the local switch |
| **Granular Security** | Difficult: Requires filtering Ethernet MAC tables and ARP frames | Native: Standard Layer 3/4 firewall rules (nftables, iptables, pf) |
| **Throughput & CPU Load** | High CPU overhead from double-encapsulation and ARP learning | Line-rate kernel routing with minimal context switches |

Bridging Layer 2 across WAN links turns several independent branch offices into a single fragile broadcast domain. If an employee connects a rogue switch or creates an Ethernet loop at a satellite office, the resulting broadcast storm floods the WAN tunnel, consumes uplink bandwidth, and knocks offline all interconnected facilities.

The definitive modern architecture is clear: terminate VLANs at the local gateway router, and use Layer 3 WireGuard routing to connect selected subnets.

<h2 id="architectural-blueprints">Architectural Blueprints for Selective VLAN Interconnections</h2>

When interconnecting multi-branch or hybrid-cloud environments, an "all-or-nothing" bridge creates unacceptable security risks. You need explicit control over which local VLANs can communicate across the WAN. Below are the three primary architectural patterns.

### Blueprint A: Router-on-a-Stick with Zone-Based Mesh Forwarding

This is the standard topology for small-to-medium enterprises and branch offices. A managed Layer 2/3 switch connects to a single physical interface on an edge router (such as an OpenWrt, MikroTik, or Linux appliance) via an 802.1Q trunk link.

1. The physical interface `eth0` on the router receives tagged frames for VLAN 10 (Management), VLAN 20 (Production Servers), VLAN 30 (Workstations), and VLAN 50 (Guest/IoT).
2. The router creates virtual sub-interfaces: `eth0.10`, `eth0.20`, `eth0.30`, and `eth0.50`.
3. The router runs a WireGuard interface (`wg0`) connected to the mesh network.
4. **Selective Connection Logic:** Inter-VLAN routing is disabled by default. In the router's firewall, traffic from `eth0.20` (Production Servers) is granted forwarding permission to `wg0`. Traffic from `eth0.50` (Guest) is routed exclusively out the WAN interface (`eth1`) for direct internet access and is explicitly blocked from reaching `wg0`.

### Blueprint B: Multi-VRF (Virtual Routing and Forwarding) Isolation

In high-compliance environments (such as healthcare, banking, or PCI-DSS certified retail), software firewall rules alone may not satisfy stringent internal security audits. You can implement Multi-VRF on Linux or RouterOS:

- **VRF 1 (Corporate):** Encompasses `eth0.20`, `eth0.30`, and the WireGuard interface `wg0`. These interfaces share a dedicated routing table.
- **VRF 2 (Guest / Untrusted):** Encompasses `eth0.50` and the WAN gateway. It has its own completely isolated routing table.

**Security Guarantee:** Even if an attacker compromises the guest Wi-Fi gateway or exploits a bug in the firewall daemon, the guest network has no kernel routing table entry for `wg0`. Packets cannot physically be forwarded between the untrusted VLAN and the WireGuard mesh.

### Blueprint C: MeshWG Cloud-Orchestrated Hybrid Gateway

When an organization scales beyond a handful of locations, maintaining static route tables and asymmetric firewall scripts on every edge router becomes unmanageable.

In the MeshWG architecture:

1. Existing edge routers in each branch establish outbound WireGuard tunnels to the mesh overlay.
2. The administrator logs into the centralized MeshWG control console and designates which local subnet each router is authorized to advertise (e.g., Branch Mumbai advertises 10.14.20.0/24; Branch Bengaluru advertises 10.12.20.0/24).
3. MeshWG's control plane automatically calculates the global `AllowedIPs` matrix, generates cryptographic peer pairings, pushes routing updates to local router kernels, and monitors peer reachability across Carrier-Grade NAT (CGNAT).
4. Local guest and management subnets are simply excluded from the MeshWG network configuration, ensuring they never enter the mesh routing domain.

<h2 id="configuring-allowedips">The Mechanics of Selective Exposure: Configuring AllowedIPs</h2>

The foundation of WireGuard security is `AllowedIPs`. It is not just an IP route table; it is a cryptographic access control list (ACL) enforced inside the kernel network stack.

### How AllowedIPs Controls Ingress and Egress

For every peer defined in a WireGuard configuration file:

- **Outbound (Routing):** When the local host routes a packet to `wg0`, WireGuard searches for the peer whose `AllowedIPs` contains the destination IP address using a longest-prefix match.
- **Inbound (Packet Filtering):** When a decrypted packet arrives from a peer over the network, WireGuard verifies the packet's source IP against that peer's `AllowedIPs`. If the source IP does not match, WireGuard discards the packet immediately in kernel space. No application, no firewall rule, and no routing hook ever sees it.

### Practical Scenario: Selective 3-Site VLAN Matrix

Consider an enterprise with three physical sites:

**Headquarters (Delhi):**
- VLAN 10 (Management): `10.1.10.0/24` (Local only)
- VLAN 20 (Core ERP & DB): `10.1.20.0/24` (Must be accessible by Branch Mumbai & Pune)
- VLAN 30 (HQ Staff): `10.1.30.0/24` (Access to ERP and Branch Servers)
- VLAN 50 (Guest): `192.168.1.0/24` (Local internet only)

**Branch Mumbai:**
- VLAN 10 (Management): `10.2.10.0/24` (Local only)
- VLAN 20 (Branch Application Servers): `10.2.20.0/24` (Syncs with HQ DB)
- VLAN 30 (Branch Workstations): `10.2.30.0/24` (Needs access to HQ ERP only)
- VLAN 50 (Guest): `192.168.2.0/24` (Local internet only)

**Branch Pune:**
- VLAN 10 (Management): `10.3.10.0/24` (Local only)
- VLAN 30 (Warehouse Terminals): `10.3.30.0/24` (Needs access to HQ ERP only)
- VLAN 50 (Guest): `192.168.3.0/24` (Local internet only)

#### Step 1: Establish the WireGuard Overlay Subnet

Every gateway router needs an overlay IP address on the `wg0` interface for point-to-point tunnel management. We use `10.100.0.0/24`:

- HQ Gateway: `10.100.0.1/32`
- Mumbai Gateway: `10.100.0.2/32`
- Pune Gateway: `10.100.0.3/32`

#### Step 2: Configure HQ Gateway (`/etc/wireguard/wg0.conf`)

The HQ router needs to route traffic to Mumbai's Server & Workstation VLANs, and Pune's Warehouse VLAN:

```ini
[Interface]
Address = 10.100.0.1/24
PrivateKey = <HQ_GATEWAY_PRIVATE_KEY>
ListenPort = 51820

# Peer: Branch Mumbai Gateway
[Peer]
PublicKey = <MUMBAI_GATEWAY_PUBLIC_KEY>
Endpoint = mumbai.example.com:51820
# We allow Mumbai's WireGuard IP, its Server VLAN, and its Workstation VLAN.
# Notice: Mumbai's VLAN 10 (Management) and VLAN 50 (Guest) are completely omitted!
AllowedIPs = 10.100.0.2/32, 10.2.20.0/24, 10.2.30.0/24
PersistentKeepalive = 25

# Peer: Branch Pune Gateway
[Peer]
PublicKey = <PUNE_GATEWAY_PUBLIC_KEY>
Endpoint = pune.example.com:51820
# We allow Pune's WireGuard IP and its Warehouse VLAN.
AllowedIPs = 10.100.0.3/32, 10.3.30.0/24
PersistentKeepalive = 25
```

#### Step 3: Configure Branch Mumbai Gateway (`/etc/wireguard/wg0.conf`)

Mumbai needs to communicate with HQ's ERP database, but should have zero routing visibility into Branch Pune:

```ini
[Interface]
Address = 10.100.0.2/24
PrivateKey = <MUMBAI_GATEWAY_PRIVATE_KEY>
ListenPort = 51820

# Peer: Headquarters Gateway
[Peer]
PublicKey = <HQ_GATEWAY_PUBLIC_KEY>
Endpoint = hq.example.com:51820
# Only allow HQ's WireGuard IP and HQ's Core ERP/DB VLAN (10.1.20.0/24).
# Mumbai cannot route to HQ Management (10.1.10.0/24) or HQ Staff (10.1.30.0/24).
AllowedIPs = 10.100.0.1/32, 10.1.20.0/24
PersistentKeepalive = 25
```

#### The Security Result of this Asymmetric Configuration

1. **Zero Lateral Movement for Untrusted Networks:** If a compromised machine on Mumbai's Guest VLAN (192.168.2.155) attempts to ping HQ's ERP (10.1.20.5), the Mumbai router's firewall blocks it from entering `wg0`. Even if the firewall were misconfigured to forward it, the HQ gateway's WireGuard interface would inspect the packet, see that `192.168.2.0/24` is not listed in Mumbai's `AllowedIPs`, and silently drop it.
2. **Management Network Isolation:** Because `10.1.10.0/24`, `10.2.10.0/24`, and `10.3.10.0/24` are nowhere in any peer's `AllowedIPs`, no branch can attack another branch’s router admin panel or switch management ports across the VPN.

<h2 id="step-by-step-implementation">Step-by-Step Implementation: Production Router Configurations</h2>

Architecture Objective across all platforms:
- Physical trunk carries VLAN 20 (Servers: `10.10.20.1/24`) and VLAN 50 (Guest: `192.168.50.1/24`).
- VLAN 20 is permitted to route across WireGuard (`wg0`) to HQ (`10.10.100.0/24`).
- VLAN 50 (Guest) is strictly blocked from the tunnel and restricted to the WAN internet gateway.
- Source NAT (MASQUERADE) is applied only to WAN, never to `wg0`.

### Platform 1: Linux Gateway (systemd-networkd + nftables)

1. **Interfaces (systemd-networkd):** Create VLAN netdevs `eth0.20` and `eth0.50`, assign IPs (`10.10.20.1/24`, `192.168.50.1/24`), and bring up `wg0` with MTU 1420. Enable forwarding in sysctl: `net.ipv4.ip_forward=1` and `rp_filter=1`.

2. **Selective Firewall (`/etc/nftables.conf`):**

```nft
table inet filter {
    chain forward {
        type filter hook forward priority filter; policy drop;
        ct state established,related accept
        # Allow Server VLAN (eth0.20) <-> WireGuard (wg0)
        iifname "eth0.20" oifname "wg0" accept
        iifname "wg0" oifname "eth0.20" accept
        # Allow both VLANs to Internet WAN; drop Guest -> WireGuard
        iifname { "eth0.20", "eth0.50" } oifname "eth1" accept
        iifname "eth0.50" oifname "wg0" drop
        # TCP MSS Clamping
        oifname "wg0" tcp flags syn tcp option maxseg size set 1380
    }
}
table ip nat {
    chain postrouting {
        type nat hook postrouting priority srcnat;
        oifname "eth1" masquerade # WAN only! Do NOT masquerade wg0.
    }
}
```

### Platform 2: OpenWrt 23.05+ (Bridge VLAN Filtering + Firewall4)

1. **Network Definition (`/etc/config/network`):** Create `server_vlan` on `br-lan.20` and `guest_vlan` on `br-lan.50`. Configure `wgmesh` with peer public key and `allowed_ips '10.10.0.0/16'`.

2. **Zone Isolation (`/etc/config/firewall`):** Place each VLAN in its own zone and allow forwarding only between the Server zone and Mesh zone:

```uci
# Allow Server VLAN <-> Mesh
config forwarding
    option src 'server_zone'
    option dest 'mesh_zone'
config forwarding
    option src 'mesh_zone'
    option dest 'server_zone'

# Allow outbound WAN for both; Guest has NO forwarding entry to mesh_zone
config forwarding
    option src 'server_zone'
    option dest 'wan'
config forwarding
    option src 'guest_zone'
    option dest 'wan'
```

### Platform 3: MikroTik RouterOS v7

1. **VLANs & WireGuard:** Create `/interface/bridge/vlan` for IDs 20 and 50, enable `vlan-filtering=yes`, configure `/interface wireguard` (`mtu=1420`), and add peers with `allowed-address=10.10.0.0/16`.

2. **Selective Forward Filter:**

```routeros
/ip firewall filter
add chain=forward connection-state=established,related action=accept
# Permit Server VLAN to WireGuard
add chain=forward in-interface=vlan20_servers out-interface=wg-mesh action=accept
add chain=forward in-interface=wg-mesh out-interface=vlan20_servers action=accept
# Permit Internet access via WAN (ether1)
add chain=forward in-interface=vlan20_servers out-interface=ether1 action=accept
add chain=forward in-interface=vlan50_guest out-interface=ether1 action=accept
# Default Drop: Blocks Guest to WireGuard and cross-VLAN leaks
add chain=forward action=drop
```

### Platform 4: OPNsense / FreeBSD (pf)

- **VLANs:** Assign `OPT1` to `vlan20` (`10.20.20.1/24`, labeled SERVERS) and `OPT2` to `vlan50` (`192.168.50.1/24`, labeled GUEST).
- **WireGuard:** Create `wg0` (MTU 1420) with peer AllowedIPs = `10.10.0.0/16`.
- **Firewall Rules (pf):**
  - **On SERVERS tab:** Pass | Protocol: Any | Source: SERVERS net | Destination: 10.10.0.0/16 (Mesh Subnet).
  - **On GUEST tab:** 
    - Block | Protocol: Any | Source: GUEST net | Destination: WireGuard net (or internal RFC 1918 Alias).
    - Pass | Protocol: Any | Source: GUEST net | Destination: any (Outbound Internet only).

<h2 id="nat-and-schemas">Network Address Translation, Hairpinning, and Non-Overlapping IP Schemas</h2>

### Why MASQUERADE on WireGuard Breaks Networks

Enabling MASQUERADE (Source NAT) on `wg0` rewrites all outbound client IPs to the router’s tunnel IP (`10.100.0.2`). This causes three major failures:

- **Destroys Granular Access Control:** Target servers see all traffic coming from the branch router rather than the individual workstation, making per-host firewall rules impossible.
- **Breaks Audit Compliance:** Compliance standards (SOC 2, ISO 27001, HIPAA, PCI-DSS) require real client IP attribution in server logs; NAT destroys this evidence.
- **Kills Bidirectional Flows:** Remote servers cannot initiate connections back to internal branch devices behind the NAT gateway.

**The Golden Rule:** Never apply NAT or Masquerade to inter-branch WireGuard interfaces. Use pure end-to-end Layer 3 routing.

### Non-Overlapping IP Schema (10.&lt;Site_ID&gt;.&lt;VLAN_ID&gt;.0/24)

WireGuard’s Cryptokey Routing requires every IP prefix to map to exactly one peer public key. Overlapping subnets cause silent route drops.

Standardize across branches using a structured template:

- Format: `10.<Site_ID>.<VLAN_ID>.0/24`
- Sites: HQ = Site 1, Mumbai = Site 2, Pune = Site 3, AWS = Site 10
- VLANs: Management = 10, Production DB = 20, Workstations = 30, Guest = 50
- Example: `10.2.30.88` is immediately identifiable as a workstation in Branch Mumbai.

### The Fix for Overlapping Subnets: Stateless 1:1 NETMAP

If a remote site cannot renumber its conflicting `192.168.1.0/24` subnet, use 1:1 Stateless NETMAP on the gateway router to map it to an unused virtual prefix before entering `wg0`:

```nft
# nftables: Map local 192.168.1.0/24 <-> Virtual 10.200.1.0/24
table ip nat {
    chain postrouting {
        type nat hook postrouting priority srcnat;
        oifname "wg0" ip saddr 192.168.1.0/24 snat to 10.200.1.0/24
    }
    chain prerouting {
        type nat hook prerouting priority dstnat;
        iifname "wg0" ip daddr 10.200.1.0/24 dnat to 192.168.1.0/24
    }
}
```

Remote sites address `10.200.1.x`, completely avoiding IP collisions with their own local networks while preserving deterministic 1-to-1 IP mapping.

<h2 id="mtu-and-mss-clamping">MTU, MSS Clamping, and Fragmentation Deep Dive</h2>

### Why Connections Hang (The MTU Blackhole)

When MTU is misconfigured, small packets (ICMP ping, DNS, initial SSH logins) pass cleanly, but HTTPS web apps and database queries freeze during TLS handshakes.

Standard local VLAN frames use 1500-byte MTU. When encapsulated into WireGuard over IPv4:

- Inner Packet: 1500 bytes
- WireGuard Crypto Envelope: 32 bytes
- Outer UDP + IPv4 Headers: 28 bytes (8B UDP + 20B IP)
- **Total Encapsulated Size:** 1560 bytes

Because physical WAN uplinks cap frames at 1500 bytes, oversized UDP packets require fragmentation. When upstream firewalls drop fragmented UDP or block ICMP Path MTU Discovery (Type 3, Code 4), the connection silently hangs.

### The Two-Step Fix

#### 1. Set the WireGuard Interface MTU

Subtract encapsulation overhead from the 1500-byte WAN link:
- Standard IPv4: Set MTU to 1420 (1500 - 60).
- PPPoE or IPv6 WAN: Set MTU to 1412 or 1400.

In `/etc/wireguard/wg0.conf`:

```ini
[Interface]
MTU = 1420
```

#### 2. Enforce Gateway TCP MSS Clamping

Local VLAN workstations still attempt to send 1500-byte frames. The gateway router must intercept the initial TCP SYN handshake and clamp the Maximum Segment Size (MSS): `MSS = MTU - 40 bytes (IP + TCP headers) = 1420 - 40 = 1380 bytes`

Linux (nftables):

```nft
oifname "wg0" tcp flags syn tcp option maxseg size set 1380
iifname "wg0" tcp flags syn tcp option maxseg size set 1380
```

Linux (iptables):

```bash
iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -o wg0 -j TCPMSS --clamp-mss-to-pmtu
```

MikroTik RouterOS:

```routeros
/ip firewall mangle add chain=forward action=change-mss new-mss=clamp-to-pmtu protocol=tcp tcp-flags=syn out-interface=wg-mesh
```

Result: Endpoints automatically negotiate payload sizes under 1380 bytes during the TCP 3-way handshake, eliminating fragmentation and web application timeouts.

<h2 id="security-hardening">Security Hardening: Preventing Lateral Movement Across VLANs via the Mesh</h2>

When you interconnect multiple branches, your network perimeter is only as secure as the weakest branch. If an employee at a satellite branch connects a compromised personal laptop to the local network, how do you prevent that malware from traversing the WireGuard mesh into your primary data center VLAN?

You implement a Three-Tier Defense Architecture.

### Tier 1: Ingress Reverse Path Filtering (`rp_filter = 1`)

IP spoofing is a common attack vector where a compromised machine on one VLAN generates packets with a forged source IP belonging to another VLAN.

Linux includes a kernel-level anti-spoofing mechanism called Strict Reverse Path Filtering: When a packet arrives on an interface (e.g., `eth0.50` or `wg0`), the kernel checks its routing table to see if it would route a response back through that exact same interface. If the return path points out a different interface, the packet is a forged spoof and the kernel drops it immediately.

Enforce this across all gateway interfaces in `/etc/sysctl.d/60-security-rpfilter.conf`:

```ini
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.wg0.rp_filter = 1
net.ipv4.conf.eth0/20.rp_filter = 1
net.ipv4.conf.eth0/50.rp_filter = 1
```

### Tier 2: Stateful Layer 4 Connection Tracking

Never allow arbitrary new connections from branch offices into critical production subnets. Apply the Principle of Least Privilege:

- Branch workstations can initiate outbound TCP connections to the Core Database on port 5432 (PostgreSQL) or port 443 (Web App).
- The Core Database cannot initiate new connections back into branch workstations. It can only transmit packets belonging to established, related connections.

In nftables:

```nft
# Allow established sessions, drop unsolicited inbound from mesh to DB
chain forward {
    # Accept return traffic for existing flows
    ct state established,related accept
    # Allow Workstation VLAN to initiate PostgreSQL to HQ DB
    iifname "eth0.30" oifname "wg0" ip daddr 10.1.20.50 tcp dport 5432 ct state new accept
    # Drop all other connection attempts
    iifname "wg0" oifname "eth0.20" ct state new drop
}
```

### Tier 3: Zero-Trust Host Segmentation at the Endpoint

Do not rely solely on router firewalls. On critical servers residing on production VLANs (e.g., Ubuntu database servers), configure local `ufw` or `nftables` instances that explicitly whitelist only permitted WireGuard IP ranges:

```bash
# On the production DB server (10.1.20.50)
ufw default deny incoming
ufw default allow outgoing
# Permit only the authorized branch workstation subnet
ufw allow from 10.2.30.0/24 to any port 5432 proto tcp comment "Allow Mumbai Workstations"
ufw enable
```

Even if an accidental misconfiguration occurs on the edge router, the database server itself rejects unauthorized packets.

<h2 id="operating-at-scale">Operating at Scale: Why Hand-Rolled VLAN Meshes Break Down Past 3 Sites</h2>

Configuring two or three routers by hand is straightforward. Managing this configuration across five, ten, or thirty branch offices in production is an operational bottleneck.

### The Route Propagation Overhead

In a full-mesh topology of N sites, every site must maintain a direct cryptographic peering with every other site. The number of unique tunnel pairs scales quadratically according to the formula: `Tunnel Pairs = N * (N - 1) / 2`.

- **3 sites:** 3 tunnel pairs (Manageable)
- **5 sites:** 10 tunnel pairs
- **10 sites:** 45 tunnel pairs
- **20 sites:** 190 tunnel pairs

Now, factor in selective VLAN segmentation. Each peer configuration requires an explicitly managed list of `AllowedIPs` and custom firewall rules.

When you open a new regional branch (Site 11) with three internal VLANs:
- You must generate a keypair for Site 11.
- You must log into all 10 existing branch routers.
- On every single router, you must manually edit `/etc/wireguard/wg0.conf`, insert a new `[Peer]` block for Site 11, update the local routing table, ensure the new CIDRs do not collide with existing `AllowedIPs`, and reload the WireGuard interface without dropping active production traffic.
- If an engineer makes a typo in one CIDR (e.g., typing `10.11.20.0/23` instead of `/24`), WireGuard will refuse to bind that subnet on other peers, causing silent routing blackholes that can take hours of troubleshooting to isolate.

### The Dynamic IP and CGNAT Challenge

In production environments—especially across retail branches, healthcare clinics, and international sites—branches rarely have dedicated static public IP addresses. They run on consumer or business broadband connections sitting behind Carrier-Grade NAT (CGNAT).

- Neither branch has an inbound public IP.
- The external port mapping assigned by the ISP rotates every few hours.

A hand-rolled WireGuard configuration requires at least one side of every tunnel pair to have a reachable, static public IP address and an open UDP listening port.

When both branches sit behind CGNAT, hand-rolled WireGuard cannot establish a direct connection. You are forced to spin up an intermediate Linux VPS on AWS or DigitalOcean, configure it as a centralized relay hub, manually manage forwarding rules, and monitor hub bandwidth limits.

<h2 id="comprehensive-comparison">Comprehensive Comparison: DIY Manual VLAN Routing vs. Traditional SD-WAN vs. MeshWG</h2>

Before committing engineering resources, compare the three primary approaches to multi-network site interconnection:

<div class="comparison-table-wrapper" style="overflow-x:auto;">
<table class="comparison-table">
  <thead>
    <tr>
      <th>Evaluation Criteria</th>
      <th>Hand-Rolled DIY WireGuard</th>
      <th>Legacy Hardware SD-WAN (Cisco / Fortinet / Meraki)</th>
      <th>MeshWG Cloud-Orchestrated Mesh</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Capital Expense (CapEx)</strong></td>
      <td>₹0 (Runs on existing hardware)</td>
      <td><strong>Extremely High:</strong> ₹15 Lakhs – ₹40 Lakhs in proprietary appliances</td>
      <td>₹0: Uses routers, servers, and VMs you already own</td>
    </tr>
    <tr>
      <td><strong>Recurring Licensing Cost</strong></td>
      <td>₹0 software, but high engineer-hour cost</td>
      <td><strong>High:</strong> ₹15,000 – ₹45,000 per branch per month</td>
      <td><strong>Low:</strong> ₹349 per machine / month (First 2 machines completely free)</td>
    </tr>
    <tr>
      <td><strong>Setup Time per Site</strong></td>
      <td>2–4 hours of manual CLI scripting</td>
      <td>Days to weeks (Hardware shipping, licensing, provisioning)</td>
      <td><strong>Under 2 minutes</strong> via copy-paste config script</td>
    </tr>
    <tr>
      <td><strong>VLAN Integration Method</strong></td>
      <td>Manual 802.1Q sub-interfaces + raw iptables/nftables</td>
      <td>Complex proprietary GUI zone matrices</td>
      <td>Standard 802.1Q router interfaces with centralized policy mapping</td>
    </tr>
    <tr>
      <td><strong>CGNAT &amp; Dynamic IP Handling</strong></td>
      <td>Brittle: Requires static IP or self-hosted relay VPS</td>
      <td>Proprietary cloud broker appliance required</td>
      <td><strong>Native:</strong> Automatic NAT traversal &amp; coordination plane</td>
    </tr>
    <tr>
      <td><strong>Scaling Complexity (N &gt; 5)</strong></td>
      <td>Exponential (Quadratic manual config updates)</td>
      <td>Centralized, but locked into vendor ecosystem</td>
      <td><strong>Linear (Constant effort):</strong> New branches join mesh instantly</td>
    </tr>
    <tr>
      <td><strong>Data Plane Privacy</strong></td>
      <td>High: Tunnels are private to your servers</td>
      <td>Questionable: Vendor cloud often inspects or decrypts payloads</td>
      <td><strong>Zero-Trust:</strong> Payload encryption stays end-to-end; control plane never sees packets</td>
    </tr>
  </tbody>
</table>
</div>

<h2 id="hand-roll-vs-managed">When to Hand-Roll vs. When to Use a Managed Control Plane (MeshWG)</h2>

This is an architectural calculation based on fleet size, staffing, and compliance constraints.

### When Hand-Rolling DIY Configurations Makes Sense

Hand-rolling your WireGuard VLAN routing via raw configuration files and local nftables scripts is the right engineering choice if:

- **You have 2 or 3 static sites:** You are connecting one HQ and two branches, all three have dedicated static public IPs, and you do not anticipate adding new locations in the next 12 months.
- **You have a dedicated in-house network engineer:** Your team has an engineer who is proficient in Linux routing, `iproute2`, and packet filtering, and whose regular job responsibilities include maintaining config backups and manual key rotations.
- **Air-Gapped or Sovereign Compliance:** You operate in an air-gapped government, military, or critical infrastructure facility where zero external internet connections—even out-of-band TLS control channels—are permitted by policy.

### When a Managed Control Plane Like MeshWG Earns Its Keep

A managed coordination plane like MeshWG becomes essential the moment your architecture outgrows a home lab:

- **Branches Behind CGNAT or Dynamic Broadband:** Your branch offices use standard fiber or 5G broadband connections where public IPs rotate and inbound ports are blocked by carriers. MeshWG's coordination layer automatically orchestrates persistent keepalives and reflexive NAT hole-punching.
- **Growing Beyond 3 Sites:** Adding a new site takes 60 seconds: you generate a configuration on MeshWG, paste it into your existing OpenWrt, MikroTik, Ubiquiti, or Linux router, and the control plane automatically synchronizes the new peer and its authorized VLAN CIDRs across the entire fleet.
- **Rapid Revocation and Zero-Trust Governance:** If a branch router is stolen or decommissioned, revoking its cryptographic key on MeshWG instantly updates every other node in the mesh within seconds. There is no need to manually SSH into twenty remote routers to purge public keys.
- **Agentless Network Preservation:** MeshWG runs on top of the native WireGuard implementation already inside your routers. You do not install proprietary vendor agents or replace perfectly good hardware.

<h2 id="troubleshooting">Troubleshooting Common VLAN-over-WireGuard Failures</h2>

When a multi-VLAN mesh deployment fails, it almost always boils down to one of four specific configuration errors. Use this checklist to diagnose and resolve issues quickly.

**Issue 1: "The router can ping the remote VLAN, but workstations on the local VLAN cannot"**
- **Root Cause:** Missing return route or missing local forward chain permission.
- **Diagnostic Step:** Run `tcpdump -ni wg0 icmp` on the destination gateway while pinging from a local workstation.
- **Fix:**
  - Check if the remote router knows how to reach the workstation's subnet. The remote router's `AllowedIPs` for your site must include your workstation's VLAN CIDR.
  - Verify that IP forwarding is enabled on both routers (`sysctl net.ipv4.ip_forward` must return 1).
  - Ensure your local firewall forward chain accepts traffic from `iifname eth0.VLAN` to `oifname wg0`.

**Issue 2: "SSH connects, but web apps hang during large page loads"**
- **Root Cause:** Path MTU Blackhole / Missing TCP MSS Clamping.
- **Diagnostic Step:** Run `ping -M do -s 1400 <remote_vlan_ip>`. If the ping fails with `Frag needed and DF set`, packets are exceeding the tunnel MTU.
- **Fix:** Add the TCP MSS clamping rule to your router's firewall: `iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu`.

**Issue 3: "Adding a second branch breaks routing to the first branch"**
- **Root Cause:** AllowedIPs Subnet Collision.
- **Diagnostic Step:** Inspect `wg show wg0`. Look at the `allowed ips` listed under each peer.
- **Explanation:** WireGuard strictly forbids duplicate subnets across peers on the same interface. If you accidentally configured `AllowedIPs = 10.0.0.0/16` on Peer A and `AllowedIPs = 10.0.0.0/16` on Peer B, WireGuard will assign that subnet to whichever peer was registered last, completely severing connectivity to the first peer.
- **Fix:** Ensure all advertised VLAN CIDRs are strictly disjoint, or split peers across separate WireGuard interfaces (e.g., `wg0`, `wg1`).

**Issue 4: "Packets leave the router, but no reply ever returns across CGNAT"**
- **Root Cause:** Expired NAT State Table Mapping.
- **Diagnostic Step:** Observe `wg show wg0`. Check latest handshake. If the handshake timestamp is older than 2 minutes and transfer counters show bytes sent but zero bytes received, the ISP's stateful firewall has dropped the UDP mapping.
- **Fix:** Add `PersistentKeepalive = 25` to the `[Peer]` block of any router sitting behind CGNAT or dynamic broadband.

<h2 id="conclusion">Conclusion & Strategic Architectural Next Steps</h2>

Connecting distributed branch networks securely does not require compromising on segmentation, nor does it require locking your enterprise into proprietary, six-figure hardware SD-WAN ecosystems.

By grounding your multi-site architecture in Layer 3 WireGuard routing with local 802.1Q VLAN termination, your organization achieves four decisive engineering advantages:

- **Zero Broadcast Contamination:** By rejecting Layer 2 WAN bridges, broadcast loops and ARP storms remain strictly confined to the local switch, preserving WAN stability.
- **Defensive Cryptographic Isolation:** WireGuard's `AllowedIPs` acts as an unbypassable, kernel-enforced packet filter that guarantees untrusted VLANs (such as Guest Wi-Fi or IoT sensors) cannot physically route packets across the corporate mesh.
- **Line-Rate Kernel Performance:** ChaCha20-Poly1305 encryption running directly in kernel space delivers maximum throughput with minimal CPU utilization, outperforming legacy IPsec and OpenVPN daemons on commodity hardware.
- **Hardware Independence:** Your network operates on the equipment you already own—MikroTik, OpenWrt, OPNsense, Ubiquiti, or Linux servers—free from artificial appliance lock-in.

### Strategic Implementation Checklist for Teams

- [ ] Audit all physical sites and map every local 802.1Q VLAN into an algorithmic, non-overlapping subnet template (such as `10.SiteID.VlanID.0/24`).
- [ ] Disable inter-VLAN routing on local switches; designate the local edge router as the default gateway for each tagged sub-interface.
- [ ] Establish strict firewall forward chains that permit only business-critical VLANs to forward traffic into the WireGuard interface (`wg0`).
- [ ] Calculate the correct tunnel MTU (1420 bytes for standard IPv4 uplinks) and enforce TCP MSS clamping to 1380 bytes to eliminate Path MTU blackholes.
- [ ] For networks with more than three locations or branches operating behind dynamic broadband and CGNAT, deploy an out-of-band coordination control plane like MeshWG to automate `AllowedIPs` distribution and key lifecycle management.

<h2 id="references">References & Primary Standards</h2>

For network architects and engineers reviewing the technical specifications cited in this guide, consult the following authoritative primary sources:

- **IEEE 802.1Q Standard:** IEEE Standard for Local and Metropolitan Area Networks—Bridges and Bridged Networks (Virtual Bridged Local Area Networks, 802.1Q Tagged Frames).
- **RFC 8439:** ChaCha20 and Poly1305 for IETF Protocols (Nir, Y., & Langley, A., June 2018). Describes the high-speed cryptographic cipher suite utilized in WireGuard transport datagrams.
- **RFC 7748:** Elliptic Curves for Security (Langley, A., Hamburg, M., & Turner, S., January 2016). Defines Curve25519 for Diffie-Hellman key exchanges in the Noise_IK handshake.
- **WireGuard Protocol Specification:** Donenfeld, Jason A. "WireGuard: Next Generation Kernel Network Tunnel." NDSS Symposium 2017. Explains Cryptokey Routing and state machine design.
- **The Noise Protocol Framework:** Perrin, Trevor. The Noise Protocol Framework Specification (Revision 34). Technical foundation for the WireGuard authenticated key exchange.
- **Linux Kernel Documentation:** Linux Networking - IP Sysctl Parameters (`rp_filter`, `ip_forward`) and `systemd.network` — Network configuration.
- **RFC 1918:** Address Allocation for Private Internets (Rekhter, Y., et al., February 1996).
- **RFC 2993:** Architectural Implications of NAT (Hain, T., November 2000).

## Frequently Asked Questions

<details class="mesh-faq">
<summary>Q1. Can WireGuard carry 802.1Q VLAN tags directly over the tunnel interface?</summary>
No. WireGuard is fundamentally a Layer 3 (`tun`) network tunnel. It operates strictly on raw IPv4 and IPv6 datagrams and has no awareness of Layer 2 Ethernet frames, MAC addresses, or 802.1Q tags. To connect VLANs, you terminate the 802.1Q tags on the router's physical trunk interface, and route the individual IP subnets through WireGuard using standard Layer 3 routing and `AllowedIPs` entries.
</details>

<details class="mesh-faq">
<summary>Q2. How do I isolate a local Guest or IoT VLAN from reaching our WireGuard mesh?</summary>
Isolation requires two complementary controls: First, in your router's firewall (using nftables, iptables, or OpenWrt zones), create an explicit rule that drops all forwarding between the Guest VLAN interface (e.g., `eth0.50`) and the WireGuard interface (`wg0`). Second, in the WireGuard peer configurations on other routers, never include the Guest VLAN's CIDR in `AllowedIPs`. WireGuard's Cryptokey Routing will automatically discard any packet originating from an undeclared subnet.
</details>

<details class="mesh-faq">
<summary>Q3. Why is bridging Layer 2 across WAN links considered an anti-pattern?</summary>
Layer 2 bridging (such as running VXLAN or GRETAP over WireGuard) forces all broadcast, multicast, and unknown unicast (BUM) traffic across your internet connection. ARP requests, mDNS discovery packets, and DHCP broadcasts consume valuable WAN bandwidth. Furthermore, a switching loop or broadcast storm occurring at one physical site will instantly propagate across the tunnel and knock down all interconnected branches.
</details>

<details class="mesh-faq">
<summary>Q4. What MTU should I configure for VLANs routing over WireGuard?</summary>
For standard internet uplinks with a physical MTU of 1500 bytes, configure your WireGuard interface MTU to 1420 bytes (or 1412 bytes for PPPoE connections). This accounts for the 32-byte WireGuard cryptographic envelope and 28-byte outer IP/UDP transport header. In addition, always enable TCP MSS clamping on your gateway router to limit TCP SYN packets to 1380 bytes, eliminating fragmentation and web application timeouts.
</details>

<details class="mesh-faq">
<summary>Q5. How do I connect two offices that have overlapping VLAN subnets (e.g., both use 192.168.1.0/24)?</summary>
WireGuard cannot route between identical subnets on the same interface due to Cryptokey Routing constraints. The best long-term solution is renumbering one site into an organized non-overlapping scheme (such as `10.SiteID.VlanID.0/24`). If renumbering is impossible, you must implement 1:1 Stateless Network Address Translation (NETMAP in nftables/iptables) at the gateway router to translate the local `192.168.1.0/24` subnet into a virtual `10.200.x.0/24` prefix before traffic enters the WireGuard tunnel.
</details>

<details class="mesh-faq">
<summary>Q6. Does selective VLAN routing require installing client software on every workstation?</summary>
No. The router-to-router mesh architecture is completely agentless for end-user devices. The edge router acts as the site-to-site gateway. Workstations, printers, medical devices, and servers connect normally to their physical switch ports and use their local default gateway without any software installed. The gateway router handles encryption, encapsulation, and access control transparently.
</details>

<details class="mesh-faq">
<summary>Q7. Can I use WireGuard to connect a cloud VPC subnet directly to an on-premise VLAN?</summary>
Yes. You can launch a lightweight virtual machine or container in your cloud VPC (AWS, GCP, Azure, or Hetzner) running WireGuard, declare the on-premise VLAN CIDR in its `AllowedIPs`, and update the VPC route table to point that CIDR to your WireGuard instance. Traffic between your on-premise server VLAN and cloud instances flows seamlessly over the encrypted overlay.
</details>

<details class="mesh-faq">
<summary>Q8. How does MeshWG automate selective VLAN connectivity across multiple branches?</summary>
MeshWG acts as an out-of-band coordination control plane. It runs directly on the routers you already own (MikroTik, OpenWrt, Ubiquiti, OPNsense, Linux). Through a central dashboard, you specify which local subnets should be visible across the mesh. MeshWG automatically generates cryptographic keys, provisions non-overlapping `AllowedIPs` routing tables, coordinates UDP hole punching across CGNAT broadband lines, and pushes atomic configuration updates to your fleet without touching your actual data packets.
</details>

<aside class="cta-strip">
<details class="mesh-faq">
  <summary>Ready to build your VLAN mesh?</summary>

  <p>MeshWG gives you a hosted control plane to orchestrate your WireGuard nodes across all your VLANs, so you don't have to manage keys, AllowedIPs, and endpoints by hand.</p>
</details>

<div class="cta-row">
<a class="btn btn-primary btn-lg" href="https://vpn.meshwg.com/signup">Start free → 2 routers</a>
<a class="btn btn-line btn-lg" href="/quickstart/">Read the Quickstart</a>
</div>