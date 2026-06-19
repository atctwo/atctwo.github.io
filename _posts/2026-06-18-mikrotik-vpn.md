---
layout: post
title:  "Mikrotik Router as a VPN client"
date:   2026-06-18
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

With the recent increase in identify verification on online spaces, those with a desire to keep their ID private may be considering long-term options such as always-on VPNs.  Of course, my particular network decisions make having an always-on VPN kinda difficult.  

All my *portable* devices are typically connected to a private ("road warrior") VPN so I can access resources on my LAN.  Running this private VPN alongside a public VPN is doable, but it gets tricky when one VPN is OpenVPN and the other is Wireguard.  Then it gets almost impossible when you have to run both on an Android device.

So, what's the most reasonable way to have my devices tunnelled through both without having two tunnels?  It's clearly to have select clients on the private LAN *automatically tunnelled through a VPN on the router level*!

<!-- excerpt-end --> 

This approach has a lot of problems, a lot of funny edge cases, and weird hacks are required to get it working.  It may also have a not insignificant performance overhead.  But it's been working well for me so far, and if anyone else is in a similarly strange[^1] network situation then hopefully this should work for them too!

My router is a [tiny little baby Mikrotik hAP ac](https://mikrotik.com/product/RB962UiGS-5HacT2HnT) running RouterOS 7, which means that this approach is highly specific to Mikrotik stuff.  Also, the particular public VPN I'm using is [Mullvad](https://mullvad.net/); there will be some Mullvad specific stuff here but hopefully the approach will be fairly VPN-agnostic.

This approach is **highly** based on [this post by Simo R](https://www.netdaily.org/route-traffic-to-vpn-on-mikrotik/); in fact it's mostly exactly the same, except with extra tinkering I had to do for some network-specific cases, as well as some tips from [this post](https://littlefool.de/posts/mullvad-wireguard-with-routeros-7/ by LittleFool).

[^1]: I guess my situation is strange because I'm kinda forced to use OpenVPN for my private VPN because of certain network restrictions which are out of my control.  I'd rather use Wireguard, but I guess if I could use Wireguard I would more likely be using something like Tailscale


# What Is Happening
To start off, I want to give an overview of my situation and why this approach is useful to me.

- I have a local network with built around a Mikrotik router.  I'm able to access the network remotely using a **private VPN** running on a server on the LAN
- I would like *most* of my non-LAN web traffic to get tunnelled through a **public VPN** (in my case, Mullvad)
- It's impractical for me to run both VPNs separately on my devices; I can only pick one or the other

So, how does this approach solve this problem?

- The approach is to use policy-based routing to have most traffic from devices on the LAN get routed through the public VPN tunnel (including traffic originating from private VPN clients)
- devices which should have their traffic sent through the VPN have this routing manually enabled (opt-in)
  - this is to avoid all traffic being routed to the VPN by default since that would be kinda chaotic
- websites / remote IPs to *not* be routed to the VPN (ie: bypassed) are manually added (opt-out)
  - this is so I don't have to disable the whole VPN to access sites which block VPNs; instead they can just be added to the bypass list

With these established, let's look at how the approach was actually implemented!


# Router Config
There's a couple different steps that have to be done in a couple different places, so this post will go through them in a menu-by-menu basis.  While I did set all of this up using the WinBox GUI, I'm listing all of the config entries as viewed in the terminal since that seems to be the de facto standard for sharing Mikrotik configs.

## Setting up the VPN interface
To start off, add the VPN as an interface.  Mullvad uses Wireguard so I added a Wireguard interface called `wg1`.  Well, I actually exported a `.conf` file from Mullvad's website, uploaded it to the router's file system, then used the "WG Import" feature in the Wireguard menu.

<figure class="cool-figure">
    <img src="/assets/images/posts/mikrotik-vpn/import-wg.png" alt="The WireGuard interface menu as shown in WinBox.  It consists of a window with two tabs: Wireguard and Peers.  In the Wireguard tab, a table listing all the Wireguard interfaces can be seen (but there's only one).  On the right is an actions pane, showing one action called WG Import">
    <figcaption>WG Import is shown in the Actions pane on the right of the menu</figcaption>
</figure>

(or in the terminal, run `interface wireguard wg-import`)

This automatically creates the Wireguard interface as well as the Mullvad peers.  However, I found that the peer didn't have an endpoint address or port set; I just copied the endpoint info directly from the `.conf` file.

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
       name="wgmullvad" fib 
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
;;; bypass vpn for mullvad's website
 6   vpn-bypass  45.83.223.209    2026-06-17 21:32:30
;;; bypass vpn for mullvad's connection check
 7 X vpn-bypass  45.83.223.233    2026-06-17 21:36:56
```

Entry 6 prevents traffic going to Mullvad's website from being sent to the tunnel.  This is so that if I forget to pay them and my VPN time runs out, I can still access their website to add more time!  But I realised that I haven't bypassed any third-party payment provider, so I'm not sure if this will actually work :P

## Firewall mangle rules
Now the fun part >:3

There are four firewall mangle rules which are responsible for determining which packets get routed to the tunnel and which don't.  They are explained below in the order they should be arranged in the `ip firewall mangle` menu.  Each rule is created on the `prerouting` chain.

The first three rules are "exceptions", which prevent certain traffic from being routed to the VPN tunnel by immediately `accept`ing the packet.  The last rule is the one that actually sends packets that make it through to the tunnel (well, the *routing table* for the tunnel).

{% include admonition.html type="info" %}

<div class="no_toc_section" markdown="1">

### 1. don't tunnel bypassed IPs
to prevent sending traffic for bypassed IPs to the VPN tunnel, packets with a source address in the `vpn` list and a destination address in the `vpn-bypass` list get `accept`ed

### 2. don't tunnel LAN traffic
to prevent traffic to other devices on the LAN getting tunnelled, packets with a source address in `vpn` and a destination address in `lan` get `accept`ed

### 3. don't tunnel traffic for forwarded ports
this one is really only important if you have port-forwarded a device on your LAN which happens to be in the `vpn` list.  

when outbound traffic from that device gets to the router, how does it know if it's general internet-bound traffic (to be tunnelled) or if it's a response to an inbound connection (which really shouldn't be tunnelled)?  one possible way is by source port number - for example, if you have an OpenVPN server running on a `vpn` device, `accept`ing any traffic from port 1194 should bypass the public VPN tunnel and get routed directly to the inbound client.

### 4. tunnel everything else!
any other traffic with a source address in `vpn` that has got this far (ie: hasn't been `accept`ed by the previous rules) gets sent to the VPN tunnel.  this is done by *route marking* the packet to the `wgmullvad` routing table we made earlier.  

note that this doesn't actually send the traffic through the tunnel, it simply puts it on the `wgmullvad` table, which will mean it gets tunnelled later.

</div>

{% include admonition_end.html %}

```conf
> ip firewall mangle print detail
Flags: X - DISABLED, I - INVALID; D - DYNAMIC 
 0    ;;; don't send bypassed IPs through the vpn
      chain=prerouting action=accept src-address-list=vpn dst-address-list=vpn-bypass log=no 
      log-prefix="" 

 1    ;;; don't send LAN pkts through the vpn
      chain=prerouting action=accept connection-state="" src-address-list=vpn dst-address-list=lan 
      log=no log-prefix="" 

 2    ;;; don't send estd openvpn traffic through the vpn
      chain=prerouting action=accept connection-state=established protocol=udp src-address-list=vpn 
      src-port=1194,1995 log=no log-prefix="" 

 3    ;;; else, send all traffic (from vpn-enabled ips) through the vpn
      chain=prerouting action=mark-routing new-routing-mark=wgmullvad passthrough=yes 
      src-address-list=vpn log=no log-prefix="" 
```

There's a lot of complexity and variance here (in fact this is one of the main ways my ruleset differs from Simo R's).  But I've tried to explain what everything does so hopefully it makes sense!

{% include admonition.html type="warning" %}

If the device you're using to edit the config is on `vpn`, make sure the last rule is only enabled when the "don't tunnel LAN traffic" rule is also enabled!  If the latter is disabled while the former is enabled, the router will try to tunnel the router-bound traffic from your device to the tunnel.  You might need to connect back to the router with an IP that you know isn't on `vpn` to reenable the rule!

{% include admonition_end.html %}

## Firewall NAT rules
If you have regular NAT rules set up on your network, you might need to set up an extra rule to make sure traffic to the VPN tunnel (on the `wgmullvad` routing table) gets NATted too.

```conf
> ip firewall nat print detail
 0    ;;; NAT for packets beign sent through VPN
      chain=srcnat action=masquerade src-address-list=vpn routing-mark=wgmullvad log=no log-prefix="" 

 1    ;;; regular NAT to access outside of the router
      chain=srcnat action=masquerade src-address=192.168.0.0/23 out-interface=ether1 log=no 
      log-prefix="" 
```

## Route to VPN
With the traffic we definitely want tunnelled having been placed in the `wgmullvad` routing table, it's finally time to send it down the tunnel.  This is done using a pretty simple static route.

```conf
> ip route print detail
 0  As   ;;; send wgmullvad packets to The Tunnel
         dst-address=0.0.0.0/0 routing-table=wgmullvad gateway=10.124.0.70 immediate-gw=10.124.0.70%wg1 
         distance=1 scope=30 target-scope=10 
```

The only tricky thing here might be the `gateway` option (`immediate-gw` should be set automatically).  At least for Mullvad connections, this should be set to the gateway IP for the particular VPN server you're using.  LittleFool points out that this is generally the IP of the SOCKS5 proxy address of the server as listed on the [Mullvad Server page](https://mullvad.net/en/servers).

For example, I'm using `ie-dub-wg-101`.  It's SOCKS5 proxy address is `ie-dub-wg-socks5-101.relays.mullvad.net`, which resolves to an `A` record of `10.124.0.70`.

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