---
layout: post
title:  "Mikrotik Router as a VPN client"
date:   2026-09-13
categories: posts
tags: [infra]
author: "atctwo"
description: An approach to running network traffic through a VPN, on the routing side
image: /assets/images/posts/mikrotik-vpn/i love you hap ac.png
thumbnail: /assets/images/posts/mikrotik-vpn/i love you hap ac.png
toc: true
enable_comments: true
enable_related: true
custom_excerpt: true
excerpt_separator: <!-- excerpt-end -->
---

<style>
    .cool-figure {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: 100%;
    }
    .cool-figure.flipper-screenshot img, video {
        width: unset;
        height: 120px;
        border: 10px solid #FE892B;
        /* border-radius: 0px; */
    }
    .cool-figure figcaption {
        font-size: 0.875em;
        color: var(--bs-secondary-color);
        text-align: center;
    }
    @media (min-width: 767px) {
        .cool-figure img:not(.smol), video {
            max-width: 70%;
        }
        .smol-container {
            width: 90%;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .smol {
            width: 45%;
        }
    }

    .code-container {
        position: relative;
    }

    @media (min-width: 767px) {
        .btn-test {
            position: absolute;
            right: 0px;
        }
    }
    .btn-test button {
        padding: 0.375rem;
        font-size: small;
    }

    blockquote {
        padding: 10px 10px;
        border-left: 3px solid var(--bs-secondary-color);
        color: var(--bs-secondary-color);
    }
    blockquote > p {
        margin-bottom: 0px;
    }
    html[data-bs-theme="light"] .about-social-dark {
        display: none;
    }
    html[data-bs-theme="dark"] .about-social-light {
        display: none;
    }
</style>

<!-- excerpt-start --> 

With the increase in online spaces requiring digital ID verification, and other scary developments in online privacy, I've been thinking about keeping my public VPN enabled at all times.  But!  This gets a little tricky when also using a *private* VPN for remote LAN access.  Running two VPNs is doable but isn't easy, and is basically impossible on Android.

Clearly the most reasonable way to have my devices tunnelled through both is to have certain clients on the private LAN **automatically tunnelled through a VPN at the LAN router level**!

<!-- excerpt-end --> 

This approach has a lot of problems, a lot of funny edge cases, and weird hacks are required to get it working.  It may also have a not-insignificant performance overhead.  But it's been working well for me so far, and if anyone else is in a similarly strange[^1] network situation then hopefully this should work for them too!

My router is a [tiny little baby Mikrotik hAP ac](https://mikrotik.com/product/RB962UiGS-5HacT2HnT) running RouterOS 7.24[^2], which means that this approach is highly specific to Mikrotik stuff.  

Originally this post was written around [Mullvad](https://mullvad.net/), which was the VPN I used at the time.  But after it came out that one of Mullvad's cofounders [had been donating to a Swedish right-wing populist party](https://www.theregister.com/software/2026/07/21/some-mullvad-vpn-customers-tunnel-for-exit-after-co-founder-donates-millions-to-populist-party/5275012), I thought I should probably rewrite it a bit...  Since then I've tried this setup with both [IVPN](https://www.ivpn.net/en/) and [AirVPN](https://airvpn.org/), and both seem to work pretty well!

This approach is **highly** based on [this post by Simo R](https://www.netdaily.org/route-traffic-to-vpn-on-mikrotik/); in fact it's mostly exactly the same except for some extra tinkering I had to do for some network-specific cases, as well as some Mullvad-specific tips from [this post](https://littlefool.de/posts/mullvad-wireguard-with-routeros-7/) by LittleFool.

[^1]: I guess my situation is strange because I'm kinda forced to use OpenVPN for my private VPN because of certain network restrictions which are out of my control.  I'd rather use Wireguard, but I guess if I could use Wireguard I would more likely be using something like Tailscale

[^2]: Since writing this post I've upgraded to a even tinier [hEX S (2025)](https://mikrotik.com/product/hex_s_2025), pretty much entirely for the faster CPU for better WireGuard support

# What Is Happening
The gist of my network setup is that I have a LAN that I can access remotely with a **private VPN** (using OpenVPN for reasons I won't get into).  I currently have **public VPN** clients on my devices which I can toggle on and off, but it's tricky or impossible to have both the public and private VPNs running at the same time.

This post describes a setup where [external clients on the private VPN] and [internal clients directly connected to the LAN] *both* have their internet-bound traffic tunnelled through a public VPN.  This means that external clients connected to the private VPN, can access stuff on the LAN while having their internet-bound traffic tunnelled through the public VPN!

<ul class="nav nav-pills justify-content-center mb-3" id="net-diagram-tab" role="tablist">
    <li class="nav-item" role="presentation">
        <button class="nav-link active" id="net-diagram-none-tab" data-bs-toggle="pill" data-bs-target="#net-diagram-none" type="button" role="tab" aria-controls="net-diagram-none" aria-selected="true">Network layout</button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link" id="net-diagram-internal-tab" data-bs-toggle="pill" data-bs-target="#net-diagram-internal" type="button" role="tab" aria-controls="net-diagram-internal" aria-selected="false">Internal devices</button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link" id="net-diagram-external-tab" data-bs-toggle="pill" data-bs-target="#net-diagram-external" type="button" role="tab" aria-controls="net-diagram-external" aria-selected="false">External devices</button>
    </li>
</ul>

<div class="tab-content" id="net-diagram-tabContent">
<div class="tab-pane show active" id="net-diagram-none" role="tabpanel" aria-labelledby="net-diagram-none-tab" tabindex="0">
    <figure class="cool-figure">
        <img src="/assets/images/posts/mikrotik-vpn/traffic-none.svg" width="1000">
    </figure>
</div>
<div class="tab-pane" id="net-diagram-internal" role="tabpanel" aria-labelledby="net-diagram-internal-tab" tabindex="0">
    <figure class="cool-figure">
        <img src="/assets/images/posts/mikrotik-vpn/traffic-internal.svg" width="1000">
    </figure>
</div>
<div class="tab-pane" id="net-diagram-external" role="tabpanel" aria-labelledby="net-diagram-external-tab" tabindex="0">
    <figure class="cool-figure">
        <img src="/assets/images/posts/mikrotik-vpn/traffic-external.svg" width="1000">
    </figure>
</div>
</div>

The approach adopted in this post uses policy-based routing to have most traffic from devices on the LAN get routed through the public VPN tunnel (including traffic originating from private VPN clients).  

Devices which should have their traffic sent through the VPN have this routing *manually enabled* by adding their LAN IP to a list (opt-in); this is to avoid all network traffic being routed to the VPN by default since that would be kinda chaotic.

Websites (more specifically, their remote IPs) which *shouldn't* be routed through the VPN are manually added to a bypass list (opt-out).  This is so I don't have to disable the whole VPN to access sites which block VPNs; instead they can just be added to the bypass list.

With these established, let's look at how the approach was actually implemented!


# Router Config
There's a couple different steps that have to be done in a couple different places, so this post will go through them in a menu-by-menu basis.  While I did set all of this up using the WinBox GUI, I'm listing all of the config entries as viewed in the terminal since that seems to be the de facto standard for sharing Mikrotik configs.

## Setting up the VPN interface
To start off, add the VPN as an interface.  The VPNs I tested each support Wireguard, so I added a Wireguard interface called `wg1`.  RouterOS has a neat "WG Import" button to automatically add interfaces based on VPN `.conf` files uploaded to the router's flash :)  You can normally get these files from your VPN provider's website.

<figure class="cool-figure">
    <img src="/assets/images/posts/mikrotik-vpn/import-wg.png" alt="The WireGuard interface menu as shown in WinBox.  It consists of a window with two tabs: Wireguard and Peers.  In the Wireguard tab, a table listing all the Wireguard interfaces can be seen (but there's only one).  On the right is an actions pane, showing one action called WG Import">
    <figcaption>WG Import is shown in the Actions pane on the right of the menu</figcaption>
</figure>

(or in the terminal, run `interface wireguard wg-import`)

This automatically creates the Wireguard interface as well as the Wireguard peers.  However, for Mullvad and IVPN I found that the peer didn't have an endpoint address or port set; I just copied the endpoint info directly from the `.conf` file.

```conf
> interface wireguard print detail
Flags: X - DISABLED; R - RUNNING 
 0  R name="wg1" mtu=1420 listen-port=47789 public-key="[redacted]" 
```

```conf
> interface wireguard peers print detail
Flags: X - DISABLED; D - DYNAMIC 
 0    ;;; mullvad ie-dub-001
      interface=wg1 name="peer4" public-key="2r0vPpM71ZXpseWXTXw3iwn2sjIHOTpw1V9sp03bLWw=" 
      endpoint-address=146.70.189.2 endpoint-port=51820 current-endpoint-address=146.70.189.2 
      current-endpoint-port=51820 allowed-address=0.0.0.0/0,::/0 client-endpoint="" 
      client-allowed-address=::/0 rx=3568.3MiB tx=356.8MiB last-handshake=35s 
```

## Creating a routing table
The next step is to create a routing table - all the traffic destined for the public VPN will find its way on to this table.  Make sure FIB is enabled.

```conf
> routing table print detail
Flags: D - DYNAMIC; X - DISABLED, I - INVALID; U - USED 
 0     ;;; mullvad
       name="vpn" fib 
```

## Creating firewall address lists
Address lists are setup to determine what goes in and out of the VPN.  In my case, I have three lists:

- `lan` contains all the IPs of devices on the LAN (that should be accessible by other devices on the LAN)
- `vpn` contains all the IPs of devices on the LAN to get their traffic tunnelled through the VPN
- `vpn-bypass` contains all the remote IPs (on the internet) to *not* get tunnelled 

You can add either full IP addresses or CIDR notation subnets.

```conf
> ip firewall address-list print
Flags: X - DISABLED
Columns: LIST, ADDRESS, CREATION-TIME
 #   LIST        ADDRESS          CREATION-TIME   
 0   lan         192.168.0.0/24   2026-06-17 17:19:22
 1   lan         192.168.1.0/24   2026-06-17 17:19:51
;;; route everything on .0.0 to vpn
 2   vpn         192.168.0.0/24   2026-06-17 17:21:14
;;; route laptop to vpn
 3   vpn         192.168.1.10     2026-06-17 19:57:00
;;; route phone to vpn
 4   vpn         192.168.1.100    2026-06-17 19:57:00
;;; bypass vpn for google dns
 5   vpn-bypass  8.8.8.8          2026-06-17 19:59:54
;;; bypass vpn for the vpn's website
 6   vpn-bypass  1.2.3.4          2026-06-17 21:32:30
;;; bypass vpn for the vpn's connection check
 7 X vpn-bypass  5.6.7.8          2026-06-17 21:36:56
;;; bypass vpn endpoint
 8   vpn-bypass  146.70.189.2     2026-06-17 21:39:12
```

Entry 6 prevents traffic going to VPN provider's website from being sent to the tunnel.  This is so that if I forget to pay them and my VPN time runs out, I can still access their website to add more time!  But I realised that I haven't bypassed any third-party payment providers, so I'm not sure if this will actually work :P

Entry 8 bypasses traffic to the VPN's endpoint.  This means that any tunnelled device making it's own connections to the VPN won't get "double tunnelled".

## Firewall mangle rules
Now the fun part >:3

There are four firewall mangle rules which are responsible for determining which packets get routed to the tunnel and which don't.  They are explained below in the order they should be arranged in the `ip firewall mangle` menu.  Each rule is created on the `prerouting` chain.

The first three rules are "exceptions", which prevent certain traffic from being routed to the VPN tunnel by immediately `accept`ing the packet.  The last rule is the one that actually sends packets that make it through to the tunnel (well, the *routing table* for the tunnel).

```conf
> ip firewall mangle print detail
Flags: X - DISABLED, I - INVALID; D - DYNAMIC 
```

{% include admonition.html type="info" %}

<div class="no_toc_section" markdown="1">

### 1. don't tunnel bypassed IPs
to prevent sending traffic for bypassed IPs to the VPN tunnel, packets with a source address in the `vpn` list and a destination address in the `vpn-bypass` list get `accept`ed

```conf
 0    ;;; don't send bypassed IPs through the vpn
      chain=prerouting action=accept src-address-list=vpn dst-address-list=vpn-bypass log=no 
      log-prefix="" 
```
<br>

### 2. don't tunnel LAN traffic
to prevent traffic to other devices on the LAN getting tunnelled, packets with a source address in `vpn` and a destination address in `lan` get `accept`ed

```conf
 1    ;;; don't send LAN pkts through the vpn
      chain=prerouting action=accept connection-state="" src-address-list=vpn dst-address-list=lan 
      log=no log-prefix="" 
```
<br>

### 3. don't tunnel traffic for forwarded ports
this one is really only important if you have port-forwarded a device on your LAN which happens to be in the `vpn` list.  

when outbound traffic from that device gets to the router, how does it know if it's general internet-bound traffic (to be tunnelled) or if it's a response to an inbound connection (which really shouldn't be tunnelled)?  one possible way is by source port number - for example, if you have an OpenVPN server running on a `vpn` device, `accept`ing any traffic from port 1194 should bypass the public VPN tunnel and get routed directly to the inbound client.

```conf
 2    ;;; don't send openvpn traffic through the vpn
      chain=prerouting action=accept protocol=udp src-address-list=vpn 
      src-port=1194,1995 log=no log-prefix="" 
```
<br>

### 4. tunnel everything else!
any other traffic with a source address in `vpn` that has got this far (ie: hasn't been `accept`ed by the previous rules) gets sent to the VPN tunnel.  this is done by *route marking* the packet to the `vpn` routing table we made earlier.  

note that this doesn't actually send the traffic through the tunnel, it simply puts it on the `vpn` table, which will mean it gets tunnelled later.

```conf
 3    ;;; else, send all traffic (from vpn-enabled ips) through the vpn
      chain=prerouting action=mark-routing new-routing-mark=vpn passthrough=yes 
      src-address-list=vpn log=no log-prefix="" 
```
<br>

### 5. change MSS
a secret fifth rule that took me weeks to figure out!

after switching to IVPN and AirVPN i found that certain websites like GitHub would never load, unless the page was reloaded mid-loading.  (ie: only the second connection attempt would work).  it turned out that it was the TLS handshake that was failing.  this would only happen when rule 4 was enabled.

after scouring the internet for some lead on why this was happening, I found [this GitHub Gist](https://gist.github.com/N0xFF/f6ee51a3b04b5f373ac2372e943195a0) with the description "MikroTik stuck on `TLS handshake, Client hello (1)`".  the gist suggests adding a `forward` chain rule to change the MSS of TCP-SYN packets, such that values of 1381 and higher get "clamped" to 1380.  i'm not totally sure why but this worked!

```conf
4  ;;; [vpn] tls silly thingy??? https://gist.github.com/N0xFF/f6ee51a3b04b5f373ac2372e943195a0
   chain=forward action=change-mss new-mss=1380 passthrough=yes tcp-flags=syn protocol=tcp out-interface-list=vpns tcp-mss=1381-65535 log=no log-prefix=""
```

<br>

</div>

{% include admonition_end.html %}

There's a lot of complexity and variance here (in fact this is one of the main ways my ruleset differs from Simo R's).  But I've tried to explain what everything does so hopefully it makes sense!

{% include admonition.html type="warning" %}

If the device you're using to edit the config is on the `vpn` address list, make sure the last rule is only enabled when the "don't tunnel LAN traffic" rule is also enabled!  If the latter is disabled while the former is enabled, the router will try to tunnel the router-bound traffic from your device to the tunnel.  You might need to connect back to the router with an IP that you know isn't on `vpn` to reenable the rule!

{% include admonition_end.html %}

## Firewall NAT rules
If you have regular NAT rules set up on your network, you might need to set up an extra rule to make sure traffic to the VPN tunnel (on the `vpn` routing table) gets NATted too.

```conf
> ip firewall nat print detail
 0    ;;; NAT for packets beign sent through VPN
      chain=srcnat action=masquerade src-address-list=vpn routing-mark=vpn log=no log-prefix="" 

 1    ;;; regular NAT to access the internet
      chain=srcnat action=masquerade src-address=192.168.0.0/23 out-interface=ether1 log=no 
      log-prefix="" 
```

## Route to VPN
With the traffic we definitely want tunnelled having been placed in the `vpn` routing table, it's finally time to send it down the tunnel.  This is done using a pretty simple static route.

```conf
> ip route print detail
 0  As   ;;; send vpn packets to The Tunnel
         dst-address=0.0.0.0/0 routing-table=vpn gateway=10.124.0.70 immediate-gw=10.124.0.70%wg1 
         distance=1 scope=30 target-scope=10 
```

The only tricky thing here might be the `gateway` option (`immediate-gw` should be set automatically).  At least for Mullvad connections, this should be set to the gateway IP for the particular VPN server you're using.  LittleFool points out that this is generally the IP of the SOCKS5 proxy address of the server as listed on the [Mullvad Server page](https://mullvad.net/en/servers).  For the other VPN providers I've had success just setting the gateway as the `wg1` interface, with no address.

# Profit!
That should be it!  Aside from any other funky networking complications this should work for having specific devices perma-VPNed at the router level.

If this setup isn't working, have a look at the "Statistics" tab of the mangle rules and Wireguard interface - you should be able to see how many packets they are seeing over a period of time.  If there is no packet flow at a particular rule, then that might hint toward the problem!

<figure class="cool-figure">
    <img src="/assets/images/posts/mikrotik-vpn/statistics.png" alt="A WinBox window showing the Statistics tab of a mangle rule.  It's showing the total number of bytes and packets since the rule was created, and the current bytes and packets per second.  It's also showing graphs of bytes over time and packets over time.">
    <figcaption>The Statistics tab of a mangle rule</figcaption>
</figure>

That's about it for this post, check out the sources listed below to get a wider understanding of this approach.  Other than that, I hope this helps, or at least was interesting!

<hr>

# Sources
- [Simo R - Route traffic to VPN on Mikrotik](https://www.netdaily.org/route-traffic-to-vpn-on-mikrotik/)
- [LittleFool - Mullvad WireGuard with RouterOS 7](https://littlefool.de/posts/mullvad-wireguard-with-routeros-7/)

<hr>