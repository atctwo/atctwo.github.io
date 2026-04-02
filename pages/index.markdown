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
    .pawsome {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
    .home-page-title {
        font-size: 55pt;
        text-align: center;
    }
    .help {
        font-size: 18pt;
    }

    .nav-text {
        font-size: 18pt;
    }
    .nav-body {
        position: relative;
        padding: 20px;
        font-family: "Varela Round", sans-serif;
    }
    .nav-section {
        border-radius: 1.5rem;
        backdrop-filter: hue-rotate(50deg);
    }
    .nav-container {
        display: flex;
        flex-direction: row;
        gap: 30px;
        align-items: center;
        justify-content: center;
    }
    @media (max-width: 992px) {
        .pawsome {
            flex-direction: column;
        }
        .home-page-title {
            font-size: 40pt;
        }
        .help {
            text-align: center;
        }
        .nav-container {
            flex-direction: column;
            gap: 20px;
            padding-bottom: 40px;
        }
        .nav-section {
            width: 80%;
        }
    }
</style>

<div class="pawsome">
    <h1 data-bs-theme="light" class="home-page-title">welcome to<br>atctwo's site!</h1>
    <img src="{{ site.atctheme.home_image }}" alt="{{ site.atctheme.home_image_alt }}" id="home-page-image">
</div>

<div class="help">
Hi, I'm Alex!  This website is a place for me to collect my little programming and electronics projects, as well as some other bits and pieces I thought would be cool to share.

I hope you enjoy your stay here!
</div>

<br>

<div class="nav-container">
    <button class="btn nav-section">
        <div class="nav-body">
            <div class="card-text nav-text">About Me!</div>
            <a href="/about" class="stretched-link" aria-label="About"></a>
        </div>
    </button>
    <button class="btn nav-section">
        <div class="nav-body">
            <div class="card-text nav-text">My Projects!</div>
            <a href="/projects" class="stretched-link" aria-label="Projects"></a>
        </div>
    </button>
    <button class="btn nav-section">
        <div class="nav-body">
            <div class="card-text nav-text">My Blog!</div>
            <a href="/posts" class="stretched-link" aria-label="Blog"></a>
        </div>
    </button>
    <button class="btn nav-section">
        <div class="nav-body">
            <div class="card-text nav-text">My Photos!</div>
            <a href="/photos" class="stretched-link" aria-label="Photos"></a>
        </div>
    </button>
</div>

<script>
    document.getElementById("home-page-image").onclick = () => {
        document.getElementById("lonk").style.display = "block";
    }
</script>