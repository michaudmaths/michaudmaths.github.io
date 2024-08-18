---
layout: page
title: Programmes de khôlles
permalink: /kholles/
---


<h1> Programmes de khôlles : </h1>

<body>
<ul>
{% for quinzaine in site.data.files.kholles_hk %}
    <li> 
        <a href="{{site.baseurl}}/programme de kholle {{quinzaine.num}}.pdf">Programme du {{quinzaine.date_debut}} au {{quinzaine.date_fin}} </a>
    </li>
{% endfor %}
</ul>
</body>