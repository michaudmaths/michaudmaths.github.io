---
layout: page
title: Programmes de khôlles
permalink: /kholles/
---


<h1> Programmes de khôlles : </h1>


{% assign kholles_folder = site.data.files.kholles_folder %}

<body>
<ul>
{% assign quinzaine_compteur = 1 %}
{% for item in site.static_files %}
{% if item.path contains "Programme quinzaine" %}
    <li>
        <a href="{{item.path}}">Programme de khôlle {{quinzaine_compteur}}</a>
    </li>
{% assign quinzaine_compteur = quinzaine_compteur | plus:1 %}
{% endif %}
{% endfor %}
</ul>

</body>