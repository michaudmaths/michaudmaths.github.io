---
layout: page
title: Programmes de khôlles
permalink: /kholles/
---


<h1> Programmes de khôlles : </h1>


{% assign kholles_folder = site.data.files.kholles_folder %}

<body>
<ul>
{% for semaine in site.data.files.kholles_hk %}
{% for item in site.static_files %}
{% assign file_name = "programme_semaine_" | append : semaine.numero | append : "_web" %}
{% if item.path contains file_name %}
    <li>
        <a href="{{item.path}}">Programme de khôlle {{semaine.numero}}</a> (du {{semaine.date_debut}} au {{semaine.date_fin}})
    </li>
{% endif %}
{% endfor %}
{% endfor %}
</ul>

</body>