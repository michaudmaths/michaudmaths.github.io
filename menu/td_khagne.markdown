---
layout: page
title: TD (Khâgne)
permalink: /td_khagne/
---

<ul>
{% for numero_td in (1..25) %}
{% assign td_name = "kh_td" | append : numero_td | append : "_" %}
{% assign corr_name = "corr_kh_td" | append : numero_td | append : "_" %}
    {% for item in site.static_files %}
    {% if item.path contains td_name %}
        {% if item.path contains corr_name%}
        {% else %}
            <li>
            <a href="{{item.path}}"> TD {{numero_td}}</a>
            {% for item2 in site.static_files %}
                {% if item2.path contains corr_name%}
                    (<a href="{{item2.path}}">avec correction</a>)
                {% endif %}
            {% endfor %}
            </li>
        {% endif %}
    {% endif %}
    {% endfor %}
{% endfor %}
</ul>