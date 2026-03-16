const panel = document.getElementById("detail-panel");
const overlay = document.getElementById("panel-overlay");
const detailPanelTitle = document.getElementById("panel-title");
const detailPanelContent = document.getElementById("panel-content");
const closeBtn = document.getElementById("close-panel");
const handle = document.getElementById("drag-handle");



// Charger progrès depuis le storage local
let progress = JSON.parse(localStorage.getItem("mathProgress") || "{}");

// Charger la position des noeuds depuis le storage local
let storedNodePositions = JSON.parse(localStorage.getItem("storedNodePositions")) || nodePositions;


// pas encore implémenté : pour modifier la forme des noeuds en fonction du type
const typeShape = {
  definition: { 'shape' : 'round-rectangle' },
  theorem: { 'shape': 'round-rectangle'},
  example: { 'shape': 'round-rectangle'},
  exercise: { 'shape': 'round-rectangle'},
};

// Couleurs
const statusColors = {
  'unavailable': "#888",
  'current': "#3ab218",
  'acquired': "#0e3dc0"
};

const chapterToColor = [
  {title: "1 - Trigonométrie", color : "#8e44ad"},
  {title: "2 - Logique" , color : "#3ab218"},
  {title: "3 - Ensembles et applications" , color: "#0e3dc0"},
  {title: "4 - Entiers, sommes, récurrence", color: "#d35400"},
  {title: "5 - Nombres réels" , color : "#27ae60"},
  {title : "6 - Suites numériques" , color : "#2980b9"},
  {title: "7 - Fonction réelle de la variable réelle" , color : "#c0392b"},
  {title: "8 - Espaces probabilisés" , color : "#2c3e50"}
];

const statusVarColors = {
  // 0.5 = couleur d'origine, 0 = blanc, 1 = noir
  'unavailable': 0.95,
  'current': 0.8,
  'acquired': 0.6
}

const styleListForChapterColor = chapterToColor.flatMap(chapter => [
  {
    selector: `node[category = "${chapter.title}"].chapter-label`,
    style: {
      'color' : chapter.color,
      'text-background-color' : changeColor(chapter.color,0.9),
    }
  },
  {
    selector: `node[category = "${chapter.title}"].unavailable`,
    style: {
      'background-color': changeColor(chapter.color, statusVarColors.unavailable),
      'border-color': changeColor(chapter.color, statusVarColors.unavailable*0.9),
    }
  },
  {
    selector: `node[category = "${chapter.title}"].current`,
    style: {
      'background-color': changeColor(chapter.color, statusVarColors.current),
      'border-color': changeColor(chapter.color, statusVarColors.current*0.7),
    }
  },
  {
    selector: `node[category = "${chapter.title}"].acquired`,
    style: {
      'background-color': changeColor(chapter.color, statusVarColors.acquired),
      'border-color': changeColor(chapter.color, statusVarColors.acquired*0.6),
    }
  }
]);

// fonction pour shifter une couleur vers + foncé ou + clair (selon que factor>0.5 ou <0.5)
function changeColor(color, factor) { // factor ∈ [0,1]
  const clamp = (val) => Math.min(Math.max(val, 0), 255)
  const fill = (str) => ('00' + str).slice(-2)

  const num = parseInt(color.slice(1), 16)

  const r = num >> 16
  const g = (num >> 8) & 0x00FF
  const b = num & 0x00FF

  let newR, newG, newB

  if (factor <= 0.5) {
    // noir -> couleur
    const t = factor / 0.5
    newR = clamp(Math.round(r * t))
    newG = clamp(Math.round(g * t))
    newB = clamp(Math.round(b * t))
  } else {
    // couleur -> blanc
    const t = (factor - 0.5) / 0.5
    newR = clamp(Math.round(r + (255 - r) * t))
    newG = clamp(Math.round(g + (255 - g) * t))
    newB = clamp(Math.round(b + (255 - b) * t))
  }

  return '#' + fill(newR.toString(16)) + fill(newG.toString(16)) + fill(newB.toString(16))
}

// Focntion qui sera appelée une fois avant l'instantiation.
function setColors() {
  treeData.nodes.forEach(n => {
    if (progress[n.data.id]) {
      n.classes.push('acquired');
    } else if (isAccessible(n.data.id)) {
      n.classes.push('current')
    } else {
      n.classes.push('unavailable');
    }
  });
  treeData.edges.forEach(e => {
    const sourceAcquired = progress[e.data.source];
    if (sourceAcquired) {
      e.classes.push('parent-acquired');
    } 
  })
}

