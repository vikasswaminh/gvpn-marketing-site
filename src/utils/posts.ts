export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  readMinutes: number;
  category: string;
}

export const posts: PostMeta[] = [
  {
    slug: "how-wireguard-mesh-control-plane-manages-keys-peers-routes",
    title: "How WireGuard Mesh Control Planes Manage Keys, Peers & Routes",
    description: "A deep technical dive into how modern WireGuard mesh VPN control planes orchestrate public keys, peer discovery across CGNAT, and dynamic AllowedIPs routing tables at scale.",
    datePublished: "Sep 7, 2026",
    readMinutes: 24,
    category: "STRATEGY & ARCHITECTURE",
  },
  {
    slug: "wireguard-mesh-vpn-without-agent-existing-routers",
    title: "Agentless WireGuard Mesh VPN on Existing Routers",
    description: "Deploy a WireGuard mesh VPN directly on existing TP-Link, MikroTik, or Ubiquiti routers without installing agents. Fast, CGNAT-native networking.",
    datePublished: "Sep 4, 2026",
    readMinutes: 28,
    category: "ENGINEERING GUIDE",
  },
  {
    slug: "how-to-set-up-a-wireguard-mesh-vpn",
    title: "How to Set Up a WireGuard Mesh VPN (Full Guide)",
    description: "A comprehensive guide on setting up a WireGuard mesh VPN. Compare manual configurations vs automated cloud control planes for scalable networks.",
    datePublished: "Sep 4, 2026",
    readMinutes: 25,
    category: "ENGINEERING GUIDE",
  },
  {
    slug: "cloud-wireguard-vpn-meshwg",
    title: "Cloud WireGuard VPN: How to Connect Cloud Servers and Branch Networks with MeshWG",
    description: "Deep dive into how a cloud-managed WireGuard VPN works. Learn about control planes, peer-to-peer encryption, and zero-trust mesh architecture.",
    datePublished: "Aug 31, 2026",
    readMinutes: 30,
    category: "STRATEGY & ARCHITECTURE",
  },
  {
    slug: "how-to-build-a-multi-location-wireguard-network-with-routers",
    title: "How to Build a Multi-Location WireGuard Network with Routers: Enterprise Guide",
    description: "Master multi-location site-to-site WireGuard networks across routers. Covers kernel routing, NAT traversal, MTU tuning, firewall rules, and MeshWG mesh orchestration.",
    datePublished: "Aug 27, 2026",
    readMinutes: 30,
    category: "STRATEGY & ARCHITECTURE",
  },
  {
    slug: "how-to-set-up-a-router-vpn-without-installing-vpn-software",
    title: "How to Set Up a Router VPN Without Installing VPN Software (2026 MeshWG Guide)",
    description: "Master setting up a native router VPN gateway without installing software on client devices. Step-by-step OpenWrt, WireGuard, and MeshWG deployment guide.",
    datePublished: "Aug 25, 2026",
    readMinutes: 28,
    category: "ENGINEERING GUIDE",
  },
  {
    slug: "managed-vs-self-hosted-wireguard-vpn-2026",
    title: "Managed vs Self-Hosted WireGuard VPN: Enterprise Mesh Network Architecture Guide (2026)",
    description: "Comprehensive architectural comparison of self-hosted (Headscale, Netmaker, NetBird) versus managed WireGuard platforms (Tailscale, NetBird Cloud).",
    datePublished: "Aug 24, 2026",
    readMinutes: 23,
    category: "STRATEGY & ARCHITECTURE",
  },
  {
    slug: "wireguard-site-to-site-vpn-multiple-locations",
    title: "WireGuard Site-to-Site VPN: Multi-Location Setup Guide (2026)",
    description: "Learn how to connect multiple locations using WireGuard site-to-site VPN. Step-by-step setup for Linux, MikroTik, OpenWrt, Ubiquiti, MTU tuning and MeshWG.",
    datePublished: "Aug 24, 2026",
    readMinutes: 30,
    category: "ENGINEERING GUIDE",
  },
  {
    slug: "wireguard-nat-traversal-behind-cgnat-2026",
    title: "WireGuard NAT Traversal: Connecting Peers Behind CGNAT & Firewalls (2026)",
    description: "Complete 2026 engineering guide to WireGuard NAT Traversal. Learn UDP hole punching, PersistentKeepalive, CGNAT workarounds, STUN/ICE mechanics, and enterprise relay strategies.",
    datePublished: "Aug 21, 2026",
    readMinutes: 26,
    category: "STRATEGY & ARCHITECTURE",
  },
  {
    slug: "manage-multiple-wireguard-tunnels-mesh-vpn-2026",
    title: "Managing Multiple WireGuard Tunnels & Mesh VPN Guide (2026)",
    description: "Master WireGuard mesh networking and multi-tunnel management in 2026. Learn architecture, full-mesh topologies, automated configs, BGP routing, and scaling strategies.",
    datePublished: "Aug 20, 2026",
    readMinutes: 26,
    category: "STRATEGY & ARCHITECTURE",
  },
  {
    slug: "mesh-vpn-vs-ipsec-vs-sdwan-2026",
    title: "Mesh VPN vs IPsec vs SD-WAN: Which is Best in 2026?",
    description: "Compare Mesh VPN, IPsec, and SD-WAN architectures. Find out which network solution offers the best performance and cost for multi-site businesses.",
    datePublished: "May 16, 2026",
    readMinutes: 24,
    category: "STRATEGY & ARCHITECTURE",
  },
  {
    slug: "tp-link-site-to-site-vpn-wireguard-2026",
    title: "TP-Link WireGuard Site-to-Site VPN Setup Guide",
    description: "Step-by-step guide to configuring a WireGuard site-to-site VPN on TP-Link routers. Bypass static IPs and complex IPsec configurations easily.",
    datePublished: "May 16, 2026",
    readMinutes: 12,
    category: "ENGINEERING GUIDE",
  },
  {
    slug: "branch-office-vpn-smb-rollout-playbook-2026",
    title: "Branch Office VPN Guide for SMBs (2026)",
    description: "A 2026 rollout playbook for setting up a branch office VPN. Compare legacy hardware to modern WireGuard networks for SMB multi-site connectivity.",
    datePublished: "May 16, 2026",
    readMinutes: 23,
    category: "STRATEGY & ARCHITECTURE",
  },
  {
    slug: "sd-wan-alternatives-2026",
    title: "7 Modern SD-WAN Alternatives for Branch Offices (2026)",
    description: "Looking beyond traditional SD-WAN? Discover 7 cost-effective SD-WAN alternatives for SMB branch connectivity and network management.",
    datePublished: "May 16, 2026",
    readMinutes: 19,
    category: "STRATEGY & ARCHITECTURE",
  },
  {
    slug: "wireguard-site-to-site-vpn-how-it-works-2026",
    title: "How WireGuard Site-to-Site VPN Works (2026 Protocol Guide)",
    description: "Understand the mechanics of WireGuard site-to-site VPNs. Learn how multi-site meshes, CGNAT handling, and control planes operate under the hood.",
    datePublished: "May 16, 2026",
    readMinutes: 23,
    category: "STRATEGY & ARCHITECTURE",
  },
];

