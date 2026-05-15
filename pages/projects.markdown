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

    .projects-container-inner-inner {
        padding: 25px;
        border: 6px solid #00ced1;
        border-radius: 20px;
        overflow-x: scroll;
    }

    .project-card-container {
        /* width: 100%; */
        display: flex;
        gap: 15px;
        justify-content: flex-start;
        min-height: 0;
    }

    .project-card-container-container {
        display: flex;
        flex: 1;
    }

    @media (max-width: 767px) {
        .project-card-container {
            justify-content: center;
        }
    }

    /* .project-card-link-btn {
        margin-bottom: 16px;
    } */

    .project-section-title {
        position: sticky;
        left: 0px;
        margin-bottom: 15px;
        font-size: 28pt;
    }

    .project-card {
        width: 18rem;
        height: 450px;
        border-radius: 15px;
    }

    img.card-img-top {
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
    }

    /* .project-card:hover {
        width: 19rem;
    } */

    .project-card-body {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .project-card-technology {
        width: 18px;
        margin: 2px;
        transition: width 0.25s;
    }
    .project-card-technology:hover {
        width: 32px;
    }
    .project-card-technology-container {
        margin-left: auto;
    }

    .project-card-footer {
        display: flex;
        align-items: center;
        /* margin-top: 14px; */
    }

</style>

<div class="projects-container-outer">

<h1 class="page-title">{{ page.title }}</h1>

<div style="margin-bottom: 20px;">
    Here you'll find a collection of most of my projects.  While most of my projects have a repository on my <a href="https://github.com/atctwo">GitHub</a>, I thought it would be good to bring them together in one page (including some that don't have GitHub repos).
</div>

<div class="projects-container-inner">

    {% for project_section in site.data.projects %}
        <div class="projects-container-inner-inner">

            <h1 class="project-section-title">{{project_section.section_name}}</h1>

            <div class="project-card-container-container">
                <div class="project-card-container">

                    {% for project in project_section.projects %}

                        <div class="card project-card">

                            {% if project.image %}
                                <img src="{{project.image}}" class="card-img-top" alt="{{project.name}}" alt="{{project.image_alt}}">
                            {% endif %}

                            <div class="card-body project-card-body">
                                <h5 class="card-title">{{project.name}}</h5>
                                <p class="card-text">{{project.description}}</p>

                                <div class="project-card-links">
                                    {% if project.link %}
                                        <a href="{{project.link}}" class="btn btn-primary project-card-link-btn rainbow-background" aria-label="Link to {{project.name}}"><i class="bi bi-link-45deg"></i> Link</a>
                                    {% endif %}
                                    {% if project.crates %}
                                        <a href="{{project.crates}}" class="btn btn-primary project-card-link-btn rainbow-background" aria-label="Crates.io page for {{project.name}}"><i class="bi bi-box-seam"></i> Crates.io</a>
                                    {% endif %}
                                    {% if project.codeberg %}
                                        <a href="{{project.codeberg}}" class="btn btn-primary project-card-link-btn rainbow-background" aria-label="codeberg repository for {{project.name}}"><img src="/assets/images/socials/Codeberg2.svg" style="height: 21.5px"> Codeberg</a>
                                    {% endif %}
                                    {% if project.github %}
                                        <a href="{{project.github}}" class="btn btn-primary project-card-link-btn rainbow-background" aria-label="GitHub repository for {{project.name}}"><i class="bi bi-github"></i> GitHub</a>
                                    {% endif %}
                                </div>
                            </div>
                            
                            <div class="card-footer project-card-footer">
                                {% if project.created or project.updated %}
                                    {% if project.created %}
                                        <small class="text-body-secondary">Created {{project.created}}</small>
                                    {% endif %}
                                    {% if project.created and project.updated %}<br>{% endif %}
                                    {% if project.updated %}
                                        <small class="text-body-secondary">Updated {{project.updated}}</small>
                                    {% endif %}
                                {% endif %}

                                <div class="project-card-technology-container">
                                    {% assign img_path = site.data.technologies.image_path %}
                                    {% for tech in project.technologies %}
                                        {% if site.data.technologies contains tech %}
                                            {% assign t = site.data.technologies[tech] %}
                                            {% if t.url %} <a href="{{t.url}}"> {% endif %}
                                                <img 
                                                    class="project-card-technology" 
                                                    src="{{img_path}}/{{t.icon}}" 
                                                    {% comment %} title="{{t.name}}" {% endcomment %}
                                                    title="{{t.name}}"
                                                    data-bs-toggle="tooltip"
                                                    data-bs-offset="0,20"
                                                    data-bs-delay='{"show": 500, "hide":50}'
                                                >
                                            {% if t.url %} </a> {% endif %}
                                        {% endif %}
                                    {% endfor %}
                                </div>
                            </div>
                        </div>
                    {% endfor %}
                </div>
            </div>
        </div>
        <br><br>

    {% endfor %}

    </div>
</div>







<script>

    function set_random_colour2(elements, theme=undefined) {
        let elems = document.querySelectorAll(elements);
        elems.forEach(elem => {

            let h, s, l, a, text;        

            h = (elem.dataset.hue) || (360 * Math.random())
            if ((theme || document.querySelector("html").dataset.bsTheme) == "dark") {
                s = 70 + 30 * Math.random()
                l = 65 + 10 * Math.random()
                text = "var(--bs-light)"
                a = "0.1";
            } else { // light mode
                s = 75 + 25 * Math.random()
                l = 25 + 25 * Math.random()
                text = "var(--bs-dark)"
                a = "0.7";
            }

            elem.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%, ${a})`;
            elem.style.color = text;
            elem.style.borderColor = `hsl(${h}, ${s}%, ${l}%)`;


        });
    }

    function ginger_root() {
        set_random_colour2(".projects-container-inner-inner");
    }

    document.addEventListener("DOMContentLoaded", ginger_root);
    document.addEventListener("colour_update", ginger_root);

</script>