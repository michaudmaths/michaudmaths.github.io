---
layout: page
title: Cours & TD (Hypokhâgne)
permalink: /cours/
---


En construction...


{% assign cours_folder = site.data.files.cours_folder %}
{% assign exercices_folder = site.data.files.exercices_folder %}
{% assign annexes_folder = site.data.files.annexes_folder %}


{% assign chapitre_counter = 1 %}
<div class="container">
<table>
	<thead>
		<tr>
			<th>Chapitre </th>
			<th>Cours</th>
			<th>Exercices (TD)</th>
			<th>Annexes </th>
		</tr>
	</thead>
	<tbody>
		{% for chapter in site.data.files.chapitres_hk %}
			<tr>
				<td class="chapter-title">{{chapitre_counter}} - {{chapter.title}}</td>
				<td> 
					{% if chapter.cours %}
						<a href="{{cours_folder}}/{{chapter.cours}}.pdf"> 
							Cours 
						</a> 
					{% endif%}
				</td>
				<td>
					{% if chapter.exercices %}
						<a href="{{exercices_folder}}/{{chapter.exercices}}.pdf">
							Exercices
						</a>
					{% endif %}
				</td>
				<td>
					{% if chapter.annexes %}
						{% assign annexes_length = chapter.annexes | size %}
						{% for annexe in chapter.annexes %}
							<a href="{{annexes_folder}}/{{annexe.path}}.pdf">
								{{annexe.name}} 
							</a>
							{% if annexes_length > 1  and forloop.index < annexes_length %}
								<span> ,</span>
							{% endif %}
						{% endfor %}
					{% endif %}
				</td>
			</tr>
		{% assign chapitre_counter = chapitre_counter | plus:1 %}
		{% endfor %}
	</tbody>
</table>
</div>


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

