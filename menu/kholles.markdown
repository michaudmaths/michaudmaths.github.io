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
{% assign file_name = "programme_kholle_" | append : semaine.numero | append : "_web" %}
{% for item in site.static_files %}
{% if item.path contains file_name %}
    <li>
        <a href="{{item.path}}">Programme de khôlle {{semaine.numero}}</a> (du {{semaine.date_debut}} au {{semaine.date_fin}})
        {% for demo in semaine.demo %}
            {% assign demo_name = "demo" | append : demo | append :"_web" %}
            {% for item in site.static_files %}
            {% assign folder = "Programme semaine " | append : semaine.numero %}
            {% if item.path contains folder %}
                {% if item.path contains demo_name %}
                    (<a href="{{item.path}}"> Demonstration n°{{demo}}</a>)
                {% endif %}
            {% endif %}
            {% endfor %}
        {% endfor %}
    </li>
{% endif %}
{% endfor %}
{% endfor %}
</ul>

</body>