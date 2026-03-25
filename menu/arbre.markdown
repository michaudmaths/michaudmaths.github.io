---
layout: app
title: Arbre des connaissances
permalink: /arbre/
---

<script src="https://unpkg.com/cytoscape/dist/cytoscape.min.js"></script>


<script>
  const treeData = {{ site.data.graph | jsonify }};
  const nodePositions = {{ site.data.node_positions | jsonify }} 
</script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@4/tex-svg.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked@3.0.7/marked.min.js"></script>
<!-- <script src="https://unpkg.com/layout-base/layout-base.js"></script>
<script src="https://unpkg.com/cose-base/cose-base.js"></script>
<script src="https://unpkg.com/cytoscape-fcose/cytoscape-fcose.js"></script>
<script src="https://unpkg.com/cytoscape-node-html-label/dist/cytoscape-node-html-label.js"></script>
<script src="/assets/js/cytoscape-cose-bilkent.js"></script>
<script src="https://cdn.jsdelivr.net/npm/webcola@3.4.0/WebCola/cola.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cytoscape-cola@2.5.1/cytoscape-cola.min.js"></script> -->
<script src="https://unpkg.com/klayjs@0.4.1/klay.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cytoscape-klay@3.1.4/cytoscape-klay.min.js"></script>
<script src="/assets/js/math-tree.js" defer></script>

<div id="graph-container">
<div id="graph"></div>  
<div id="panel-overlay"></div>
<div id="tooltip"></div>
<div id="math-tooltip"></div>

<div id="progress-toggle" class="show-progress-up">
  <img src="/assets/svg/check.svg" class="progress-up" id="progress-up-button">
  <img src="/assets/svg/cross.svg" class="progress-down " id="progress-down-button">
</div>
<div id="detail-panel">
  <div id="drag-handle"></div>
  <div id="panel-header">
    <h1 id="panel-title">Détails</h1>
    <button id="close-panel">X</button>
  </div>
  <div id="panel-content">Sélectionnez un noeud pour voir les détails ici.</div>
</div>

<div id="settings-menu">
    <div id="gear-btn">
    <img
      src="/assets/svg/gear.svg"
      height="35"
      width="35"/>
    </div>
    <div id="menu-graph-dropdown" class="hidden">
      <button onclick="downloadProgress()" class="graph-menu-item">Télécharger ma progression</button>
      <label for="input_progress" class="graph-menu-item">Charger la progression</label>
      <input type="file" id = "input_progress" onchange="loadProgress(event)" class="hidden">
      <button onclick="downloadNodePositions()" class="graph-menu-item">Télécharger position des noeuds </button>
      <label for="input_positions" class="graph-menu-item"> Charger la position des noeuds</label>
      <input type="file" id = "input_positions" onchange="loadNodePositions(event)" class="hidden" >
      <button onclick="reset()" class="graph-menu-item">Réinitialiser la progression</button>
      <label class="menu-checkbox graph-menu-item" >
        <input type="checkbox" id="toggle-chapter-nodes" checked>
        Afficher les chapitres
      </label>
      <label class="menu-checkbox graph-menu-item" >
        <input type="checkbox" id="toggle-accessibles-nodes" checked>
        Afficher les noeuds inaccessibles
      </label>
      <label class="menu-checkbox graph-menu-item" >
        <input type="checkbox" id="toggle-tooltips" checked>
        Activer les tooltips
      </label>
    </div>
</div>
</div>