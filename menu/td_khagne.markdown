---
layout: page
title: TD (Khâgne)
permalink: /td_khagne/
---

{% assign td_counter = 1 %}
{% for td in site.data.files.td_khagne %}
{% assign td_name = "kh_td" | append : td_counter | append : "_" %}
{% assign corr_name = "corr_kh_td" | append : td_counter | append : "_" %}
{% assign ind_name = "indications_kh_td" | append : td_counter | append : "_" %}

{% assign enonce_existe = false %}
{% assign correction_existe = false %}
{% assign indication_existe = false %}

{% for item in site.static_files %}
    {% if item.path contains ind_name %}
        {% assign indication_existe = true %}
    {% endif %}
    {% if item.path contains corr_name %}
        {% assign correction_existe = true %}
    {% endif %}
    {% if item.path contains td_name %}
        {% assign enonce_existe = true %}
    {% endif %}
{% endfor %}

<div class="chapter">
	<h1 class="chapter-title">TD {{td_counter}} - {{td.title}}
    </h1> 
	<div class="link-container">
		<div class="cours-exo">
            {% if enonce_existe %}
                {% if correction_existe %}
                    {% for item1 in site.static_files %}
                        {% if item1.path contains corr_name %}
                            <a href="{{item1.path}}">
                                <i class="ri-puzzle-fill"></i>
                                <span>Énoncé avec corrigé</span>
                            </a>
                        {% endif %}
                    {% endfor %}
                {% else %}
                    {% for item1 in site.static_files %}
                        {% if item1.path contains td_name %}
                            <a href="{{item1.path}}">
                                <i class="ri-puzzle-fill"></i>
                                <span>Énoncé</span>
                            </a>
                        {% endif %}
                    {% endfor %}
                {% endif %}
            {% else %}
                <div class="link-placeholder"> 
                    <i class="ri-puzzle-fill"></i>
                    <span>Énoncé</span>
                </div>
            {% endif %}
            {% if indication_existe %}
                {% for item2 in site.static_files %}
                    {% if item2.path contains ind_name%}
                        <a href="{{item2.path}}">
                            <i class="ri-lightbulb-flash-fill"></i>
                            <span>Indications</span>
                        </a>
                    {% endif %}
                {% endfor %}
            {% else %}
                    <div class="link-placeholder"> 
                        <i class="ri-lightbulb-flash-fill"></i>
                        <span>Indications</span>
                    </div>
            {% endif %}
        </div>
    </div>
</div>
{% assign td_counter = td_counter | plus:1 %}
{% endfor %}
