---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

title: home
layout: home
permalink: /
description: atctwo's website
author: atctwo
hide_title: true
---

<style>
    .home-link-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 40px;
    }
    .home-link {
        width: 40%;
        height: 200px;
        line-height: 200px;
        text-align: center;
        vertical-align: middle;
        border-radius: 20px;
    }
    .home-a {
        width: 100%;
        height: 100%;
    }
</style>

Hi, I'm Alex.  I like to work on little programming and electronics projects.  
You can find an archive of these projects on the [Projects](/projects/) page.  You can also find blog posts on the [Posts](/posts/) page.  There's more info about me on the [About](/about) page.

I hope you enjoy your stay here!

<div class="home-link-container">
    <div class="home-link rainbow-background" data-hue=0>
        <a class="home-a" href="/about/">About Alex</a>
    </div>

    <div class="home-link rainbow-background" data-hue=100>
        <a class="home-a" href="/posts/">Blog Posts</a>
    </div>

    <div class="home-link rainbow-background" data-hue=200>
        <a class="home-a" href="/projects/">My Projects</a>
    </div>

    <div class="home-link rainbow-background" data-hue=55>
        <a class="home-a" href="/photos/">Photography</a>
    </div>
</div>


<script>
    document.getElementById("home-page-image").onclick = () => {
        document.getElementById("lonk").style.display = "block";
    }
</script>