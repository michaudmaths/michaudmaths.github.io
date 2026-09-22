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
			<a href="{{site.baseurl}}/{{annexes_folder}}/tableau_derivee_web.pdf">
				<i class="ri-file-fill"></i> 
				<span> Tableau de dérivées </span>
			</a>
			<a href="{{site.baseurl}}/{{annexes_folder}}/fonctions_reference_merged_web.pdf">
				<i class="ri-file-fill"></i> 
				<span> Fonctions de références </span>
			</a>
		</div>
		<div class="annexes">
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

{% assign cours_prefixe = "cours_hk_" | append : chapitre_counter | append : "_" %}
{% assign exercice_prefixe = "td_hk_" | append : chapitre_counter | append : "_" %}
{% assign correction_prefixe = "corr_td_hk_" | append : chapitre_counter | append : "_" %}
{% assign correction_existe = 0 %}
{% assign exercices_existe = 0 %}
{% assign cours_existe = 0 %}
<div class="chapter">
	<h1 class="chapter-title">{{chapitre_counter}} - {{chapter.title}}</h1> 
	<div class="link-container">
		<div class="cours-exo">
		{% for item in site.static_files %}
			{% if item.path contains cours_prefixe %}
				{% assign cours_existe = 1 %}
			{% endif %}
			{% if item.path contains correction_prefixe %}
				{% assign correction_existe = 1 %}
			{% endif %}
			{% if item.path contains exercice_prefixe %}
				{% assign exercices_existe = 1 %}
			{% endif %}
		{% endfor %}
		{% if cours_existe == 1 %}
		{% for item in site.static_files %}
			{% if item.path contains cours_prefixe %}
				<a href="{{item.path}}"> 
					<i class="ri-book-2-fill"></i> 
					<span> Cours </span> 
				</a> 
			{% endif %}
		{% endfor %}
		{% else %}
			<div class="link-placeholder"> <i class="ri-book-2-fill"></i> Cours </div>
		{% endif %}
		{% if exercices_existe == 1 %}
			{% if correction_existe == 0 %}
				{% for item in site.static_files %}
					{% if item.path contains exercice_prefixe %}
					{% if item.path contains correction_prefixe %}
					{% else %}
						<a href="{{item.path}}">
							<i class="ri-puzzle-fill"></i>
							<span> TD {{chapitre_counter}} </span>
						</a>
					{% endif %}
					{% endif %}
				{% endfor %}
			{% else %}
				{% for item in site.static_files %}
					{% if item.path contains correction_prefixe %}
						<a href="{{item.path}}" class ="correction">
							<span> TD {{chapitre_counter}} (avec corrigé)</span>
						</a>
					{% endif %}
				{% endfor %}
			{% endif %}
		{% else %}
				<div class="link-placeholder"> <i class="ri-puzzle-fill"></i> TD {{chapitre_counter}}</div>
		{% endif %}
		</div>
		<div class="annexes">
		{% if chapter.annexes %}
			<div class="annexes-container">
			{% assign annexes_length = chapter.annexes | size %}
			{% for annexe in chapter.annexes %}
				<a href="{{site.baseurl}}/{{cours_folder}}/{{subfolder}}/cours/{{annexe.path}}_web.pdf">
					<i class="ri-file-fill"></i> 
					<span> {{annexe.name}} </span>
				</a>
			{% endfor %}
			</div>
		{% endif %}
		</div>
</div>
{% assign chapitre_counter = chapitre_counter | plus:1 %}
{% endfor %}
