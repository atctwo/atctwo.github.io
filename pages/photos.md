---
layout: page
title: Photos
permalink: /photos/
main_content_class: ""
hide_title: true
---

<style>

    /* #photos-container {
        margin-left: -20%;
        width: 140%;
        max-width: 100vw;
    } */

    #photos-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    #photos-container > * {
        width: 70%;
    }

    .thumb-container {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
    }

    .thumb {
        height: 200px;
        transition: transform 0.2s;
    }

    .thumb:hover {
        transform: scale(1.1);
    }

</style>

<div id="photos-container">

<h1>Photos</h1>

<p>Recently I got a new camera, and I'm having lots of fun with it!  This page is where I'm keeping a collection of my favourite photos that I've taken, if you're interested!</p>

{% for album in site.data.photos.albums %}

<h2>{{album.name}}</h2>
<div class="thumb-container">
{% for image in album.images %}
        {% assign filename_parts = image | split: "." %}
        <img class="thumb image" src="{{site.data.photos.image_url}}/{{album.id}}/{{filename_parts[0]}}_400p.{{filename_parts[1]}}">
{% endfor %}
</div>

{% endfor %}
</div>