setColors()

// Trois options de layout, en choisir une des trois à parser dans la commande suivante 
var presetLayoutoptions = {
  positions: storedNodePositions,
  zoom: undefined, // the zoom level to set (prob want fit = false if set)
  pan: undefined, // the pan level to set (prob want fit = false if set)
  fit: true, // whether to fit to viewport
  padding: 30, // padding on fit
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  animate: true, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
  ready: undefined, // callback on layoutready
  stop: undefined, // callback on layoutstop
  transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
};

var fcoseLayoutOptions = {
  // 'draft', 'default' or 'proof' 
  // - "draft" only applies spectral layout 
  // - "default" improves the quality with incremental layout (fast cooling rate)
  // - "proof" improves the quality with incremental layout (slow cooling rate) 
  quality: "default",
  // Use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  randomize: false, 
  // Whether or not to animate the layout
  animate: true, 
  // Duration of animation in ms, if enabled
  animationDuration: 1000, 
  // Easing of animation, if enabled
  animationEasing: undefined, 
  // Fit the viewport to the repositioned nodes
  fit: true, 
  // Padding around layout
  padding: 30,
  // Whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: false,
  // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
  uniformNodeDimensions: false,
  // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
  packComponents: true,
  // Layout step - all, transformed, enforced, cose - for debug purpose only
  step: "all",
  
  /* spectral layout options */
  
  // False for random, true for greedy sampling
  samplingType: true,
  // Sample size to construct distance matrix
  sampleSize: 25,
  // Separation amount between nodes
  nodeSeparation: 200,
  // Power iteration tolerance
  piTol: 0.0000001,
  
  /* incremental layout options */
  
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: node => 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: edge => 200,
  // Divisor to compute edge forces
  edgeElasticity: edge => 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
  numIter: 2500,
  // For enabling tiling
  tile: true,
  // The comparison function to be used while sorting nodes during tiling operation.
  // Takes the ids of 2 nodes that will be compared as a parameter and the default tiling operation is performed when this option is not set.
  // It works similar to ``compareFunction`` parameter of ``Array.prototype.sort()``
  // If node1 is less then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a negative value
  // If node1 is greater then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a positive value
  // If node1 is equal to node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return 0
  tilingCompareBy: undefined, 
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity force (constant)
  gravity: 0.25,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8, 
  // Initial cooling factor for incremental layout  
  initialEnergyOnIncremental: 0.3,

  /* constraint options */

  // Fix desired nodes to predefined positions
  // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
  fixedNodeConstraint: storedNodePositions    ,
  // Align desired nodes in vertical/horizontal direction
  // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
  alignmentConstraint: undefined,
  // Place two nodes relatively in vertical/horizontal direction
  // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
  relativePlacementConstraint: undefined,

  /* layout event callbacks */
  ready: () => {}, // on layoutready
  stop: () => {} // on layoutstop
};

var coseBilkentLayoutOptions = {
  ready: function () {
  },
  // Called on `layoutstop`
  stop: function () {
  },
  // 'draft', 'default' or 'proof" 
  // - 'draft' fast cooling rate 
  // - 'default' moderate cooling rate 
  // - "proof" slow cooling rate
  quality: 'default',
  // Whether to include labels in node dimensions. Useful for avoiding label overlap
  nodeDimensionsIncludeLabels: true,
  // number of ticks per frame; higher is faster but more jerky
  refresh: 30,
  // Whether to fit the network view after when done
  fit: true,
  // Padding on fit
  padding: 30,
  // Whether to enable incremental mode
  randomize: true,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal (intra-graph) edge length
  idealEdgeLength: 200,
  // Divisor to compute edge forces
  edgeElasticity: 0.2,
  // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
  nestingFactor: .01,
  // Gravity force (constant)
  gravity: 0.25,
  // Maximum number of iterations to perform
  numIter: 2500,
  // Whether to tile disconnected nodes
  tile: true,
  // Type of layout animation. The option set is {'during', 'end', false}
  animate: 'true',
  // Duration for animate:end
  animationDuration: 500,
  // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingVertical: 10,
  // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.5
};

