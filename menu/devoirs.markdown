---
layout: page
title: Devoirs
permalink: /devoirs/
---



{% assign compteur_dst = 1 %}
{% assign compteur_dm = 1 %}
{% assign annee = 25 %}

<div class="chapter">
	<h1 class="chapter-title"> DST </h1> 
	<ul>
	{% for dst in site.data.files.dst %}
		<li> 
		{% assign devoir_filename = annee | append : "_DST"  | append : compteur_dst | append : "_web.pdf" %}
		{% assign correction_filename = annee | append : "correction_DST" | append : compteur_dst | append : "_web.pdf" %}
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
	{% assign compteur_dst = compteur_dst | plus : 1 %}
	{% endfor %}
	</ul>
</div>

<div class="chapter">
	<h1 class="chapter-title"> DM </h1> 
	<ul>
	{% for dm in site.data.files.dm %}
		<li> 
		{% assign devoir_filename =  annee | append : "_DM"  | append : compteur_dm | append : "_web.pdf" %}
		{% assign correction_filename = annee | append :"correction_DM" | append : compteur_dm | append : "_web.pdf" %}
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
	{% assign compteur_dm = compteur_dm | plus : 1 %}
	{% endfor %}
	</ul>
</div>
