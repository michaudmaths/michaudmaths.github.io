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
{% if item.path contains "Programme semaine" %}
    <li>
        <a href="{{item.path}}">Programme de khôlle {{semaine_compteur}}</a>
    </li>
{% assign semaine_compteur = semaine_compteur | plus:1 %}
{% endif %}
{% endfor %}
</ul>

</body>