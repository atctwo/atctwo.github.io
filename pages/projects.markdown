---
layout: page
title: Projects
permalink: /projects/
main_content_class: ""
hide_title: true
---

<style>
    .projects-container-outer {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .projects-container-outer > * {
        width: 80%;
    }

    .project-card-container {
        /* width: 100%; */
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: flex-start;
    }

    .project-card-container-container {
        width: 100%;
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: center;
    }

    @media (max-width: 767px) {
        .project-card-container {
            justify-content: center;
        }
    }

    /* .project-card-link-btn {
        margin-bottom: 16px;
    } */
</style>

<div class="projects-container-outer">

<h1 class="page-title">{{ page.title }}</h1>

<div style="margin-bottom: 20px;">
    Here you'll find a collection of most of my projects.  While most of my projects have a repository on my <a href="https://github.com/atctwo">GitHub</a>, I thought it would be good to bring them together in one page (including some that don't have GitHub repos).
</div>

<div class="projects-container-inner">

{% for project_section in site.data.projects %}

<h2>{{project_section.section_name}}</h2>
<!-- <div class="project-card-container-container"> -->

<div class="project-card-container">

{% for project in project_section.projects %}

    <div class="card" style="width: 18rem;">

        {% if project.image %}
            <img src="{{project.image}}" class="card-img-top" alt="{{project.name}}" alt="{{project.image_alt}}">
        {% endif %}

        <div class="card-body">
            <h5 class="card-title">{{project.name}}</h5>
            <p class="card-text">{{project.description}}</p>

            {% if project.link %}
                <a href="{{project.link}}" class="btn btn-primary project-card-link-btn" aria-label="Link to {{project.name}}"><i class="bi bi-link-45deg"></i> Link</a>
            {% endif %}
            {% if project.crates %}
                <a href="{{project.crates}}" class="btn btn-primary project-card-link-btn" aria-label="Crates.io page for {{project.name}}"><i class="bi bi-box-seam"></i> Crates.io</a>
            {% endif %}
            {% if project.github %}
                <a href="{{project.github}}" class="btn btn-primary" aria-label="GitHub repository for {{project.name}}"><i class="bi bi-github"></i> GitHub</a>
            {% endif %}
        </div>
        
        {% if project.created or project.updated %}
            <div class="card-footer">
                {% if project.created %}
                    <small class="text-body-secondary">Created {{project.created}}</small>
                {% endif %}
                {% if project.created and project.updated %}<br>{% endif %}
                {% if project.updated %}
                    <small class="text-body-secondary">Updated {{project.updated}}</small>
                {% endif %}
            </div>
        {% endif %}
    </div>
    
{% endfor %}

<!-- </div> -->

</div>
<br>

{% endfor %}

</div>
</div>