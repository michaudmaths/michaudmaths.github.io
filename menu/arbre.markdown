---
layout: default
title: Arbre des connaissances
permalink: /arbre/
page_class: arbre
---

<script src="https://unpkg.com/cytoscape/dist/cytoscape.min.js"></script>

<script>
  const treeData = {{ site.data.graph | jsonify }};
</script>

<script src="https://cdn.jsdelivr.net/npm/marked@3.0.7/marked.min.js"></script>
<script src="https://unpkg.com/layout-base/layout-base.js"></script>
<script src="https://unpkg.com/cose-base/cose-base.js"></script>
  <script src="https://unpkg.com/cytoscape-node-html-label/dist/cytoscape-node-html-label.js"></script>
<script src="/assets/js/cytoscape-cose-bilkent.js"></script>
<script src="/assets/js/math-tree.js" defer></script>

  <!-- Graph container -->
<div id="graph"></div>
  
  <!-- Detail panel -->
<div id="panel-overlay"></div>
<div id="detail-panel">
  <div id="drag-handle"></div>
  <div id="panel-header">
    <h1 id="panel-title">Détails</h1>
    <div id="status-buttons">
      <button id = "button-acquis" onclick="setToAcquired()">Acquis</button>
      <button id = "button-retravailler" onclick="setToAccessible()">A travailler</button>
      <button id = "voir-prerequis" onclick="showPrerequisite()">Voir les prérequis</button>
    </div>
    <button id="close-panel">X</button>
  </div>
  <div id="panel-content">Sélectionnez un noeud pour voir les détails ici.</div>
</div>

<button onclick="downloadProgress()">Télécharger ma progression</button>
<input type="file" onchange="loadProgress(event)">

<button onclick="reset()">Tout réinitialiser</button>
