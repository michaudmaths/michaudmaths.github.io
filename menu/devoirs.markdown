---
layout: page
title: Devoirs
permalink: /devoirs/
---



{% assign devoirs_counter = 1 %}
{% for devoir in site.data.files.devoirs %}

{% assign devoir_prefixe = "DST" | append : devoirs_counter %}
{% assign correction_prefixe = "correction_DST" | append : devoirs_counter %}

{% assign correction_existe = 0 %}

<div class="chapter">
	<h1 class="chapter-title"> DST n°{{devoirs_counter}}  -  {{devoir.date}}</h1> 
	<div class="link-container">
        <div class="cours-exo">
            {% for item in site.static_files %}
            {% if item.path contains correction_prefixe %}
            {% else %}
			{% if item.path contains devoir_prefixe %}
				<a href="{{item.path}}"> 
					<i class="ri-book-2-fill"></i> 
					<span> Sujet </span> 
				</a> 
			{% endif %}
            {% endif %}
		    {% endfor %}
            {% for item in site.static_files %}
			{% if item.path contains correction_prefixe %}
				{% assign correction_existe = 1 %}
				<a href="{{item.path}}">
                            <i class="ri-file-fill"></i> 
					<span> Corrigé </span>
				</a>
			{% endif %}
            {% endfor %}
            {% if exercices_existe == 0 %}
                    <div class="link-placeholder"> <i class="ri-puzzle-fill"></i> Corrigé </div>
            {% endif %}
        </div>
    </div>
</div>
{% endfor %}
