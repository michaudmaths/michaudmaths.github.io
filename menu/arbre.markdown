---
layout: default
title: Arbre des connaissances
permalink: /arbre/
page_class: arbre
---

<script src="https://unpkg.com/cytoscape/dist/cytoscape.min.js"></script>

<script>
  const treeData = {{ site.data.math-tree | jsonify }};
  console.log(treeData);
</script>

<script src="https://cdn.jsdelivr.net/npm/marked@3.0.7/marked.min.js"></script>

<script src="/assets/js/math-tree.js" defer></script>

  <!-- Graph container -->
<div id="graph"></div>
  
  <!-- Detail panel -->
<div id="panel-overlay"></div>
<div id="detail-panel">
  <div id="drag-handle"></div>
  <div id="panel-header">
    <h1 id="panel-title">Détails</h1>
    <button id="close-panel">X</button>
  </div>
  <div id="panel-content">Sélectionnez une compétence pour voir les détails ici.</div>
</div>

<button onclick="downloadProgress()">Télécharger ma progression</button>
<input type="file" onchange="loadProgress(event)">

<button onclick="setToAcquired()">Acquis</button>
<button onclick="setToAccessible()">A retravailler</button>
<button onclick="reset()">Tout réinitialiser</button>
