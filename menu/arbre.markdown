---
layout: default
title: Arbre des connaissances
permalink: /arbre/
page_class: arbre
---

<script src="https://unpkg.com/cytoscape/dist/cytoscape.min.js"></script>
<script src="https://unpkg.com/cytoscape-html@1.3.0/cytoscape-html.js"></script> <!-- Ensure this is loaded after Cytoscape -->
<script>
  const treeData = {{ site.data.math-tree | jsonify }};
  console.log(treeData);
</script>

<script src="/assets/js/math-tree.js" defer></script>

<div class="tree-container">
  <!-- Graph container -->
  <div id="graph"></div>
  
  <!-- Detail panel -->
  <div id="detail-panel">
    <h2>Détails</h2>
    <p>Sélectionnez une compétence pour voir les détails ici.</p>
  </div>
</div>

<button onclick="downloadProgress()">Télécharger ma progression</button>
<input type="file" onchange="loadProgress(event)">

