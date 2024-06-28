---
layout: page
permalink: /doodles/
title: Doodles
---

<style>
    .doodle-icon-container {
        width: 64px;
        height: 64px;
    }
    .doodle-icon {
        object-fit: contain;
        padding: 0.1rem;
    }
</style>

Welcome to an assortment of really random useless stuff.  Most of the things here are short sketches that I thought would be worth hosting on the internet.  They're not very high effort but hopefully you find them useful or fun!

<table class="post-table">
    {% for doodle in site.data.doodles %}

        <tr>
            {% if doodle.icon %}
                <td class="doodle-icon-container">
                    <a href='{{doodle.link}}'>
                        <img src="{{doodle.icon}}" class="doodle-icon img-thumbnail">
                    </a>
                </td>
            {% else %}
                <td class="doodle-icon-container"></td>
            {% endif %}

            <td><a href='{{doodle.link}}'>{{doodle.name}}</a></td>
            
            {% if doodle.date %}
                <td class="text-body-tertiary">{{doodle.date}}</td>
            {% else %}
                <td class="text-body-tertiary">Unknown Date</td>
            {% endif %}
        </tr>

    {% endfor %}
</table><br>

<body>
    <span id="notice"></span>
</body>

<script src="chance.js"></script>

<script>
    document.getElementById("notice").innerHTML = ("atctwo.net is not endorsed by " + chance.company() );
</script>
