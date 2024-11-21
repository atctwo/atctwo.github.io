---
layout: page
permalink: /about/socials
title: Contact and Socials
hide_title: true
---

{% include about_nav.html %}

<h1>{{page.title}}</h1>

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
        width: 28px;
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
</style>

Want to get in touch?  For now, my preferred method would be to send me an email at <a href='&#109;ail&#116;o&#58;%61&#37;6C%6&#53;&#120;&#64;&#97;&#116;&#99;tw%&#54;F&#46;&#37;6Eet'>ale&#120;&#64;atct&#119;o&#46;&#110;et</a>.  If you just want to know me better, check out my social media below!

<div id="social-card-container">
{% for social in site.data.socials %}

{% if social.name == "<break>" %} <div class="social-break"></div> {% else %}
    <a href="{{social.link}}">
        <div class="card social-card {%if social.long%} social-card-long {%endif%}">
            {% if social.icon %}
                {{social.icon}}
            {% endif %}
            <div>
                <span class="social-site-name">{{social.name}}</span><br>
                <span class="social-site-account">{{social.account}}</span>
            </div>
        </div>
    </a>
{% endif %}

{% endfor %}
</div>
<br>