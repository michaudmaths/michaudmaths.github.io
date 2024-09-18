---
layout: page
title: TD (Khâgne)
permalink: /td_khagne/
---

{% assign td_counter = 1 %}
{% for td in site.data.files.td_khagne %}
{% assign td_name = "kh_td" | append : td_counter | append : "_" %}
{% assign corr_name = "corr_kh_td" | append : td_counter | append : "_" %}
{% assign ind_name = "indications_kh_td" | append : td_counter | append : "_" %}

<div class="chapter">
	<h1 class="chapter-title">TD {{td_counter}} - {{td.title}}</h1> 
	<div class="link-container">
		<div class="cours-exo">
        {% for item in site.static_files %}
        {% if item.path contains td_name %}
            {% if item.path contains corr_name%}
            {% else %}
                <a href="{{item.path}}"> 
					<i class="ri-puzzle-fill"></i> 
                    <span>Enoncés</span>
                </a>
                {% for item2 in site.static_files %}
                    {% if item2.path contains ind_name%}
                        <a href="{{item2.path}}">
                            <i class="ri-lightbulb-flash-fill"></i>
                            <span>Indications</span>
                        </a>
                    {% endif %}
                {% endfor %}
                {% for item3 in site.static_files %}
                    {% if item3.path contains corr_name%}
                        <a href="{{item3.path}}"> 
                            <i class="ri-file-fill"></i> 
                            <span>Enoncés et corrigés</span>
                        </a>
                    {% endif %}
                {% endfor %}
            {% endif %}
        {% endif %}
        {% endfor %}
        </div>
    </div>
</div>
{% assign td_counter = td_counter | plus:1 %}
{% endfor %}
