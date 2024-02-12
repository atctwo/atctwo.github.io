---
layout: page
title: About
permalink: /about/
---

<style>
    #social-card-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    .social-card {
        width: 150px;
        height: 50px;
        /* border: 1px solid #495057; */
        /* border-radius: 0.375rem; */
        padding: 10px;
        font-size: large;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
    }
    .social-icon {
        width: 24px;
        height: 24px;
    }
</style>

Hello, I'm Alex!  This website is dedicated to cataloging the various projects I have worked on.  These range from small software utilities to electronic devices.  Most of what I've done is purely because it sounded fun, but I think that if I share my projects, someone might find something useful in them!  The website also hosts a blog where I talk about these topics.

My projects are collated on the [Projects](/projects/) page, and the blog can be accessed on the [Posts](/posts/) page.

I hope you enjoy your stay here!

## Socials and Links

<div id="social-card-container">
{% for social in site.data.socials %}

<a href="{{social.link}}">
    <div class="card social-card">
        {% if social.icon %}
            {{social.icon}}
        {% endif %}
        <div>{{social.name}}</div>
    </div>
</a>

{% endfor %}
</div>
<br>

## Computer Specs
In case anyone is interested, my PC is called Lucy.
- CPU: **Intel i7-13700KF**
- RAM: **64GB DDR5**
- GPU: **Nvidia GeForce 1080 Ti** and **AMD Radeon RX550**
- Storage: **1 x 1TB SSD** and **2 x 2TB HDD in RAID 1**
- Motherboard: **ASUS Z960-P WiFi**
- Cooling: **Corsair iCUE H100i Elite Capellix AIO**
- Case: **Corsair 4000X**
- an RS232 serial port