// Strategy & Architecture sidebar — matches live site exactly
export const strategyPosts = [
  posts.find(p => p.slug === "how-wireguard-mesh-control-plane-manages-keys-peers-routes"),
  posts.find(p => p.slug === "cloud-wireguard-vpn-meshwg"),
  posts.find(p => p.slug === "how-to-build-a-multi-location-wireguard-network-with-routers"),
  posts.find(p => p.slug === "managed-vs-self-hosted-wireguard-vpn-2026"),
  posts.find(p => p.slug === "wireguard-nat-traversal-behind-cgnat-2026"),
  posts.find(p => p.slug === "manage-multiple-wireguard-tunnels-mesh-vpn-2026"),
  posts.find(p => p.slug === "branch-office-vpn-smb-rollout-playbook-2026"),
  posts.find(p => p.slug === "mesh-vpn-vs-ipsec-vs-sdwan-2026"),
  posts.find(p => p.slug === "sd-wan-alternatives-2026"),
  posts.find(p => p.slug === "wireguard-site-to-site-vpn-how-it-works-2026"),
].filter(Boolean) as PostMeta[];

// Engineering Guides sidebar — matches live site exactly
export const engineeringPosts = [
  posts.find(p => p.slug === "how-to-set-up-a-wireguard-mesh-vpn"),
  posts.find(p => p.slug === "wireguard-mesh-vpn-without-agent-existing-routers"),
  posts.find(p => p.slug === "how-to-set-up-a-router-vpn-without-installing-vpn-software"),
  posts.find(p => p.slug === "wireguard-site-to-site-vpn-multiple-locations"),
  posts.find(p => p.slug === "tp-link-site-to-site-vpn-wireguard-2026"),
].filter(Boolean) as PostMeta[];
