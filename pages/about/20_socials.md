---
layout: page
permalink: /about/socials
title: Contact, Socials, and Links
hide_title: true
---

{% include about_nav.html %}

# Contact and Socials

<style>
    #social-card-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    }
    .social-card {
        min-width: 200px;
        height: 70px;
        /* border: 1px solid #495057; */
        /* border-radius: 0.375rem; */
        padding: 15px;
        font-size: large;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        transition: background-color 0.2s;
    }
    .social-card:hover {
        background-color: var(--bs-secondary-bg);
    }
    /* .social-card-long {
        width: 300px;
    } */
    .social-break {
        flex-basis: 100%;
    }
    .about-social-icon {
        /* width: 28px; */
        height: 28px;
        margin-right: 5px;
        border-radius: 0px !important;
    }
    html[data-bs-theme="light"] .about-social-dark {
        display: none;
    }
    html[data-bs-theme="dark"] .about-social-light {
        display: none;
    }
    .social-site-name {
        font-size: smaller;
        color: var(--bs-secondary-color);
    }
    .social-site-account {
        font-size: large;
    }


    .badge-88x31{
        width: 88px;
        height: 31px;
        border-radius: 0px !important;

        /* from https://88x31.kate.pet/ */
        image-rendering: auto;
        image-rendering: crisp-edges;
        image-rendering: pixelated;
        image-rendering: -webkit-optimize-contrast;
    }

    .badge-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 3px;
    }
</style>

Want to get in touch?  For now, my preferred method would be to send me an email at <a href='&#109;ail&#116;o&#58;%61&#37;6C%6&#53;&#120;&#64;&#97;&#116;&#99;tw%&#54;F&#46;&#37;6Eet'>ale&#120;&#64;atct&#119;o&#46;&#110;et</a>.  If you just want to know me better, check out my social media below!

<div id="social-card-container">
{% for social in site.data.socials %}

{% if social.name == "<break>" %} <div class="social-break"></div> {% else %}
    {% if social.link %} <a href="{{social.link}}"> {% endif %}
        <div class="card social-card {%if social.long%} social-card-long {%endif%}">
            {% if social.icon %}
                {{social.icon}}
            {% endif %}
            <div>
                <span class="social-site-name">{{social.name}}</span><br>
                <span class="social-site-account">{{social.account}}</span>
            </div>
        </div>
    {% if social.link %} </a> {% endif %}
{% endif %}

{% endfor %}
</div>
<br>


# Badges

<img class="badge-88x31" src="/assets/images/badges/88x31.gif" alt="88x31 badge for this website.  it has the website name overlayed on a scrolling rainbow background">

### Cool People
<div class="badge-container">
    {% for badge in site.data.badges.people %}
        {% if badge.href %} <a href="{{badge.href}}"> {% endif %}
        <img class="badge-88x31" {% if badge.alt %} alt="{{badge.alt}}" {% endif %} src="{% unless badge.external %}{{site.data.badges.src_root}}/{%endunless%}{{badge.src}}">
        {% if badge.href %} </a> {% endif %}
    {% endfor %}
</div>

<br>

### Cool Things
<div class="badge-container">
    {% for badge in site.data.badges.misc %}
        {% if badge.href %} <a href="{{badge.href}}"> {% endif %}
        <img class="badge-88x31" {% if badge.alt %} alt="{{badge.alt}}" {% endif %} src="{% unless badge.external %}{{site.data.badges.src_root}}/{%endunless%}{{badge.src}}">
        {% if badge.href %} </a> {% endif %}
    {% endfor %}
</div>