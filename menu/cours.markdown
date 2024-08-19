---
layout: page
title: Cours & TD (Hypokhâgne)
permalink: /cours/
---


{% assign cours_folder = site.data.files.cours_folder %}
{% assign exercices_folder = site.data.files.exercices_folder %}
{% assign annexes_folder = site.data.files.annexes_folder %}


{% assign chapitre_counter = 1 %}
{% for chapter in site.data.files.chapitres_hk %}
<div class="chapter">
	<h1 class="chapter-title">{{chapitre_counter}} - {{chapter.title}}</h1> 
	<div class="link-container">
	<div class="cours-exo">
	{% if chapter.cours %}
		<a href="{{cours_folder}}/{{chapter.cours}}.pdf"> 
			<i class="ri-book-2-fill"></i> Cours 
		</a> 
	{% else %}
		<div class="link-placeholder"> <i class="ri-book-2-fill"></i> Cours </div>
	{% endif%}
	{% if chapter.exercices %}
		<a href="{{exercices_folder}}/{{chapter.exercices}}.pdf">
			<i class="ri-puzzle-fill"></i> Exercices
		</a>
	{% else %}
		<div class="link-placeholder"> <i class="ri-puzzle-fill"></i> Exercices</div>
	{% endif %}
	</div>
	<div class="annexes">
	{% if chapter.annexes %}
		{% assign annexes_length = chapter.annexes | size %}
		{% for annexe in chapter.annexes %}
			<a href="{{annexes_folder}}/{{annexe.path}}.pdf">
				{{annexe.name}} 
			</a>
		{% endfor %}
	{% endif %}
	</div>
	</div>
</div>
{% assign chapitre_counter = chapitre_counter | plus:1 %}
{% endfor %}


<!-- {% assign cours_counter = 1 %}
{% for pdf in site.static_files %}
    {% if pdf.path contains 'pdf/cours' %}
    	{% assign string_to_delete = cours_counter | append: '.' %}
        <li> 
        <a href="{{ site.baseurl }}{{ pdf.path }}"> Chapitre {{cours_counter}} : {{pdf.basename | replace: string_to_delete , ''}} </a> 
        </li>
        {% assign cours_counter = cours_counter | plus:1 %}
    {% endif %}
{% endfor %} -->

