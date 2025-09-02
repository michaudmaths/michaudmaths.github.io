---
layout: page
title: Anciens devoirs
permalink: /anciens_devoirs/
---


{% for archive in site.data.files.anciens_devoirs %}
{% assign next_year = archive.year | plus : 1 %}
{% assign next_year = 20 | append : next_year %}
{% assign annee_formatee = 20 | append : archive.year | append : "-" | append : next_year %}

<h1> Année {{annee_formatee}} </h1>
{% assign year = archive.year %}
{% assign nombre_dst = archive.nombre_dst %}
{% assign nombre_dm = archive.nombre_dm %}



<div class="chapter">
	<h1 class="chapter-title"> DST </h1> 
	<ul>
	{% for compteur_dst in (1..{{nombre_dst}}) %}
	<li> 
		{% assign devoir_filename = year | append : "_" | append : "DST"  | append : compteur_dst | append : "_web.pdf" %}
		{% assign correction_filename = year | append : "_" | append : "correction_DST" | append : compteur_dst | append : "_web.pdf" %}
		{% assign correction_existe = 0 %}

		{% for item in site.static_files %}
			{% if item.name == {{devoir_filename}} %}
				<a href="{{item.path}}"> 
					<span> DST {{compteur_dst}} </span> 
				</a> 
			{% endif %}
		{% endfor %}
		{% for item in site.static_files %}
			{% if item.name == {{correction_filename}} %}
				{% assign correction_existe = 1 %}
				<a href="{{item.path}}">
					<span> Corrigé </span>
				</a>
			{% endif %}
		{% endfor %}
	</li>
	{% endfor %}
	</ul>
</div>

<div class="chapter">
	<h1 class="chapter-title"> DM </h1> 
	<ul>
	{% for compteur_dm in (1..{{nombre_dm}}) %}
	<li> 
		{% assign devoir_filename = year | append : "_" | append : "DM"  | append : compteur_dm | append : "_web.pdf" %}
		{% assign correction_filename = year | append : "_" | append : "correction_DM" | append : compteur_dm | append : "_web.pdf" %}
		{% assign correction_existe = 0 %}

		{% for item in site.static_files %}
			{% if item.name == {{devoir_filename}} %}
				<a href="{{item.path}}"> 
					<span> DM {{compteur_dm}} </span> 
				</a> 
			{% endif %}
		{% endfor %}
		{% for item in site.static_files %}
			{% if item.name == {{correction_filename}} %}
				{% assign correction_existe = 1 %}
				<a href="{{item.path}}">
					<span> Corrigé </span>
				</a>
			{% endif %}
		{% endfor %}
	</li>
	{% endfor %}
	</ul>
</div>

{% endfor %}