var layouNametToOptions = {
  'preset': presetLayoutoptions,
  'fcose': fcoseLayoutOptions,
  'cose-bilkent': coseBilkentLayoutOptions
}
  
var layoutName = 'preset'
// Instantiation du graphe
const cy = cytoscape({
  container: document.getElementById('graph'),
  elements: [...treeData.nodes, ...treeData.edges],
  layout : {
    name: layoutName,
    ...layouNametToOptions[layoutName]
  },
  style: [
    {
      selector: 'node',
      style: {
        'shape': 'round-rectangle',
        'width': '250px',
        'height': '50px',
        'border-width': '2px',
        'overlay-opacity': 0,
        //'label': '', // Add label to display node title
        'text-valign': 'center',
        'text-halign': 'center',
        'font-weight': 'bold',
        'text-wrap': 'wrap',
        'text-max-width': '230px',
        'color': '#000',
        'font-size': '18px',
        'transition-property': 'width height font-size background-color border-color color',
        'transition-duration' : '500ms',
      }
    },
    {
      selector: ':parent',
      style: {
        'padding': '20px',
        'background-opacity': 0.05,
        // 'events' : 'no', // A remettre ensuite, plus facile pour manipuler
      }
    },
    {
      selector : 'node.unavailable.hidden',
      style: {
        'text-opacity': 0,
        'background-opacity': 0,
        'border-opacity': 0,
        'events' : 'no'
      }
    },
    {
      selector : 'node.chapter-node.hidden',
      style: {
        'text-opacity': 0,
        'background-opacity': 0,
        'border-opacity': 0,
        'events' : 'no'
      }
    },
    {
      selector : 'node.chapter-label.hidden',
      style: {
        'text-opacity': 0,
        'background-opacity': 0,
        'border-opacity': 0,
        'events' : 'no'
      }
    },
    {
      selector: 'node.chapter-label',
      style:{
        'width':'150px',
        'height':'20px',
        'border-width': '0px',
        'label':'data(label)',
        'text-wrap': 'none',
        'background-opacity': 0.05,
        'text-background-opacity' : 1,
        'font-size': '30px',
        // 'events' : 'no',// A remettre ensuite, plus facile pour manipuler
      },
    },
    {
      selector: 'node.hover',
      style: {
        'width': '275px',
        'height': '55px',
      }
    },
    {
      selector: 'node:selected',
      style :{  
        'border-width' : '6px'
      }
    },
    ...styleListForChapterColor,
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': '#d1d1d1',
        'target-arrow-color': '#d1d1d1',
        'transition-property': 'line-color target-arrow-color',
        'transition-duration' : '500ms',
      }
    },
    {
      selector: 'edge.parent-acquired',
      style: {
        'line-color': '#000000',
        'target-arrow-color': '#000000',
      }
    },
    {
      selector : 'edge.target-unavailable.hidden',
      style: {
        'display' : 'none',
        'events' : 'no'
      }
    },
    // Important de garder ces deux styles à la fin pour qu'ils soient prioritaires
    {
      selector: 'edge.highlighted',
      style: {
        'line-color': '#f1c40f',
        'target-arrow-color': '#f1c40f',
      }
    },
    {
      selector: 'node.highlighted',
      style :{
        'border-color': '#f1c40f',
        'border-width' : '6px'
      }
    }
  ],
});


// Place les titres de chapitre correctement
updateTitlePositions()

// Crée des labels en HTML pour gérer les maths et la mise en forme

cy.nodeHtmlLabel([{
  query: '.item-cours',
  valign: "center",
  halign: "center",
  valignBox: "center",
  halignBox: "center",
  tpl: function(data) {
    if (!data.parent){return;}
    const div = document.createElement("div");
    div.className = "node-html-label";
    div.innerHTML = data.label;

    renderMathInElement(div, {
      // customised options
      // • auto-render specific keys, e.g.:
      delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\(', right: '\\)', display: false},
          {left: '\\[', right: '\\]', display: true}
      ],
      // • rendering keys, e.g.:
      throwOnError : false
    });

    return div.outerHTML;
  }
},
{
  query: '.item-cours.unavailable.hidden',
  tpl: () => ''
}
]);

// Fonction pour tester si tous les prérequis d'un noeud sont acquis

function isAccessible(nodeId){
  const node = treeData.nodes.find(n => n.data.id === nodeId);
  return node.data.prerequis.every(p => progress[p]);
}

