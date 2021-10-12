---
layout: page
title: Tags
permalink: /tags/
---

This is where you'll find all of the blog post tags!<br>
Click on one to see all the posts in that tag.

<ul>
    {% for tag in site.tags %}
        <li><a href="/tags/{{ tag[0] }}">{{ tag[0] }}</a></li>
    {% endfor %}
</ul>
