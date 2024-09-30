---
layout: post
title:  "My Experience with Hybrid Graphics in 2024"
date:   2024-09-20
categories: posts
tags: [computers, linux, graphics]
author: "atctwo"
description: After two-ish years of avoiding (external) hybrid graphics in Linux, I finally turned on my eGPU enclosure...
image: /assets/images/posts/hybrid-graphics-2024/thumb.jpg
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
    .cool-figure figcaption {
        font-size: 0.875em;
        color: var(--bs-secondary-color);
    }
    @media (min-width: 767px) {
        .cool-figure img, video {
            height: 400px;
        }
    }
</style>

<!-- excerpt-start --> 

In one form or another, I've been daily driving systems using Linux's [hybrid graphics](https://wiki.archlinux.org/title/Hybrid_graphics) feature for the best part of the last six years.  I used an eGPU between 2018 and 2022, which worked well until everything broke.  I upgraded to a custom PC with one GPU until it's video ports broke, so now it has two GPUs in a hybrid graphics setup.

But in September I was away from my PC for two weeks, although I did have my old laptop, a monitor, and proximity to a TV.  Knowing it wouldn't have a great time driving two external displays, I decided to see if my eGPU problems had been fixed in the two-ish years since I last used it.  It turns out they had, and then some, but also not really.

<!-- excerpt-end -->

This post is really an excuse for me to talk about all my experiences with hybrid graphics, not just those from 2024.  A lot of this is just me talking about my history with computers because it's something I don't get to talk about enough.  I've experienced a couple different types of hybrid graphics systems, and due to the way I work I'll probably keep using them for a while.  Each section of this post will discuss a different experience from a different period in my life.  Having said this, my experiences will probably be very specific to the exact hardware setup I was using, so for each hybrid graphics setup I'll start by describing the state of the hardware.

In this post I'll be talking a lot about specific graphics hardware and Linux features, and some of it can be very esoteric.  I'll try my best to make sense of it though!

# 2018 - 2022: XPS 13 with the eGPU
- Computer: **Dell XPS 13 9360**
  - CPU: **i7-7500U**
  - iGPU: **Intel HD Graphics 620**
  - RAM: **16 GB**
  - USB-C connector: **Thunderbolt 3, PCIe 3.0 x2, DP1.2, USB PD 45W**
- External eGPU: 
  - Enclosure: **Razer Core X** (non-chroma)
  - GPU: [**AMD Radeon RX550 (MSI)**](https://www.msi.com/Graphics-Card/Radeon-RX-550-AERO-ITX-4G-OC/Specification) and later [**Nvidia GTX 1080 Ti (ZOTAC)**](https://www.zotac.com/us/product/graphics_card/zotac-geforce-gtx-1080-ti-apac#spec)
- Software
  - OS: **Windows 10** and later **Arch Linux**
  - Desktop Environment: **Budgie 10**
  - Display Server: **X.Org**

<figure class="cool-figure">
    <img src="/assets/images/posts/hybrid-graphics-2024/atc-xps.jpg" alt="Picture of my XPS 13, covered in stickers">
    <figcaption>My XPS 13, covered in stickers.</figcaption>
</figure>

Way back in 2017, I got one of the most important computers in my life: my XPS 13, which I still use to this day.  It's a bit old, it's only got 4 threads, but it's still got enough power for me to work on projects when out and about.  However I'm sad to admit that it's becoming less usable over time.  I don't think the hardware's getting worse, I just think software is moving past it.  From what I can tell the biggest bottleneck is it's integrated GPU.  This was actually enough of a problem back in 2018, when I wanted to play a few newly released Steam games that the iGPU just couldn't handle.

<figure class="cool-figure">
    <img src="/assets/images/posts/hybrid-graphics-2024/laptop and egpu.jpg" alt="Picture of my eGPU connected to my laptop">
    <figcaption>My eGPU connected to my laptop.</figcaption>
</figure>

In October 2018 I bought my external GPU enclosure: a [Razer Core X](https://www.razer.com/mena-en/gaming-laptops/razer-core-x) (not the chroma version since that didn't exist).  I bought with it a second hand AMD Radeon RX550, and the three lived happily together for years.  Initially I was using Windows 10 (OEM), and even back in 2018 the out of box experience was actually really good?  I don't think I've ever had such a pleasant experience with unusual hardware on Windows before or after.  Even <abbr title="Plugging in and unplugging a device without resetting or rebooting the host, like the way USB devices work">hotplugging</abbr> worked brilliantly.

At the time, I didn't really want to be using Windows.  I was actually using [Manjaro Linux](https://manjaro.org/) before, but I couldn't get it to output *anything* on any external monitor.  I wasn't very experienced with Linux at the time, so I didn't really know how to do much troubleshooting.  Forums and resources did exist for discussing eGPUs, but much of the discussion was focused on Windows (especially regarding gaming), so I reluctantly moved back to Windows.

A few times a year I tried to see if eGPU support had improved on Linux.  In early 2020, I discovered [`gswitch`](https://github.com/karli-sjoberg/gswitch), a script which installs (or uninstalls) an X.Org config file, which forces X.Org to use the eGPU and not the iGPU.  `gswitch` includes a systemd unit to call a script to automatically detect the presence of the eGPU and install the X.Org config only if required, but I was never able to get it working.  I resorted to manually calling `sudo gswitch egpu` or `sudo gswitch internal` whenever I wanted to switch GPUs (although it spent most of it's life on `egpu` mode since it was 2020 and I wasn't going anywhere...)

Needless to say, hotplugging did not work with `gswitch`, but other than that I was finally able to get a Linux OS consistently working with my eGPU!  I made the switch to running Linux full-time shortly after.  I reinstalled Linux, opting to install [Arch Linux](https://archlinux.org/) manually for some reason, and harmony was restored to my laptop (and the part of my brain that doesn't like Windows).  In 2021 I upgraded to an Nvidia GTX 1080 Ti, although this harmony only lasted until November 2022.

I started experiencing a very frequent graphics bug.  I guess "bug" isn't really a strong enough word to describe it, since roughly 10 to 20 minutes after boot any external displays would go black and my system would hang.  Occasionally I would be able to get an hour or two of usage, but the bug caught up with me every time.  I tried different monitors, different GPUs, different desktop environments, different Linux distros, and nothing worked.  I didn't see this issue when using the iGPU, or when using Windows.  And of course, this all happened during one of the busiest university assessment periods I've ever had.

I think I resorted to switching off my eGPU, and using a simple USB-C to HDMI adapter instead, just so I could use my laptop docked.  At the end of November I decided that I was done messing with obscure graphics setups, and designed and ordered parts for a new desktop PC, called Lucy.  Her single GPU was the 1080 Ti from the eGPU, with the idea being that having one GPU simply prevented the need for GPU switching, and it would just work.  It did work happily, until something completely unexpected happened...

I held on to my eGPU, knowing that I might not use it much again.  Internally it's basically just a PCIe x16 slot so I was later able to use it to test some network cards with my laptop, but I never used it again for graphics... until recently.

# 2022 - Present: Lucy with two GPUs
- Computer: **Lucy (custom PC build)**
  - CPU: **i7-13700KF**
  - iGPU: **None** (it's an F series CPU)
  - RAM: **64 GB**
  - GPU: [**Nvidia GTX 1080 Ti (ZOTAC)**](https://www.zotac.com/us/product/graphics_card/zotac-geforce-gtx-1080-ti-apac#spec) and later [**AMD Radeon RX550 (MSI)**](https://www.msi.com/Graphics-Card/Radeon-RX-550-AERO-ITX-4G-OC/Specification)
- Software
  - OS: **Arch Linux** and later **EndeavourOS**
  - Desktop Environment: **Budgie 10**, then **KDE Plasma 5**, then **KDE Plasma 6**
  - Display Server: **X.Org**, and later **Wayland**

I mentioned that my goal was to have one single GPU in Lucy.  To this end, I opted to buy an `F` series Intel CPU, which don't include any internal graphics processing (or at least it's not enabled).  While this does save money when purchasing the CPU, it does mean that your only option for video is the ports on the GPU, which as I later found makes it *really annoying* to diagnose graphics issues.

Around this time I switched to [EndeavourOS](https://endeavouros.com/), which is Arch-based but uses a graphical installer.  Endeavour defaults to using the `nvidia` driver rather than `nouveau`, which worked for me since I had was using `nvidia` on my laptop.  Initially I had a hard time getting my Nvidia card to work, but I eventually solved it by adding `ibt=off` to my kernel parameters.  After that, it worked pretty well!

Then four of the five video ports on the GTX 1080 stopped working.  I had bought the card second hand and I suspect it *might* have been used in cryptocurrency mining, but I was honestly pretty sad that it failed so soon.  Actually it broke 13 months after I bought it, one month after the 12 month warranty expired 🤔.  I took it apart, gave it a very good clean and fresh solder pads and paste, put it back together, and it still didn't work.

<!-- <div class="fig_container"> -->
<figure class="cool-figure">
    <img src="/assets/images/posts/hybrid-graphics-2024/1080_disassembled.jpg" alt="Picture of the GTX 1080 Ti with it's heatsink and fan assembly removed, exposing the GPU die and all the dirt that had accumulated inside it">
    <figcaption>The GTX 1080 Ti with it's heatsink and fan assembly removed, exposing the GPU die and all the dirt that had accumulated inside it.</figcaption>
</figure>
<!-- </div> -->

I tried using my old RX550 just to verify that it was the Nvidia card and not anything else.  I considered just using the RX550 full-time until I could get a new card, but I wasn't happy with how little usage I had got out of the 1080.  After all, the graphics processing still worked, it was just the video ports that had stopped working.  In the end I decided to reattempt a multi-GPU setup, by having both the Nvidia and AMD cards in my PC at the same time.  The AMD card would be the primary GPU connected to the displays, and the Nvidia card would be for offloading to when required.  I knew Linux support for such a system did exist, primarily for laptops with dedicated GPUs, although I had never considered it for when I was using my eGPU.

I was really surprised when it just worked, first time, with no configuration.  I think I already had `amdgpu` drivers installed for testing purposes, so it just worked.  I was expecting to have to setup custom X.Org config files to set the AMD card as preferred, but my guess is that something defaulted to the AMD card since it was the one with displays attached.  I've been calling this setup "hybrid graphics", but more specifically the Arch Linux Wiki refers to it as a technology called [PRIME](https://wiki.archlinux.org/title/PRIME).

Most things render on the AMD card by default, which is actually ideal since it doesn't require as much electrical power as the Nvidia card (I don't really need software like terminal emulators to be rendered on a high-end GPU).  To offload more demanding programs to the secondary GPU, there are a couple of environment variables that can be set:
```bash
# using openscad as an example program with high(er) graphics requirements
__NV_PRIME_RENDER_OFFLOAD=1 __GLX_VENDOR_LIBRARY_NAME=nvidia openscad
```
Alternatively, there's a wrapper script called [`prime-run`](https://wiki.archlinux.org/title/PRIME#PRIME_render_offload) which will set the environment variables automatically:
```bash
prime-run openscad
```

I've been using this setup on Lucy for a while now, and it actually works really well.  It even works almost perfectly with Proton games run through Steam (with a bit of configuration).  For example, I played through most of Resident Evil Village on almost max settings with few issues, offloaded to a GPU with one working video port!  Compared to the years of issues I had trying to get my eGPU to work, and to keep working, this was actually a very pleasant experience.

I should also mention that initially, I was still using X.Org as my display server of choice.  I was actually hesitant of Wayland since I thought my wacky graphics setup would not work well with it.  However, when KDE Plasma 6 was released, it made Wayland the default compositor; I had been using Wayland with no issues and I hadn't even realised it!

# September 2024: The eGPU Is Back
- Computer: the good old **Dell XPS 13 9360**
  - CPU: **i7-7500U**
  - iGPU: **Intel HD Graphics 620**
  - RAM: **16 GB**
  - USB-C connector: **Thunderbolt 3, PCIe 3.0 x2, DP1.2, USB PD 45W**
- External eGPU: 
  - Enclosure: **Razer Core X** (non-chroma)
  - GPU: [**Nvidia RTX 2080 Ti (Gigabyte)**](https://www.gigabyte.com/uk/Graphics-Card/GV-N208TTURBO-11GC-rev-10#kf)
- Software
  - OS: **EndeavourOS**
  - Desktop Environment: **KDE Plasma 6**
  - Display Server: **Wayland**

In September this year, I found myself away from Lucy for two weeks.  I had my laptop to work on stuff, and I was able to bring an external monitor.  Normally I would just use a USB-C to HDMI adapter when I'm using my laptop, but I happened to be in a room with a TV that I thought I might want to use with my laptop at the same time.  I didn't think my laptop would be capable of driving two external displays very well on it's own, even if they were all set to 1080p.  To be honest, it would have probably been fine, but I like making things complicated for myself.

Choosing the most normal course of action, I brought my old eGPU enclosure, as well as an RTX 2080 Ti that I had borrowed.  Even though this was absolutely overkill, I wanted to see what progress had been made in external and hybrid graphics support in the time since I'd last used it.  Without messing with the software on my laptop, I set everything up, plugged in the eGPU, turned my laptop on, and...

It Just Worked.  It Just Worked.  I logged in and it worked.  The external display lit up and it worked.  I ran a few diagnostic commands to try and figure out why it worked; `lspci` showed the RTX 2080 so it wasn't like it was just acting as a USB-C adapter; `ixni -G` showed that the external display was being driven using the `nouveau` driver, which I'm assuming had been preinstalled as a dependency of some other package on my system.  Another baseless theory I have is that Wayland has had something to do with it; Wayland seems to be much more tolerant when it comes to unusual graphics setups, so I am guessing that it was able to just roll with it.

```console
$ inxi -G
Graphics:
  Device-1: Intel HD Graphics 620 driver: i915 v: kernel
  Device-2: NVIDIA TU102 [GeForce RTX 2080 Ti] driver: nouveau v: kernel
  Device-3: Microdia Integrated Webcam HD driver: uvcvideo type: USB
  Display: wayland server: X.org v: 1.21.1.13 with: Xwayland v: 24.1.2
    compositor: kwin_wayland driver: X: loaded: intel unloaded: modesetting
    dri: i965 gpu: i915,nouveau resolution: 1: 1920x1080 2: 1920x1080
  API: EGL v: 1.5 drivers: iris,nouveau,swrast
    platforms: gbm,wayland,x11,surfaceless,device
  API: OpenGL v: 4.6 compat-v: 4.3 vendor: intel mesa v: 24.2.3-arch1.1
    renderer: Mesa Intel HD Graphics 620 (KBL GT2)
  API: Vulkan v: 1.3.295 drivers: intel surfaces: xcb,xlib,wayland
```

Although I didn't confirm this, I think most applications were using the iGPU as primary, meaning the eGPU wasn't actually being used for rendering, just for displaying.  Honestly I didn't have any issue with this, because I didn't really need high performance graphics, at least for these two weeks.  I don't think I would have got much performance out of it even if the eGPU was primary, since I wanted to keep my laptop screen on.  If you don't know, when rendering on an eGPU a bit of Thunderbolt bandwidth is used to pipe the rendered video back to the laptop screen, reducing graphics performance a wee bit.  Back when I was daily driving my eGPU `gswitch` ensured that my iGPU (as well as the laptop's internal screen) were removed from the picture, which is probably a contributing reason as to why I was able to get decent performance out of it.

In the end I did set the eGPU as primary, but not for performance reasons... I did it because I decided to use the `nvidia` drivers instead.

# I Decided To Install `nvidia` Even Though It Worked Fine Without It
Why did I go through this?  I'm used to using `nvidia` drivers, and I'm led to believe `nouveau` drivers are somehow worse, at least for performance.  The real reason is that I would have been sad if it didn't at least try to get it working.  I don't know when to give up sometimes.

## Getting `nvidia` working
I installed `nvidia` and rebooted, naively expecting it to Just Work in the same way that `nouveau` did.  Of course it didn't; `lspci` showed the card but `ixni` didn't show that either `nvidia` or `nouveau` were in use, just `i965` for my Intel iGPU.  I think installing `nvidia` blacklists the `nouveau` kernel modules, and seeing that the `nvidia` modules clearly weren't being used, I ran `sudo modprobe nouveau`, which caused the external display to light up as it had before.  So, `nvidia` wasn't being loaded at boot.

After a bit of research, looking at forum posts where other people had issues getting `nvidia` to do anything, I managed to get the card working by (1) adding `ibt=off` to my kernel parameters like I had done with Lucy, and (2) setting the following modprobe settings for the nvidia modules.  At least one of these settings got my GPU working but I honestly don't know which one(s).  If you're having a similar issue I would suggest trying them all at least once.

```
# /etc/modprobe.d/nvidia_drm.conf 
# enable kernel modesetting for nvidia drm
options nvidia NVreg_EnableGpuFirmware=0
options nvidia Nvreg_PreserveVideoMemoryAllocations=1
options nvidia_drm modeset=1
options nvidia_drm fbdev=1
```

<!-- I think the first one, `NVreg_EnableGpuFirmware` is specific to Turing and newer cards since they apparently have a RISC-V-based processor with it's own firmware for managing auxillary functions like sleep states.  It seems that this firmware doesn't work well with some Linux systems. -->

## Getting `nvidia` working properly
Having configured these parameters I was finally able to log into Plasma and see the external monitor light up.  Except, there was another issue - it was *really* glitchy.  The video below shows a capture of what the external display was receiving from the GPU; I was also able to find [a GitHub issue](https://github.com/NVIDIA/egl-wayland/issues/133) which demonstrated the same behaviour, as well as [a Reddit post](https://www.reddit.com/r/kde/comments/1dt0wlj/display_issues_after_nvidia_555_driver_update/) showing similar behaviour.  This specifically seems to be a bug in certain versions of the `nvidia` driver, so while using `nouveau` again seemed to be the more sensible option I continued anyway.

<figure class="cool-figure">
    <video class="video" controls>
      <source src="/assets/images/posts/hybrid-graphics-2024/egpu_glitches-remuxed.mp4">
      Your browser does not support HTML5 video, but you can download the video <a href="/assets/images/posts/hybrid-graphics-2024/egpu_glitches-remuxed.mp4">here</a>
    </video>
    <figcaption>A video showing the graphical glitches experienced when using my Intel iGPU as primary, with <code>nvidia</code> drivers</figcaption>
</figure>

After more research, I found one fix was to tell `kwin` to use the eGPU as primary.  This can be done using the `KWIN_DRM_DEVICES` environment variable, by setting it to a colon (`:`) separated list of DRI devices in order of priority.  For example, whenever I went to log onto my laptop with the eGPU connected, I would switch to a different tty and run

```bash
KWIN_DRM_DEVICES=/dev/dri/card0:/dev/dri/card1 startplasma-wayland
```

where `/dev/dri/card0` is my external GPU and `/dev/dri/card1` is my internal GPU.  There's no guarantee that `card0` will correspond to the eGPU and `card1` to the iGPU, this is just what my system is using.  As such, [this Reddit post](https://www.reddit.com/r/kde/comments/1ainwf5/how_i_worked_around_poor_performance_with/) suggests creating udev rules which provide named symbolic links to each DRI device, based on the names of the drivers the cards are using.  Using the rules provided in the post, I created these rules to cover additional drivers:

```
# /etc/udev/rules.d/drm-devices.rules
# named device files for drm cards
# based on https://www.reddit.com/r/kde/comments/1ainwf5/how_i_worked_around_poor_performance_with/

KERNEL=="card*",     DRIVERS=="i965",                     SYMLINK+="dri/by-driver/i965-card"
KERNEL=="card*",     DRIVERS=="i915",                     SYMLINK+="dri/by-driver/i915-card"
KERNEL=="card*",     DRIVERS=="amdgpu",                   SYMLINK+="dri/by-driver/amd-card"
KERNEL=="card*",     DRIVERS=="nvidia",                   SYMLINK+="dri/by-driver/nvidia-card"
KERNEL=="card*",     DRIVERS=="nouveau",                  SYMLINK+="dri/by-driver/nouveau-card"
```

```console
$ ls -l /dev/dri/by-driver
total 0
lrwxrwxrwx 1 root root 8 Sep 24 17:28 i915-card -> ../card1
lrwxrwxrwx 1 root root 8 Sep 24 17:28 nvidia-card -> ../card0
```

With this, it should be possible to specify DRI device in a more readable way:

```bash
KWIN_DRM_DEVICES=/dev/dri/by-driver/nvidia-card:/dev/dri/by-driver/i965 startplasma-wayland
```

Here's the output of `inxi -G` at this point:
```console
$ inxi -G
Graphics:
  Device-1: Intel HD Graphics 620 driver: i915 v: kernel
  Device-2: NVIDIA TU102 [GeForce RTX 2080 Ti] driver: nvidia v: 560.35.03
  Device-3: Microdia Integrated Webcam HD driver: uvcvideo type: USB
  Display: wayland server: X.org v: 1.21.1.13 with: Xwayland v: 24.1.2
    compositor: kwin_wayland driver: X: loaded: intel unloaded: modesetting
    failed: nvidia dri: i965 gpu: i915,nvidia resolution: 1: 1920x1080
    2: 1920x1080
  API: EGL v: 1.5 drivers: iris,nvidia,swrast
    platforms: gbm,wayland,x11,surfaceless,device
  API: OpenGL v: 4.6.0 compat-v: 4.5 vendor: nvidia mesa v: 560.35.03
    renderer: NVIDIA GeForce RTX 2080 Ti/PCIe/SSE2
  API: Vulkan v: 1.3.295 drivers: nvidia,intel surfaces: xcb,xlib,wayland
```

## Getting `nvidia` working automatically
I spent most of the two weeks running this command manually each time I wanted to use my eGPU.  On the second last day I decided to actually do something about it, and wrote a script to automate it.  The script checks for the existence of each named DRI device in the order of which cards have priority.  If a card is found, it's path is tacked onto the end of a variable, which is exported to `KWIN_DRM_DEVICES` at the end.  This script is stored in `$HOME/.config/plasma-workspace/env`, a location which Plasma checks for scripts before actually launching the compositor.  Any `.sh` script in here will be executed, and whatever environment variables are exported will be maintained.  By having a script which exports `KWIN_DRM_DEVICES` you can programmatically tell `kwin` which DRI devices to use!  For more info on this feature of Plasma, check out KDE's documentation on [Session Environment Variables](https://userbase.kde.org/Session_Environment_Variables).

{::options parse_block_html="true" /}

<details>
<summary markdown="span"><code>kwin_dri_selector.sh</code></summary>
<br>

```bash
# this script sets the KWIN_DRM_DEVICES environment variable to prioritise
# any non-intel card, if present.  the order of cards searched for in this
# script directly correspond do kwin priority
#
# it depends on named dri device symlinks as described in
# https://www.reddit.com/r/kde/comments/1ainwf5/how_i_worked_around_poor_performance_with/

echo "kwin dri device selector"

# assume there are no cards
KWIN_DRM_DEVICES=""

# if nvidia card exists
if [ -e "/dev/dri/by-driver/nvidia-card" ]; then
echo "found nvidia card"
KWIN_DRM_DEVICES+=/dev/dri/by-driver/nvidia-card:
fi

# if nouveau card exists
if [ -e "/dev/dri/by-driver/nouveau-card" ]; then
echo "found nouveau card"
KWIN_DRM_DEVICES+=/dev/dri/by-driver/nouveau-card:
fi

# if amd card exists
if [ -e "/dev/dri/by-driver/amd-card" ]; then
echo "found amd card"
KWIN_DRM_DEVICES+=/dev/dri/by-driver/amd-card:
fi

# if i965 card exists
if [ -e "/dev/dri/by-driver/i965-card" ]; then
echo "found i965 card"
KWIN_DRM_DEVICES+=/dev/dri/by-driver/i965-card:
fi

# if i915 card exists
if [ -e "/dev/dri/by-driver/i915-card" ]; then
echo "found i915 card"
KWIN_DRM_DEVICES+=/dev/dri/by-driver/i915-card:
fi

# remove trailing colon:
KWIN_DRM_DEVICES=${KWIN_DRM_DEVICES::-1}

# echo the final env var
echo ${KWIN_DRM_DEVICES}
export KWIN_DRM_DEVICES
```

</details><br>

{::options parse_block_html="false" /}


# eGPU Benchmarking
Another attempt to improve performance with `nvidia` involved disabling my laptop's internal screen.  I thought that, since `gswitch` was able to allow for fairly good performance by killing the iGPU and preventing video having to return to the laptop screen, disabling the screen might free up bandwidth on the Thunderbolt interface.  In practice this didn't actually do anything.  However I did want to have some metric for comparing performance under certain conditions, including whether or not the internal screen was on, which GPU was primary, which GPU was *rendering*, and which driver was being used.  So I decided to do some relatively informal benchmarking!

To be clear, the aim of this section (and this post in general) isn't to pit `nouveau` and `nvidia` against each other.  I really just wanted to see, in the context of external hybrid graphics, how much benefit you would get by changing drivers or displays.  My goal wasn't to achieve high performance graphics for gaming, but decent performance graphics for productivity.  I should also note that the results of these tests are **very** hardware specific.  I'm using an old laptop, and as I'll discuss later this definitely affects the results.

I opted to use Unigine's [Superposition](https://benchmark.unigine.com/superposition) benchmark.  I chose this because I wanted a well-regarded benchmark with native Linux support, but it actually worked out well because Superposition was released at around the same time my laptop was.  I was hoping this would mean it actually run well, and it did, sometimes.

For full disclosure, I performed all tests using the hardware setup declared in the previous section of this post.  The tests were run on the "1080p High" setting.  I rebooted the PC before each switch of driver or primary GPU, and had a terminal window, KDE Settings, Discord, and Nextcloud Sync running during each test.  Tests were run for each combination of the following parameters:
- which GPU was primary (internal or external)
- which GPU was rendering (internal or external)
  - when the primary GPU was external, no tests were run offloading to the internal GPU
- which Nvidia driver was being used (`nvidia` or `nouveau`)
- was the laptop screen on or off

Without further ado, here are the results:

<div class="no_toc_section">
<h4>eGPU Benchmarking Results</h4>
<table style="" class="table"><colgroup>
<col style="width: 131px">
<col style="width: 85px">
<col style="width: 45px">
<col style="width: 71px">
<col style="width: 51px">
<col style="width: 77px">
<col style="width: 43px">
<col style="width: 43px">
</colgroup>
<thead>
  <tr>
    <th colspan="2">Primary GPU<br></th>
    <th colspan="4">internal</th>
    <th colspan="2">external</th>
  </tr></thead>
<tbody>
  <tr>
    <td colspan="2">Rendering GPU<br></td>
    <td>internal</td>
    <td>external</td>
    <td>internal</td>
    <td>external<br></td>
    <td colspan="2">external</td>
  </tr>
  <tr>
    <td>Laptop internal screen state<br></td>
    <td></td>
    <td>off<br></td>
    <td>off<br></td>
    <td>on</td>
    <td>on</td>
    <td>off</td>
    <td>on</td>
  </tr>
  <tr>
    <td rowspan="2">eGPU Driver<br></td>
    <td><code>nvidia</code></td>
    <td><a href="/assets/images/posts/hybrid-graphics-2024/egpu_benches/nvidia_off_internal_internal.png">501</a><br></td>
    <td><a href="/assets/images/posts/hybrid-graphics-2024/egpu_benches/nvidia_off_internal_external.png">8412</a><br></td>
    <td><a href="/assets/images/posts/hybrid-graphics-2024/egpu_benches/nvidia_on_internal_internal.png">497</a></td>
    <td><a href="/assets/images/posts/hybrid-graphics-2024/egpu_benches/nvidia_on_internal_external.png">8383</a></td>
    <td><a href="/assets/images/posts/hybrid-graphics-2024/egpu_benches/nvidia_off_external.png">14692</a></td>
    <td><a href="/assets/images/posts/hybrid-graphics-2024/egpu_benches/nvidia_on_external.png">14668</a></td>
  </tr>
  <tr>
    <td><code>nouveau</code></td>
    <td><a href="/assets/images/posts/hybrid-graphics-2024/egpu_benches/nouveau_off_internal_internal.png">491</a></td>
    <td>❌</td>
    <td><a href="/assets/images/posts/hybrid-graphics-2024/egpu_benches/nouveau_on_internal_internal.png">495</a></td>
    <td>❌</td>
    <td>❌</td>
    <td>❌</td>
  </tr>
</tbody></table>
</div>

(you can click on the scores to access screenshots of the results screens!)

The first thing you will notice is that are a load of big red ❌ characters where there should be numbers.  For tests with these, I actually had trouble getting Superposition to run.  I was able to get it to run directly on the iGPU with `nouveau` ok (it did not run well), but I couldn't get it to run on the eGPU at all.  When the iGPU was primary, I tried offloading to the eGPU with `DRI_PRIME=1` but Superposition always just selected the iGPU.  Note that offloading with `nvidia` using `prime-run` worked fine, and actually it worked *really well*, yielding the highest scores by miles.  Even when the Nvidia card was primary with `nouveau`, Superposition didn't appear to be using it.  I tried to run Superposition anyway and it just gave an error stating the hardware configuration wouldn't work.

Another observation is that setting the eGPU as primary improves performance by around 6000 points.  I honestly don't really know enough about graphics programming to say for certain why this is, but I'm guessing that it's something to do with the fact that, when the eGPU is primary, the iGPU isn't being used at all (similarly to when I was using `gswitch`).  When the iGPU is primary, it is always being used, even if Superposition is offloaded to the eGPU.

Finally, I was surprised by how little difference turning the laptop screen off made.  In every test (which I could get running), the state of the laptop screen had a negligible effect.  I was especially surprised at the case when the eGPU was primary, since I was under the impression that having the internal screen running would reduce Thunderbolt bandwidth.  These results don't *disprove* that theory but they do show that running the internal screen doesn't have much of an impact.

At least, on my machine.  I think a lot of these scores, especially the ones where the iGPU was rendering, are a result of my CPU.  My laptop has a 7th generation ultrabook Intel i7, which is *fine* for general workloads, but the integrated GPU is not good.  In fact, it actually has problems running Plasma 6 smoothly at it's native 3200x1800 resolution.  I usually use it at 1080p, which typically works well enough.  Removing the iGPU from the situation and depending on the eGPU entirely actually makes the system completely usable for tasks that the laptop would otherwise be virtually unable to handle.

To this end I decided to test a couple of games on it, using the `nvidia` drivers and with the eGPU as primary.  *Resident Evil Village* ran commendably well, although not at super high end levels.  With the intense "Ray Tracing" graphics preset I was able to get around 30 FPS, which is completely playable, even more so if used with a more moderate graphics preset.  I think a lot of this is down to how well optimised the RE Engine is.  I also tried *Portal with RTX* however this game struggled.  I managed to prevent it hanging on the title screen by launching it with `prime-run`, but it ran at around 20 FPS on low settings, and crashed when I took a screenshot.

<figure class="cool-figure">
    <a href="/assets/images/posts/hybrid-graphics-2024/re8_1.jpg" target="_blank">
        <img src="/assets/images/posts/hybrid-graphics-2024/re8_1.jpg" alt="Screenshot from Resident Evil Village, showing the sun breaking through the clouds over a barbed wire fence">
    </a>
    <a href="/assets/images/posts/hybrid-graphics-2024/re8_2.jpg" target="_blank">
        <img src="/assets/images/posts/hybrid-graphics-2024/re8_2.jpg" alt="Screenshot from Resident Evil Village, showing the entrance to a factory with a large mounting range in the background">
    </a>
    <a href="/assets/images/posts/hybrid-graphics-2024/re8_3.jpg" target="_blank">
        <img src="/assets/images/posts/hybrid-graphics-2024/re8_3.jpg" alt="Screenshot from Resident Evil Village, showing the grass in front of the factory.  It's quite low resolution">
    </a>
    <figcaption class="figure-caption">A handful of in-game screenshots from <em>Resident Evil Village</em> taken on my laptop with the eGPU</figcaption>
</figure>


To satisfy my curiosity I ran superposition on Lucy, and I was actually pretty surprised by the results.  Initially I ran it on Lucy's GTX 1080 Ti, and got a score of [10950](/assets/images/posts/hybrid-graphics-2024/egpu_benches/lucy_gtx1080.png).  My "gamer" PC had been outperformed by a seven year old ultrabook!  Realising that my laptop was able to get a higher score because of it's better (external) GPU, I tried the benchmark again but with the RTX 2080 Ti installed into Lucy.  This yielded a score of [15527](/assets/images/posts/hybrid-graphics-2024/egpu_benches/lucy_rtx2080.png), which is only marginally higher than my laptop's top score.  This suggested to me that Superposition isn't actually very CPU dependant, and mostly relies on the GPU.  The CPU in Lucy could run circles around the CPU in my laptop, but when the GPU playing field is made equal then the rest of the hardware becomes trivial (at least, for this particular benchmark).

# A brief note on Hotplugging
One of the major selling points of using an external GPU enclosure is hotplugging - the idea that you can just remove or reattach your graphics card at runtime.  I mentioned way back at the start of this post that hotplugging worked really well on Windows, but I had never got it to work in Linux.  I had heard that there had been some work on hotplugging in Wayland so I wanted to see how much progress had been made.

I first tried hotplugging with the `nvidia` driver.  With the iGPU as primary, hot*un*plugging did work, but I found that the external displays were not detected as removed.  I was able to drag windows over to the display, even though it wasn't attached anymore.  Applications are still usable, although if they are offloaded with `prime-run` then the applications hang (the system remains usable).  Trying to disable the external display from KDE Settings does crash the system.  However, hotplugging (where Plasma was logged in to *before* the eGPU was attached) worked as expected!

For fun I tried hotunplugging with the eGPU as primary, and predictably the system hung.

I moved on to testing with `nouveau`, and with the iGPU as primary, hotplugging works well.  Hotunplugging also appeared to work, except for a few specific circumstances.  I didn't do enough testing to determine what these circumstances were, but one example is that my system crashed when Firefox was open on the external display.  I also had issues on shutdown after removing the eGPU, with the system unable to complete the shutdown process due to errors with PCI power states.

Generally it feels like a lot of work has been done on hotplugging since I stopped using my eGPU regularly.  It doesn't seem to be ready for prime time at the minute (at least the out-of-box experience doesn't), but it definitely feels like it's getting better over time!  Consider that I didn't spend very much time on hotplugging though, and there seem to be techniques for getting it to work better (such as those described on the [Arch Linux Wiki](https://wiki.archlinux.org/title/External_GPU#Hotpluging_Nvidia_eGPU)).

# Conclusion
I think that no matter what personal computer I find myself using in the future, be it desktop, laptop, or otherwise, I'll probably still find myself using hybrid graphics.  The appeal of the technology is too strong.  One of the reasons I used an eGPU back in the day was because I loved the idea of being able to take my computer out with me, then dock it at home for when I needed more processing power.  Even having switched to using a desktop PC for most of my work I still find myself using hybrid graphics.  It's fair to say that it saved my GTX 1080 from obsolescence.

For systems with internal GPUs like gaming laptops and Lucy, it works really really well!  Installing a second GPU in Lucy was the first time I ever had some graphics hardware on Linux simply work first time.  eGPU support is still a little bit less seamless, however it is miles ahead of what it was back when I was using an eGPU every day.  A little bit of tinkering is still needed but most things in Linux need that.  I'm impressed by how *little* tinkering was needed to make it work!

I'm impressed that my eGPU worked out of the box with Plasma 6, but my testing with the `nouveau` driver demonstrated that it's not really on par with `nvidia`.  Many people have spoken about how much worse it is for graphical performance, but that wasn't even my aim; for these two weeks I didn't really care too much about performance.  I was more concerned with how well it worked with multi-GPU setups, and I really struggled to get `nouveau` working well for this use case.

In the end, my temporary eGPU setup worked quite well.  I was finally living the dream of using my laptop for work when out and about, then docking it to a full-sized GPU when working at home.  A little bit of configuration was required but I'm used to that at this point.  I was able to achieve enough performance to get my work done, but not a lot more.  I managed to get some games running on it but not nearly as well as Lucy could, and I think this setup would actually be feasible to use every day like I used to if it weren't for my laptop.  With how far laptops hardware has come since my laptop was released, eGPUs are in the strongest position they've every been, and I can only see it getting better from here.

As the software I use slowly becomes less usable on my beloved XPS 13, I must admit to myself that I probably need to get a new laptop soon.  That's why I built Lucy, because my laptop couldn't handle a lot of what I needed to do.  So I like to think of these two weeks as my laptop's swan song, reunited with it's old eGPU for one last performance.  To me, computers aren't just a tool or an appliance, they're the things through which I live my life.  My XPS 13 9360 has been there for the most important parts.

<figure class="cool-figure">
    <img src="/assets/images/posts/hybrid-graphics-2024/desk.jpg" alt="Picture of my temporary desk">
</figure>