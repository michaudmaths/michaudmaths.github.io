---
layout: page
title: Programmes de khôlles
permalink: /kholles/
---


<h1> Programmes de khôlles : </h1>


{% assign kholles_folder = site.data.files.kholles_folder %}

<body>
<ul>
{% assign semaine_compteur = 1 %}
{% for item in site.static_files %}
{% assign folder_name = "Programme semaine " | append : semaine_compteur %}
{% if item.path contains folder_name %}
    {% assign date_debut = "" %}
    {% assign date_fin = "" %}
    {% for semaine in site.data.files.kholles_hk %}
        {% if semaine.numero == semaine_compteur %}
            {% assign date_debut = semaine.date_debut %}
            {% assign date_fin = semaine.date_fin %}
        {% endif %}
    {% endfor %}
    <li>
        <a href="{{item.path}}">Programme de khôlle {{semaine_compteur}}</a> (du {{date_debut}} au {{date_fin}})
    </li>
{% assign semaine_compteur = semaine_compteur | plus:1 %}
{% endif %}
{% endfor %}
</ul>

</body>