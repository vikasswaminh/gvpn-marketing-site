---
title: "Site-to-Site WireGuard Setup Guide: Manual vs Automated"
description: "A step-by-step tutorial on connecting two physical locations using raw WireGuard configuration, and how to automate the process using a managed mesh."
pubDate: 2026-09-16
updatedDate: 2026-09-16
author: "MeshWG Engineering"
tags: ["engineering guide", "wireguard", "site-to-site", "tutorial"]
seoKeywords: ["WireGuard site-to-site", "manual WireGuard setup", "MeshWG automation"]
cover: "../../assets/images/wireguard_site_to_site.png"
---

Setting up a site-to-site VPN allows two physical locations (like a main office and a branch) to share a single secure network. WireGuard is an excellent Layer 3 protocol for this because of its high performance and minimal configuration footprint.

In this guide, we will walk through the exact steps to configure a manual site-to-site WireGuard tunnel between two Linux routers, and then look at how a managed solution like MeshWG automates this same architecture.

## Part 1: The Manual WireGuard Setup

We will connect Site A (10.0.1.0/24) to Site B (10.0.2.0/24) using a WireGuard tunnel subnet of 10.100.0.0/24. 

### Step 1: Install WireGuard

On both the Site A router and the Site B router, install the WireGuard tools. On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install wireguard
```

### Step 2: Generate Keys

WireGuard uses public-key cryptography. You need to generate a private and public key pair for each site. Run this on both routers:

```bash
wg genkey | tee privatekey | wg pubkey > publickey
```

### Step 3: Configure Site A (The "Server")

Create a configuration file at `/etc/wireguard/wg0.conf` on Site A. You will need Site B's public key for the `[Peer]` section.

```ini
[Interface]
# Site A's Private Key
PrivateKey = <PLACEHOLDER_SITE_A_PRIVATE_KEY>
# Tunnel IP for Site A
Address = 10.100.0.1/24
ListenPort = 51820

[Peer]
# Site B's Public Key
PublicKey = <PLACEHOLDER_SITE_B_PUBLIC_KEY>
# Route traffic for Site B's LAN and Site B's tunnel IP
AllowedIPs = 10.0.2.0/24, 10.100.0.2/32
```

### Step 4: Configure Site B (The "Client")

Create a configuration file at `/etc/wireguard/wg0.conf` on Site B. You will need Site A's public key and its public internet IP address.

```ini
[Interface]
# Site B's Private Key
PrivateKey = <PLACEHOLDER_SITE_B_PRIVATE_KEY>
# Tunnel IP for Site B
Address = 10.100.0.2/24

[Peer]
# Site A's Public Key
PublicKey = <PLACEHOLDER_SITE_A_PUBLIC_KEY>
# The public IP of Site A's router (Placeholder IP)
Endpoint = 198.51.100.1:51820
# Route traffic for Site A's LAN and Site A's tunnel IP
AllowedIPs = 10.0.1.0/24, 10.100.0.1/32
# Keep the NAT state alive
PersistentKeepalive = 25
```

### Step 5: Configure Firewall and Routing

For the routers to pass traffic from their local LANs into the WireGuard tunnel, you must enable IP forwarding on both routers:

```bash
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.d/99-wireguard.conf
sudo sysctl -p /etc/sysctl.d/99-wireguard.conf
```

You must also allow UDP traffic on port 51820 through your firewall on the "Server" (Site A). Using `iptables` as an example:

```bash
sudo iptables -A INPUT -p udp --dport 51820 -j ACCEPT
```

*Note on NAT and Return Routes:* Because we are connecting two LANs directly, devices on Site A (`10.0.1.x`) must know that the route to Site B (`10.0.2.x`) is through the Site A router. If your WireGuard endpoint is *not* your default gateway, you will need to add static return routes on your main router pointing the `10.0.2.0/24` subnet to the WireGuard machine's IP.

Finally, bring up the interface on both sides:

```bash
sudo wg-quick up wg0
```

If configured correctly, devices on the `10.0.1.0/24` network can now ping devices on the `10.0.2.0/24` network.

---

## Part 2: The Automated Setup with MeshWG

The manual setup is straightforward for two sites. However, as you add a third, fourth, or fiftieth site, you must manually update the `wg0.conf` on *every single router* to add the new peer's public key, endpoint IP, and allowed IPs. This full-mesh key distribution becomes an operational bottleneck.

MeshWG automates this exact architecture without changing the underlying protocol. It provides a single managed hub where access rules are applied, eliminating the need for peer-to-peer key distribution.

### Step 1: Add a Machine in the Dashboard

Instead of generating keys manually, click **Add Machine** in the MeshWG dashboard. MeshWG generates a standard `wg-quick` configuration for that specific router.

### Step 2: Paste the Config into your Router

Paste the generated config into your router's WireGuard interface (MeshWG natively supports TP-Link, MikroTik, OpenWrt, OPNsense, and more).

```ini
[Interface]
PrivateKey          = <PLACEHOLDER_SHOWN_ONCE_AT_MACHINE_CREATION>
Address             = 10.100.0.2/16
MTU                 = 1420

[Peer]
PublicKey           = <PLACEHOLDER_YOUR_MESHWG_HUB_PUBLIC_KEY>
Endpoint            = vpn.meshwg.com:51820
AllowedIPs          = 10.100.0.0/16
PersistentKeepalive = 25
```

### Step 3: Centralized Policy

With MeshWG, all overlay traffic between your machines routes through the managed hub. You define policies in one place. If you want to deny traffic between Site A and Site B, you simply update the policy in the dashboard, and the hub enforces it instantly—no need to touch the router configs again.

## Conclusion

Manual WireGuard configuration is perfect for hobbyists or small static setups. For growing businesses connecting multiple branch offices, a router-based managed mesh like MeshWG removes the overhead of key rotation, subnet routing, and endpoint management while keeping the speed and security of the WireGuard protocol.
