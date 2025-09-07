---
layout: page
permalink: /about/site_info
title: Site Info
hide_title: true
---

{% include about_nav.html %}

<h1>{{page.title}}</h1>

This page just lists a bunch of build-time Jekyll variables.  It's kind of like a debug page, although it's mostly here for anyone who is interested in this kind of stuff!


<table class="table">
    <tr>
        <td class="info-key">Site Name</td>
        <td class="info-value">{{site.title}}</td>
    </tr>
    <tr>
        <td class="info-key">Site Description</td>
        <td class="info-value">{{site.description}}</td>
    </tr>
    <tr>
        <td class="info-key">Site URL</td>
        <td class="info-value"><a href="{{site.url}}">{{site.url}}</a></td>
    </tr>
    <tr>
        <td class="info-key">Build Time</td>
        <td class="info-value">{{site.time}}</td>
    </tr>
    <tr>
        <td class="info-key">Build Hash</td>
        <td class="info-value"><a href="https://github.com/atctwo/atctwo.github.io/commit/{{site.data['hash']}}">{{site.data['hash']}}</a></td>
    </tr>
    <tr>
        <td class="info-key">Plugins</td>
        <td class="info-value">
            <ul>
                {% for p in site.plugins %}
                    <li>{{p}}</li>
                {% endfor %}
            </ul>
        </td>
    </tr>
    <tr>
        <td class="info-key">Jekyll Version</td>
        <td class="info-value">{{jekyll.version}}</td>
    </tr>
    <tr>
        <td class="info-key">Jekyll Environment</td>
        <td class="info-value">{{jekyll.environment}}</td>
    </tr>
    <tr>
        <td class="info-key">Pages</td>
        <td class="info-value">
            <ul>
                {% for p in site.pages %}
                    <li><a href="{{p.url}}">{% if p.title%} {{p.title}} {% else %} {{p.url}} {% endif %}</a></li>
                {% endfor %}
            </ul>
        </td>
    </tr>
    <tr>
        <td class="info-key">Posts</td>
        <td class="info-value">
            <ul>
                {% for p in site.posts %}
                    <li><a href="{{p.url}}">{% if p.title%} {{p.title}} {% else %} {{p.url}} {% endif %}</a></li>
                {% endfor %}
            </ul>
        </td>
    </tr>
    <!-- <tr>
        <td class="info-key">Site Data</td>
        <td class="info-value">
            {{site.data}}
        </td>
    </tr> -->
</table>