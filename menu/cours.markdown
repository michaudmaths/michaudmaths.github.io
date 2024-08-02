---
layout: page
title: Cours & TD (Hypokhâgne)
permalink: /cours/
---

En construction...

<table class="container">
	<thead>
		<tr>
			<th></th>
			<th>Cours</th>
			<th>Exercices (TD)</th>
			<th>Annexes </th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Chapitre 1</td>
			<td> cours 1</td>
			<td> exercices 1</td>
			<td>annexe 1</td>
		</tr>
		<tr>
			<td>Chapitre 2</td>
			<td> cours 2</td>
			<td> exercices 2</td>
			<td></td>
		</tr>
		<tr>
			<td>Chapitre 3</td>
			<td> cours 3</td>
			<td> exercices 3</td>
			<td>annexe 3</td>
		</tr>

<ul> 

{% assign cours_counter = 1 %}
{% for pdf in site.static_files %}
    {% if pdf.path contains 'pdf' %}
    	{% assign string_to_delete = cours_counter | append: '.' %}
        <li> 
        <a href="{{ site.baseurl }}{{ pdf.path }}"> Chapitre {{cours_counter}} : {{pdf.basename | replace: string_to_delete , ''}} </a> 
        </li>
        {% assign cours_counter = cours_counter | plus:1 %}
    {% endif %}
{% endfor %}

</ul>


