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
			<a href="{{site.baseurl}}/{{annexes_folder}}/lexique_mathematique_web.pdf">
				<i class="ri-file-fill"></i> 
				<span> Lexique mathématique </span>
			</a>
			<a href="{{site.baseurl}}/{{annexes_folder}}/tableau_derivees_web.pdf">
				<i class="ri-file-fill"></i> 
				<span> Tableau de dérivées </span>
			</a>
			<a href="{{site.baseurl}}/{{annexes_folder}}/fonctions_reference_merged_web.pdf">
				<i class="ri-file-fill"></i> 
				<span> Fonctions de références </span>
			</a>
			<a href="{{site.baseurl}}/{{annexes_folder}}/poster_exp_ln_web.pdf">
				<i class="ri-file-fill"></i> 
				<span> Exponentielle et logarithme </span>
			</a>
			<a href="{{site.baseurl}}/{{annexes_folder}}/hk_td0_etude_fonctions_web.pdf">
				<i class="ri-puzzle-fill"></i> 
				<span> TD 0 : études de fonctions </span>
			</a>
			(<a href="{{site.baseurl}}/{{annexes_folder}}/corr_hk_td0_etude_fonctions_web.pdf">
				<i class="ri-file-fill"></i> 
				<span> avec correction </span>
			</a>)
		</div>
	</div>
</div>

{% assign chapitre_counter = 1 %}
{% for chapter in site.data.files.chapitres_hk %}
{% assign subfolder = chapitre_counter| append: "-" | append: chapter.title %}

{% assign chapitre_prefixe = "cours_hk_" | append : chapitre_counter | append : "_" %}
{% assign exercice_prefixe = "exercices_approfondissement_hk_" | append : chapitre_counter | append : "_" %}
{% assign correction_exercice_prefixe = "corr_exercices_approfondissement_hk_" | append : chapitre_counter | append : "_" %}
{% assign exercices_existe = 0 %}
<div class="chapter">
	<h1 class="chapter-title">{{chapitre_counter}} - {{chapter.title}}</h1> 
	<div class="link-container">
		<div class="cours-exo">
		{% for item in site.static_files %}
			{% if item.path contains chapitre_prefixe %}
				<a href="{{item.path}}"> 
					<i class="ri-book-2-fill"></i> 
					<span> Cours </span> 
				</a> 
			{% endif %}
		{% endfor %}
		{% for item in site.static_files %}
			{% if item.path contains exercice_prefixe %}
			{% if item.path contains correction_exercice_prefixe %}
			{% else %}
				{% assign exercices_existe = 1 %}
				<a href="{{item.path}}">
					<i class="ri-puzzle-fill"></i> 
					<span> TD {{chapitre_counter}} </span>
				</a>
			{% endif %}
			{% endif %}
		{% endfor %}
		{% if exercices_existe == 0 %}
				<div class="link-placeholder"> <i class="ri-puzzle-fill"></i> TD {{chapitre_counter}}</div>
			{% endif %}
		{% for item in site.static_files %}
			{% if item.path contains correction_exercice_prefixe %}
				<a href="{{item.path}}" class ="correction">
					<span> (Correction) </span>
				</a>
			{% endif %}
		{% endfor %}
		</div>
		<div class="annexes">
		{% if chapter.annexes %}
			{% assign annexes_length = chapter.annexes | size %}
			{% for annexe in chapter.annexes %}
				<a href="{{site.baseurl}}/{{cours_folder}}/{{subfolder}}/cours/{{annexe.path}}_web.pdf">
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