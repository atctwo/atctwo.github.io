---
layout: page
permalink: /about/
title: About
hide_title: true
---

<style>
    @media (min-width: 767px) {
        #me-img {
            height: 300px;
            float: right;
            margin-left: 20px;
            border: 3px solid #00ced1;
        }
        .skills-container {
            flex-direction: row;
        }
        .skills {
            flex: 1 1 0px;
            width: 0;
        }
    }

    @media (max-width: 766px) {
        .skills-container {
            flex-direction: column;
        }
    }
    .skills-container {
        display: flex;
        gap: 20px;
    }
    .skills {
        border: 4px solid #8ac926;
        border-radius: 10px;
        padding: 20px;
    }
    .skills-green  { border-color: #8ac926 }
    .skills-yellow { border-color: #ffca3a }
    .skills-red    { border-color: #ff595e }

    /* .skill-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    } */
    .skill {
        display: inline-block;
        /* border: 1px solid black; */
        border-radius: 10px;
        padding: 5px;
        line-height: 29px;
        margin: 2px;
        transition: background-color 0.2s;
    }
    .skill:hover {
        background-color: var(--bs-secondary-bg);
    }
    .skill-icon {
        /* width: 29px; */
        height: 29px;
        border-radius: 0px !important;
    }
    .skill-break {
        flex-basis: 100%;
        margin: 0;
    }

    .subfield-container {
        display: flex;
        flex-direction: row;
        gap: 20px;
        justify-content: center;
    }
    .subfield {
        border: 4px solid #8ac926;
        border-radius: 10px;
        padding: 20px;
    }
    /* @media (min-width: 766px) {
        .subfield {
            width: 80%;
        }
    } */
    .game-card-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 100%;
        gap: 10px;
        justify-content: center;
        margin-bottom: 30px;
    }
    .game-card {
        align-items: center;
        width: 14rem;
        /* height: 400px; */
        border: 4px solid #00ced1;
        border-radius: 10px;
    }
    .game-card > div {
        text-align: center;
    }
    @media (max-width: 992px) {
        .game-card {
            width: 45%;
            border-width: 3px;
        }
    }
    .game-img {
        border-radius: 6px 6px 0px 0px !important;
    }
    .game-img-container {
        position: relative;
    }
    .game-img-credit {
        position: absolute;
        left: 10px;
        bottom: 10px;
        background-color: #00000080;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
    }
    .game-img-credit i {
        color:rgb(200, 200, 200);
    }
</style>

{% include about_nav.html %}

<!-- <h1>{{page.title}}</h1> -->
<p class="h1">Hello, I'm Alex! <span class="h3 text-body-secondary">(she/her)</span></p>

<img src="/assets/images/me.jpg" id="me-img" class="rainbow-border">

<!-- This website is dedicated to cataloging the various projects I have worked on.  These range from small software utilities to electronic devices.  Most of what I've done is purely because it sounded fun, but I think that if I share my projects, someone might find something useful in them!  The website also hosts a blog where I talk about these topics.

My projects are collated on the [Projects](/projects/) page, and the blog can be accessed on the [Posts](/posts/) page.
 -->

I'm an engineer and maker interested in computing and electronics, particularly in mixing both to make embedded software and hardware.  I'm from [Belfast](https://en.wikipedia.org/wiki/Belfast) in Northern Ireland where I'm currently studying for a PhD in Electrical Engineering (specifically in radio antennae) at Queen's University Belfast.  

I graduated with my MEng in Computer Science from Queen's in 2024, but most of my experience in computing and electronics have come from a series of self-led [projects](/projects/).

I'm a trans woman, and I have an interest in the overlap between the queer and tech / maker communities.  

I've also been getting into photography recently, and I've made a [section on this site](/photos/) for me to share my favourite photos.  This site also contains [a blog](/posts/) where I've been writing long-form posts about interesting experiences I've had and things I've learned when working on projects.

My favourite colour is <span style="color: #00ced1;">this very specific shade of turquoise (`#00ced1`)</span>, although I'm a huge fan of rainbow motifs as I'm sure you can tell.

Welcome to my home on the internet, I hope you enjoy your stay here!

<!-- here's where i would put my Experience and Affiliations section, if i had any :((((( -->

## Technologies I use
I love computers and electronics generally, but more specifically there are certain subfields I am really interested in.  All the languages, frameworks, and technologies I have used are listed below, split into two groups based on level of experience.

<div class="skills-container">
    <div class="skills skills-green rainbow-border" data-hue="83">
        <h3>Lots of experience</h3>
        <div class="skill-container">
            {% for skill_name in site.data.about_skills.exp_lv4 %}
                {% if skill_name == "br" %}
                    <br>
                {% else %}
                    {% if site.data.technologies contains skill_name %}
                        {% assign skill = site.data.technologies[skill_name] %}
                        {% if skill.url %} <a href="{{skill.url}}"> {% endif %}
                        <div class="skill">
                            {% if skill.icon %}
                                <img class="skill-icon" src="/assets/images/technologies/{{skill.icon}}">
                            {% endif %}
                            <span {%if skill.colour%}style="color: {{skill.colour}}"{%endif%}>{{skill.name}}</span>
                        </div>
                        {% if skill.url %} </a> {% endif %}
                    {% endif %}
                {% endif %}
            {% endfor %}
        </div>
    </div>
    <div class="skills skills-yellow rainbow-border" data-hue="44">
        <h3>Some experience</h3>
        <div class="skill-container">
            {% for skill_name in site.data.about_skills.exp_lv3 %}
                {% if skill_name == "br" %}
                    <br>
                {% else %}
                    {% if site.data.technologies contains skill_name %}
                        {% assign skill = site.data.technologies[skill_name] %}
                        {% if skill.url %} <a href="{{skill.url}}"> {% endif %}
                        <div class="skill">
                            {% if skill.icon %}
                                <img class="skill-icon" src="/assets/images/technologies/{{skill.icon}}">
                            {% endif %}
                            <span {%if skill.colour%}style="color: {{skill.colour}}"{%endif%}>{{skill.name}}</span>
                        </div>
                        {% if skill.url %} </a> {% endif %}
                    {% endif %}
                {% endif %}
            {% endfor %}
        </div>
    </div>
</div>
<br>

<!--

## Subfields of interest
I've been into computers for as long as I can remember, and I've spent literally most of my life programming.  I've been doing electronics for about a decade as well.  I'm interested in stuff as high-level as web development, and as low level as radio systems!  I've broken my main subjects of interest into five main "levels", starting with the highest level and getting deeper.

<div class="subfield-container">
    <div class="subfield rainbow-border" data-hue=0>
        <h3>Programming</h3>
        <ul>
            <li>Web development</li>
        </ul>
    </div>
    <div class="subfield rainbow-border" data-hue=35>
        <h3>Computers</h3>
        <ul>
            <li>Computer hardware</li>
            <li>Linux usage</li>
            <li>Server administration</li>
            <li>Network design</li>
        </ul>
    </div>
    <div class="subfield rainbow-border" data-hue=55>
        <h3>Embedded Engineering</h3>
        <ul>
            <li>Embedded software</li>
            <li>Arduino and PlatformIO</li>
            <li>Interfacing with hardware</li>
        </ul>
    </div>
    <div class="subfield rainbow-border" data-hue=75>
        <h3>Electrical Design</h3>
        <ul>
            <li>Mostly digital systems</li>
            <li>PCB Design</li>
        </ul>
    </div>
    <div class="subfield rainbow-border" data-hue=185>
        <h3>Radio Systems</h3>
        <ul>
            <li>Wireless communication</li>
            <li>Amateur Radio</li>
        </ul>
    </div>
</div>
<br>

-->

## Other Interests
Computers and electronics are what I spend most of my time doing, either for fun or for work.  I do however have other interests and hobbies (which to be fair also involve computers...)

### 📷 Photography
As I mentioned, I've been getting into photography.  I recently got a Panasonic GX80 and I take it almost everywhere with me, so I don't miss any shots.  I've been playing around with Darktable to edit my photos.  My favourite photos are uploaded to the [photos section](/photos/)!

### 🎵 Music
I probably spend at least half of the time I'm awake listening to music.  Generally I'm into "indie stuff", plus or minus half a genre.  
- My favourite bands ever are Radiohead, alt-J, Blonde Redhead, and Crumb
- I often listen to Sufjan Stevens, Billie Marten, Mitski, Flipturn, The Marias, Panchiko, Alvvays, C418, various Vocaloid artists, They Might Be Giants
- More recently I've been listening to Kero Kero Bonito, Ivy, KNOWER, Lemon Demon, and Djo

Recently I set up a [Last.fm](https://www.last.fm/user/atctwo) account, so you can see what I'm currently listening to!

### 🕹️ Video Games
While I'm not a hardcore gamer, I do enjoy it from time to time!

One of my special interests is Nintendo.  Not only am I interested in their games, I'm interested in them as a company, in the same way football fans are interested in a club.  I'm a huge fan of the Legend of Zelda series and I've 100% completed (almost) every mainline Super Mario game since *Super Mario 64*!  I don't really play much online, with the main exceptions being *Mario Kart 8* (and now *Mario Kart World*), as well as *Tetris* (usually *TETRIS 99* and [*TETR.IO*](https://ch.tetr.io/u/atctwo)).

Although I don't play them that often, I really enjoy games that have a huge emphasis on story, even if there isn't much gameplay.  The *Life is Strange* series has had an immeasurable effect on my life, and helped me realise what type of person I wanted to be.  On the other hand, I've had my sense of reality destroyed by the *Danganronpa* games, which showed me that there aren't practical limits to how off-the-rails a game's plot can be.

I have a <a href="https://backloggd.com/u/atctwo/">Backloggd</a> page where I keep track of what games I've played, but here's a quick look at what I've been playing recently:

<div class="game-card-container">

{% for game in site.data.games %}

    <div class="card game-card rainbow-border">

        {% if game.img_url %}
            <div class="card-img-top game-img-container">
                <img class="game-img" src="/assets/images/games/{{game.img_url}}" alt="{{game.img_alt}}">
                {% if game.img_credit %}
                <span class="game-img-credit" data-bs-toggle="tooltip" data-bs-title="{{game.img_credit}}">
                    {% if game.img_credit_href %} <a href="{{game.img_credit_href}}"> {% endif %}
                        <i class="bi bi-person-circle"></i>
                    {% if game.img_credit_href %} </a> {% endif %}
                </span>
                {% endif %}
            </div>
        {% endif %}

        <div class="card-body project-card-body">
            <h5 class="card-title">{{game.name}}</h5>
        </div>
    </div>

{% endfor %}

</div>

## How do you pronounce "atctwo"?
It's "a-t-c-2" (*eɪˈtiˈsiˈtu*).  

"atc" was a stupid nickname I made for myself when I was a kid, but it was too short to use on most websites.  I didn't want to have a digit in my username so I just spelt it out, making atctwo!




<!-- enable tooltips -->
<script>
    window.onload = () => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    }
</script>