---
layout: page
title: Cours & TD (Hypokhâgne)
permalink: /cours/
---


En construction...

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