// Fonction qui met à jour les classes de tous les noeuds et arêtes, appelée à chaque fois qu'un status est modifié
function updateAllColors() {
  treeData.nodes.forEach(n => {
    const node = cy.getElementById(n.data.id);
    if (node.hasClass('highlighted')){
      return;
    }
    if (progress[n.data.id]) {
      node.addClass('acquired');
      node.removeClass('current');
      node.removeClass('unavailable');
    } else if (isAccessible(n.data.id)) {
      node.removeClass('unavailable');
      node.removeClass('acquired')
      node.addClass('current')
    } else {
      node.removeClass('acquired');
      node.removeClass('current');
      node.addClass('unavailable');
    }
  });
  treeData.edges.forEach(e => {
    const sourceAcquired = progress[e.data.source];
    const targetAccessible = isAccessible(e.data.target);
    const edge = cy.getElementById(e.data.id);
    if (edge.hasClass('highlighted')){
      return;
    }
    if (sourceAcquired) {
      edge.addClass('parent-acquired');
    } else {
      edge.removeClass('parent-acquired');
    }
    if (targetAccessible){
      edge.removeClass('target-unavailable')
    }else{
      edge.addClass('target-unavailable')
    }
    }
  )
}


//Fonction qui met à jour la position de tous les noeuds, appelée au chargement et à chaque fois qu'on importe une position
function updateAllPositions(){
  layout = cy.layout({
    name: 'preset',
    positions: storedNodePositions,
    fit: false,
    animate: true,
    animationDuration: 1000
  });
  layout.run();
}

//Fonction qui met à jour la position des titres 
function updateTitlePositions(){
  cy.$('node.chapter-label').positions(
    function (node,i){
      let nodesInChapter = cy.$(`node[category = "${node.data('category')}"]`);
      let nodesChapters = cy.$('node.chapter-node');
      let nodesChapterLabel = cy.$('node.chapter-label');
      let nodes = nodesInChapter.difference(nodesChapters).difference(nodesChapterLabel);
      let box = nodes.boundingBox()
      return {
        x: box.x1 + box.w/2,
        y: box.y1 - 25
      }
    }
  )
}

// Highlight tous les edge venant d'une liste de noeuds (prérequis) allant vers un noeud donné (prend en paramètre une liste de id et un id)
function highlightEdges(sourceIds, targetId){
  cy.edges().removeClass('highlighted');
  sourceIds.forEach(sourceId => {
    const edge = cy.getElementById(`${sourceId}->${targetId}`);;
    edge.addClass('highlighted');
  });
}
//  Highlight une liste de noeud (prend en paramètre les id)
function highlightNodes(nodeList){
  nodeList.forEach(pr => {
    const node = cy.getElementById(pr);
    node.addClass('highlighted');
  });
}

// Get all nodes positions

function getAllPositions(){
  const positions = {};
  treeData.nodes.forEach(n => {
    const node = cy.getElementById(n.data.id);
    positions[n.data.id] = node.position();
  });
  return positions
}

