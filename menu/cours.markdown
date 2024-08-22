---
layout: page
title: Cours & TD (Hypokhâgne)
permalink: /cours/
---


{% assign cours_folder = site.data.files.cours_folder %}
{% assign exercices_folder = site.data.files.exercices_folder %}
{% assign annexes_folder = site.data.files.annexes_folder %}

<div class="chapter">
	<h1 class="chapter-title">Quelques rappels</h1> 
	<div class="link-container">
		<div class="annexes">
			<a href="{{site.baseurl}}/{{annexes_folder}}/lexique_mathematique.pdf">
				<i class="ri-file-fill"></i> 
				<span> Lexique mathématique </span>
			</a>
			<a href="{{site.baseurl}}/{{annexes_folder}}/tableau_derivees.pdf">
				<i class="ri-file-fill"></i> 
				<span> Tableau de dérivées </span>
			</a>
			<a href="{{site.baseurl}}/{{annexes_folder}}/fonctions_reference.pdf">
				<i class="ri-file-fill"></i> 
				<span> Fonctions de références </span>
			</a>
			<a href="{{site.baseurl}}/{{annexes_folder}}/exp_ln.pdf">
				<i class="ri-file-fill"></i> 
				<span> Exponentielle et logarithme </span>
			</a>
		</div>
	</div>
</div>


{% assign chapitre_counter = 1 %}
{% for chapter in site.data.files.chapitres_hk %}
{% assign subfolder = chapitre_counter| append: "-" | append: chapter.title %}
<div class="chapter">
	<h1 class="chapter-title">{{chapitre_counter}} - {{chapter.title}}</h1> 
	<div class="link-container">
	<div class="cours-exo">
	{% if chapter.cours %}
		<a href="{{site.baseurl}}/{{cours_folder}}/{{subfolder}}/cours/{{chapter.cours}}_web.pdf"> 
			<i class="ri-book-2-fill"></i> 
			<span> Cours </span> 
		</a> 
	{% else %}
		<div class="link-placeholder"> <i class="ri-book-2-fill"></i> Cours </div>
	{% endif%}
	{% if chapter.exercices %}
		<a href="{{site.baseurl}}/{{exercices_folder}}/{{subfolder}}/exercices/{{chapter.exercices}}_web.pdf">
			<i class="ri-puzzle-fill"></i> 
			<span> Exercices </span>
		</a>
	{% else %}
		<div class="link-placeholder"> <i class="ri-puzzle-fill"></i> Exercices</div>
	{% endif %}
	</div>
	<div class="annexes">
	{% if chapter.annexes %}
		{% assign annexes_length = chapter.annexes | size %}
		{% for annexe in chapter.annexes %}
			<a href="{{site.baseurl}}/{{annexes_folder}}/{{subfolder}}/{{annexe.path}}_web.pdf">
				<i class="ri-file-fill"></i> 
				<span> {{annexe.name}} </span>
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

