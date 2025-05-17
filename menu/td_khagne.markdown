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

{% assign enonce_existe = 0 %}
{% assign correction_existe = 0 %}
{% assign indication_existe = 0 %}
<div class="chapter">
	<h1 class="chapter-title">TD {{td_counter}} - {{td.title}}
    </h1> 
	<div class="link-container">
		<div class="cours-exo">
            {% for item1 in site.static_files %}
                {% if item1.path contains corr_name %}
                {% elsif item1.path contains ind_name %}
                {% elsif item1.path contains td_name%}
                    {% assign enonce_existe = 1 %}
                    <a href="{{item1.path}}">
                        <i class="ri-puzzle-fill"></i>
                        <span>Énoncé</span>
                    </a>
                {% endif %}
            {% endfor %}
            {% if enonce_existe == 0 %}
                            <div class="link-placeholder"> 
                                <i class="ri-puzzle-fill"></i>
                                <span>Énoncé</span>
                            </div>
            {% endif %}
            {% for item2 in site.static_files %}
                {% if item2.path contains ind_name%}
                    {% assign indication_existe = 1 %}
                    <a href="{{item2.path}}">
                        <i class="ri-lightbulb-flash-fill"></i>
                        <span>Indications</span>
                    </a>
                {% endif %}
            {% endfor %}
            {% if indication_existe == 0 %}
                    <div class="link-placeholder"> 
                        <i class="ri-lightbulb-flash-fill"></i>
                        <span>Indications</span>
                    </div>
            {% endif %}
            {% for item3 in site.static_files %}
                {% if item3.path contains corr_name%}
                    {% assign correction_existe = 1 %}
                    <a href="{{item3.path}}"> 
                        <i class="ri-file-fill"></i> 
                        <span>Corrigés</span>
                    </a>
                {% endif %}
            {% endfor %}
            {% if correction_existe == 0 %}
                    <div class="link-placeholder"> 
                        <i class="ri-file-fill"></i> 
                        <span>Corrigés</span>
                    </div>
            {% endif %}
        </div>
    </div>
</div>
{% assign td_counter = td_counter | plus:1 %}
{% endfor %}