//download node position
function downloadNodePositions(){
  positions = getAllPositions()  
  const blob = new Blob(
    [JSON.stringify(positions, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "node_positions.json";
  a.click();
}
// download progress
function downloadProgress() {
  const blob = new Blob(
    [JSON.stringify(progress, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "progression.json";
  a.click();
}
// Load progress
function loadProgress(event) {
  const file = event.target.files[0];

  const reader = new FileReader();

  reader.onload = function (e) {
    progress = JSON.parse(e.target.result);

    localStorage.setItem("mathProgress", JSON.stringify(progress));

    updateAllColors();
  };

  reader.readAsText(file);
}
// Load node position
function loadNodePositions(event){
  const file = event.target.files[0];

  const reader = new FileReader();

  reader.onload = function (e) {
    storedNodePositions = JSON.parse(e.target.result);
    
    localStorage.setItem("storedNodePositions", JSON.stringify(nodePositions));
    updateAllPositions()
  };

  reader.readAsText(file);

}
// Charge le contenu de l'onglet contenant les détails sur un noeud donné
function loadNodeDetails(nodeId,title) {

  const filePath = `../content/nodes/${nodeId}.html`; // Use relative path

  // Affichage
  panel.classList.remove("full");
  panel.classList.add("half");
  overlay.classList.add("visible");

  // Contenu
  fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTML file for node "${nodeId}" not found`);
      }
      return response.text();
    })
    .then(content => {
      detailPanelTitle.textContent = title; // Set the title of the details panel
      detailPanelContent.innerHTML = content; // Display in details tab
      renderMathInElement(document.getElementById('detail-panel'), {
          // customised options
          // • auto-render specific keys, e.g.:
          delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\\(', right: '\\)', display: false},
              {left: '\\[', right: '\\]', display: true}
          ],
          // • rendering keys, e.g.:
          throwOnError : false
        });
    })
    .catch(error => {
      console.error("Error loading Markdown file:", error);
      detailPanelTitle.textContent = "Erreur";
      detailPanelContent.innerHTML = `<p>Les détails pour "${nodeId}" ne sont pas encore disponibles, merci de patienter !.</p>`;
    });
}
// Ferme le paneau de contenu
function closePanel() {
  panel.classList.remove("half","full");
  overlay.classList.remove("visible");
}
// Change le status du noeud sélectionné en "acquis"
function setToAcquired() {
  const selectedNodes = cy.nodes(':selected');
  selectedNodes.forEach(node => {
    const nodeId = node.id()
    if (isAccessible(nodeId)) {
    progress[nodeId] = true; // Mark as acquired
    localStorage.setItem("mathProgress", JSON.stringify(progress));
    updateAllColors();
    }
  closePanel()
});
}
// Enlève le status "acquis" du noeud sélectionné
function setToAccessible() {
  const selectedNodes = cy.nodes(':selected');
  selectedNodes.forEach(node => {
      const nodeId = node.id();
      delete progress[nodeId]; // Mark as accessible (not acquired)
});
    localStorage.setItem("mathProgress", JSON.stringify(progress));
    updateAllColors();
    closePanel();
}
// Highlight les prérequis du noeud sélectionné
function showPrerequisite() {
  const selectedNodes = cy.nodes(':selected');
  if(selectedNodes.length === 0) return;

  const nodeId = selectedNodes[0].id();
  const node = treeData.nodes.find(n => n.data.id === nodeId);
  const prereqs = node.data.prerequis;

  if(prereqs.length === 0){
    alert("Aucun prérequis pour ce noeud !");
    return;
  }

  currentNodeList.push(...prereqs);
  highlightEdges(prereqs, nodeId)
  highlightNodes(prereqs);
  animateToFit(currentNodeList);
  closePanel();
}

// reset progress
function reset() {
  progress = {};
  localStorage.removeItem("mathProgress");
  updateAllColors();
}


// Hover effect on node
cy.on('mouseover', 'node.item-cours', (e) =>{
  e.target.addClass('hover');
})
cy.on('mouseout', 'node.item-cours', (e) =>{
  e.target.removeClass('hover');
})


// Clic sur le fond ou sur les noeuds chapitres ferme le paneau d'information
cy.on('tap', function (event) {
  if ((event.target === cy) || event.target.isParent()) {
    cy.nodes().unselect();
    cy.edges().removeClass('highlighted');
    cy.nodes().removeClass('highlighted');
    closePanel();
    currentNodeList = [];
    closeMenu();
  }
});

// Met à jour les couleurs dès le début
cy.ready(() => {
  updateAllColors();
});

// Met une liste de noeud en mémoire pour changer éventuellement le focus
let currentNodeList = []


// Focus sur une liste de noeud avec animation
function animateToFit(nodeList) {
  cy.animate({
    fit: {
      eles: cy.$(nodeList.map(id => `#${id}`).join(', ')),
      padding: 50
    }
  }, {
    duration: 500
  });
}


// Gère ce qui se passe quand on clique sur un noeud
cy.on('tap', 'node', function (event) {
  const nodeId = event.target.id(); // Get selected node ID
  // Ne rien faire si c'est un noeud parent
  if(cy.getElementById(nodeId).isParent()) return;
  // Nettoyer les selections et les surlignages
  cy.nodes().unselect();
  cy.edges().removeClass('highlighted');
  cy.nodes().removeClass('highlighted');
  const title = event.target.data('label'); // Get selected node label
  loadNodeDetails(nodeId, title); // Load corresponding Markdown content
  currentNodeList.push(nodeId)
});

cy.on('tapdrag', function (){
  updateTitlePositions();
});

// Evenements qui ferment le paneau d'information
closeBtn.onclick = closePanel;
overlay.onclick = closePanel;

let startY = 0;
let currentY = 0;
let dragging = false;


handle.addEventListener("pointerdown", e=>{
  dragging = true;
  startY = e.clientY;
});

window.addEventListener("pointermove", e=>{

  if(!dragging) return;

  currentY = e.clientY;
  const diff = currentY - startY;

  if(diff < -150){
    panel.classList.add("full");
  }

  if(diff > 150){
    closePanel();
  }
});

window.addEventListener("pointerup", ()=>{
  dragging = false;
});

document.addEventListener("click", e => {
  nodeId = e.target.getAttribute("data_node")
  if (nodeId) {
    currentNodeList.push(nodeId)
    animateToFit(currentNodeList);
  }
})

// Enregistrer la positions des noeuds lorsqu'on ferme la fenetre
window.addEventListener("beforeunload", function(e){
  let nodePositions = getAllPositions(); 
  localStorage.setItem("storedNodePositions", JSON.stringify(nodePositions));
});

// ***************************************************
// TOOLTIP
// ***************************************************

// fonction qui détecte s'il y a des maths
function containsMath(text){
  return /\\\(|\\\[|\$/.test(text);
}


const mathTooltip = document.getElementById("math-tooltip");

let useMathTooltip = false;

const tooltip = document.getElementById("tooltip");

let hoveredNode = null;

cy.on("mouseover","node",evt=>{
  if(!tooltipsActivated) return;
  hoveredNode = evt.target;
  if(!hoveredNode.hasClass('item-cours')) return;

  const text =
    hoveredNode.data("tooltip") ||
    hoveredNode.data("label");

  useMathTooltip = containsMath(text);

  if(useMathTooltip){

    mathTooltip.innerHTML = text;
    mathTooltip.classList.add("visible");

    if(window.MathJax){
      MathJax.typesetPromise([mathTooltip]);
    }

  } else{
    tooltip.innerHTML = text;
    tooltip.classList.add("visible");
  }

});

cy.on("mouseout","node",()=>{
  if(!tooltipsActivated) return;
  hoveredNode = null;
  mathTooltip.classList.remove("visible");
  tooltip.classList.remove("visible")

});


cy.on("render",()=>{
  if(!tooltipsActivated) return;
  if(!hoveredNode) return;

  const pos = hoveredNode.renderedPosition();

  const text =
    hoveredNode.data("tooltip") ||
    hoveredNode.data('label')

  /* si tooltip math → HTML */
  
  if(useMathTooltip){

    mathTooltip.style.left = (pos.x+15)+"px";
    mathTooltip.style.top = (pos.y-10)+"px";

    return;
  } else {

    tooltip.style.left = (pos.x+15)+"px";
    tooltip.style.top = (pos.y-10)+"px";
  }
});

// ***************************************************
// MENU
// ***************************************************


const graphGearBtn = document.getElementById("gear-btn");
const graphDropdown = document.getElementById("menu-graph-dropdown");


function closeMenu(){
  graphDropdown.classList.toggle("hidden");
}
graphGearBtn.addEventListener("click", () => {
  closeMenu()
});


const checkboxChapters = document.getElementById("toggle-chapter-nodes");

checkboxChapters.addEventListener("change", () => {

  if (checkboxChapters.checked) {
    cy.nodes(".chapter-node").removeClass("hidden");
    cy.nodes(".chapter-label").removeClass("hidden");
  } 
  else {
    cy.nodes(".chapter-node").addClass("hidden");
    cy.nodes(".chapter-label").addClass("hidden");
    console.log(cy.$('#ensemble_image_reciproque').style())
  }

});

const checkboxAccessibles = document.getElementById("toggle-accessibles-nodes");

checkboxAccessibles.addEventListener("change", () => {

  if (checkboxAccessibles.checked) {
    cy.nodes('.item-cours').removeClass("hidden");
    cy.nodes('.item-cours').removeClass("hidden");
    cy.edges().removeClass("hidden");
  } 
  else {
    cy.nodes('.item-cours').addClass("hidden");
    cy.nodes('.item-cours').addClass("hidden");
    cy.edges().addClass('hidden');
  }
});


let tooltipsActivated = true

const checkboxTooltips = document.getElementById("toggle-tooltips");

checkboxTooltips.addEventListener("change", () => {

  if (checkboxTooltips.checked) {
    tooltipsActivated = true
  } 
  else {
    tooltipsActivated = false
  }
});