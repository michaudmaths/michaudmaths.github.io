const qcmPanel = document.getElementById("qcm-panel");
const overlay = document.getElementById("panel-overlay");
const detailPanelTitle = document.getElementById("panel-title");
const detailPanelContent = document.getElementById("panel-content");
const handle = document.getElementById("drag-handle");
const mathTooltip = document.getElementById("math-tooltip");
const buttonToggleProgress = document.getElementById("progress-toggle")

// Charger progrès depuis le storage local

let progress = JSON.parse(localStorage.getItem("mathProgress")) || "{}";
let questionProgress = JSON.parse(localStorage.getItem("questionProgress")) || "{}";

// Charger la position des noeuds depuis le storage local
let storedNodePositions = JSON.parse(localStorage.getItem("storedNodePositions")) || nodePositions;

let navigation = false

let focusedOn = {}
let defaultLayout = 'klay'

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
    selector: `node[chapter = "${chapter.title}"].chapter-label, node[chapter = "${chapter.title}"].subchapter-label`,
    style: {
      'color' : chapter.color,
      'text-background-opacity' : '0',
    }
  },
  {
    selector: `node[chapter = "${chapter.title}"].unavailable`,
    style: {
      'color' : changeColor(chapter.color, statusVarColors.unavailable*0.9),
      'background-color': '#333',
      'border-color': changeColor(chapter.color, statusVarColors.current*0.7),
    }
  },
  {
    selector: `node[chapter = "${chapter.title}"].current`,
    style: {
      'background-color': changeColor(chapter.color, statusVarColors.current),
      'border-color': changeColor(chapter.color, statusVarColors.current*0.7),
    }
  },
  {
    selector: `node[chapter = "${chapter.title}"].acquired`,
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

var klayOptions = {
  nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
  fit: true, // Whether to fit
  padding: 20, // Padding on fit
  animate: false, // Whether to transition the node positions
  animateFilter: function( node, i ){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // Duration of animation in ms if enabled
  animationEasing: undefined, // Easing of animation if enabled
  transform: function( node, pos ){ return pos; }, // A function that applies a transform to the final node position
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  klay: {
    // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
    addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
    aspectRatio: 1.5, // The aimed aspect ratio of the drawing, that is the quotient of width by height
    borderSpacing: 20, // Minimal amount of space to be left to the border
    compactComponents: true, // Tries to further compact components (disconnected sub-graphs).
    crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
    /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
    INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
    cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
    /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
    INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
    direction: 'RIGHT', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
    /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
    edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
    edgeSpacingFactor: .5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
    feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
    fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
    /* NONE Chooses the smallest layout from the four possible candidates.
    LEFTUP Chooses the left-up candidate from the four possible candidates.
    RIGHTUP Chooses the right-up candidate from the four possible candidates.
    LEFTDOWN Chooses the left-down candidate from the four possible candidates.
    RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
    BALANCED Creates a balanced layout from the four possible candidates. */
    inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
    layoutHierarchy: true, // Whether the selected layouter should consider the full hierarchy
    linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
    mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
    mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
    nodeLayering:'NETWORK_SIMPLEX', // Strategy for node layering.
    /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
    LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
    INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
    nodePlacement:'BRANDES_KOEPF', // Strategy for Node Placement
    /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
    LINEAR_SEGMENTS Computes a balanced placement.
    INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
    SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
    randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
    routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
    separateConnectedComponents: true, // Whether each connected component should be processed separately
    spacing: 40, // Overall setting for the minimal amount of space to be left between objects
    thoroughness: 7 // How much effort should be spent to produce a nice layout..
  },
  priority: function( edge ){ return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
};

var presetLayoutoptions = {
  positions: storedNodePositions,
  zoom: undefined, // the zoom level to set (prob want fit = false if set)
  pan: undefined, // the pan level to set (prob want fit = false if set)
  fit: true, // whether to fit to viewport
  padding: 30, // padding on fit
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
  ready: undefined, // callback on layoutready
  stop: undefined, // callback on layoutstop
  transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
};

var layoutNameToOptions = {
  'preset': presetLayoutoptions,
  'klay' : klayOptions,
}

var layoutName = 'klay'
// Instantiation du graphe
const cy = cytoscape({
  container: document.getElementById('graph'),
  layout : {
    name : layoutName,
    ...layoutNameToOptions[layoutName]
  },
  elements: [...treeData.nodes, ...treeData.edges],
  style: [
    {
      selector: 'node.item-cours',
      style: {
        'shape': 'round-rectangle',
        'width': '240px',
        'height': '160px',
        'border-width': '2px',
        'overlay-opacity': 0,
        'label': 'data(label)', // Add label to display node title
        'text-valign': 'center',
        'text-halign': 'center',
        'font-weight': 'bold',
        'text-wrap': 'wrap',
        'text-max-width': '180px',
        'color': '#333',
        'font-size': '30px',
        'transition-property': 'background-color border-color',
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
      selector : 'node.chapter-node.hidden, node.subchapter-node.hidden, node.chapter-node.undisplayed, node.subchapter-node.undisplayed',
      style: {
        'text-opacity': 0,
        'background-opacity': 0,
        'border-opacity': 0,
        'events' : 'no'
      }
    },
    {
      selector : 'node.chapter-label.hidden, node.subchapter-label.hidden, node.chapter-label.undisplayed, node.subchapter-label.undisplayed',
      style: {
        'text-opacity': 0,
        'background-opacity': 0,
        'border-opacity': 0,
        'events' : 'no'
      }
    },
    {
      selector: 'node.chapter-label, node.subchapter-label',
      style:{
        'width':'150px',
        'height':'20px',
        'border-width': '0px',
        'label':'data(label)',
        'text-wrap': 'none',
        'background-opacity': 0.05,
        'text-background-opacity' : 1,
        'font-size': '50px',
        // 'events' : 'no',// A remettre ensuite, plus facile pour manipuler
      },
    },
    {
      selector: 'node.subchapter-label',
      style:{
        'font-size': '40px',
      }
    },
    {
      selector: 'node.hover',
      style: {
        'border-width': '6px',
      }
    },
    {
      selector: 'node:selected',
      style :{  
        'width': '300px',
        'height': '240px',
        'shape': 'rectangle',
        'border-width' : '4px',
      }
    },
    ...styleListForChapterColor,
    {
      selector: 'edge',
      style: {
        'curve-style': 'round-taxi', // Des angles droits plus propres pour les arbres
        'taxi-direction': 'horizontal',
        'target-arrow-shape': 'triangle',
        'arrow-scale' : 2,
        'width' : 2,
        'line-color': '#444',
        'target-arrow-color': '#444',
        'transition-property': 'line-color target-arrow-color',
        'transition-duration' : '500ms',
      }
    },
    {
      selector: 'edge.parent-acquired',
      style: {
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
      }
    },
    {
      selector : 'edge.target-unavailable.hidden, node.item-cours.undisplayed',
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
updateTitlePositions()


// Fonction pour tester si tous les prérequis d'un noeud sont acquis

function isAccessible(nodeId){
  const node = treeData.nodes.find(n => n.data.id === nodeId);
  return node.data.prereqs.every(p => progress[p]);
}

function progressDown(nodeId){
  const node = treeData.nodes.find(n => n.data.id === nodeId);
  node.data.unlocked.forEach(u =>{
    if (progress[u]){
      delete progress[u]
      progressDown(u)
    }
  })
}

// Fonction qui met à jour les couleurs d'UN noeud
function updateNodeColor(node){
  if (progress[node.id()]) {
        node.addClass('acquired');
        node.removeClass('current');
        node.removeClass('unavailable');
      } else if (isAccessible(node.id())) {
        node.removeClass('unavailable');
        node.removeClass('acquired')
        node.addClass('current')
      } else {
        node.removeClass('acquired');
        node.removeClass('current');
        node.addClass('unavailable');
      }
}
function updateEdgeColor(edge){
  const sourceAcquired = progress[edge.source().id()];
  const targetAccessible = isAccessible(edge.target().id());
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

// Fonction qui met à jour seulement le noeud sélectionné, les arrêtes partant de ce noeud, et les noeuds qui en découlent.

function updateColors(id){
    n = cy.getElementById(id)
    updateNodeColor(n)
    n.successors().forEach(e =>{
      if (e.isNode()){updateNodeColor(e)} else {updateEdgeColor(e)}
    })
    n.incomers('edge').forEach(edge => {
      updateEdgeColor(edge);
    })
}



// Fonction qui met à jour les classes de tous les noeuds et arêtes, appelée normalement une seule fois
function updateAllColors() {
  treeData.nodes.forEach(e => {
    node = cy.getElementById(e.data.id)
    updateNodeColor(node)
  });
  treeData.edges.forEach(e => {
    edge = cy.getElementById(e.data.id)
    updateEdgeColor(edge)
  });
}


//Fonction qui met à jour la position de tous les noeuds, appelée au chargement et à chaque fois qu'on importe une position
function updateAllPositions(){
  layout = cy.layout({
    name: 'preset',
    positions: storedNodePositions,
    fit: true,
    animate: true,
    animationDuration: 1000
  });
  layout.on('layoutstop', ()=>{
    updateTitlePositions()
    updateTitlePositions()
  })
  layout.run();
}

function resetToDefaultLayout(){
  cy.elements().forEach(ele => {
      ele.removeClass('undisplayed');
    });
  layout = cy.layout({
    name: defaultLayout,
    ...layoutNameToOptions[defaultLayout],
    fit:false,
    animate:true,
    animationDuration : 500,
  })
  layout.on('layoutstop', () => {
    cy.zoom(cy.zoom()*0.25,  {easing:'ease-in-out'})
    cy.center(focusedOn,  {easing:'ease-in-out'})
  updateTitlePositions()
  })
  layout.run()
}

//Fonction qui met à jour la position des titres 
function updateTitlePositions(){
  cy.$('node.chapter-label, node.subchapter-label').positions(
    function (node,i){
      if (node.hasClass('chapter-label')){
        var nodes = node.parent().descendants().intersection(cy.$('.item-cours , .subchapter-node'));
      } else {
        var nodes = node.parent().descendants().intersection(cy.$('.item-cours'));
      }
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
    const edge = cy.getElementById(`${sourceId}_to_${targetId}`);;
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
  defaultLayout = 'preset'

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
    
    currentNodeList = [];
    closeMenu();
    if (navigation) {
      navigation = false
      focusedOn = {}
      cy.elements().removeClass('undisplayed')
      updateAllPositions();
      buttonToggleProgress.classList.remove("visible")
    }
  }
});

// Met à jour les couleurs dès le début
cy.ready(() => {
  updateAllColors();
  // updateAllPositions();
  updateTitlePositions();
  cy.fit()
});


// cy.nodes('node.chapter-node').forEach((chapterNode, index) => {
//   // 2. On récupère les enfants et on applique le layout
//   const children = chapterNode.children('.item-cours')
//   const roots = children.filter(n => n.indegree() === 0); 
//   const layout = children.union(children.connectedEdges()).layout({
//     name : 'klay',
//     klay: {
//       // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
//       addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
//       aspectRatio: 1.5, // The aimed aspect ratio of the drawing, that is the quotient of width by height
//       borderSpacing: 20, // Minimal amount of space to be left to the border
//       compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
//       crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
//       /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
//       INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
//       cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
//       /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
//       INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
//       direction: 'DOWN', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
//       /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
//       edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
//       edgeSpacingFactor: .5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
//       feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
//       fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
//       /* NONE Chooses the smallest layout from the four possible candidates.
//       LEFTUP Chooses the left-up candidate from the four possible candidates.
//       RIGHTUP Chooses the right-up candidate from the four possible candidates.
//       LEFTDOWN Chooses the left-down candidate from the four possible candidates.
//       RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
//       BALANCED Creates a balanced layout from the four possible candidates. */
//       inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
//       layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
//       linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
//       mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
//       mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
//       nodeLayering:'NETWORK_SIMPLEX', // Strategy for node layering.
//       /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
//       LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
//       INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
//       nodePlacement:'BRANDES_KOEPF', // Strategy for Node Placement
//       /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
//       LINEAR_SEGMENTS Computes a balanced placement.
//       INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
//       SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
//       randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
//       routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
//       separateConnectedComponents: true, // Whether each connected component should be processed separately
//       spacing: 40, // Overall setting for the minimal amount of space to be left between objects
//       thoroughness: 7 // How much effort should be spent to produce a nice layout..
//     },
//   });

//   layout.run();
// });


// Gère ce qui se passe quand on clique sur un noeud
// cy.on('tap', 'node', function (event) {
//   node = event.target 
//   const nodeId = node.id(); // Get selected node ID
//   // Ne rien faire si c'est un noeud parent
//   if(node.isParent()) return;
//   // Nettoyer les selections et les surlignages
//   cy.nodes().unselect();
//   cy.edges().removeClass('highlighted');
//   cy.nodes().removeClass('highlighted');
//   // const title = event.target.data('label'); // Get selected node label
//   // loadNodeDetails(nodeId, title); // Load corresponding Markdown content
//   // currentNodeList.push(nodeId)
// });


// FONCTION PROPSOEE PAR CHATGPT 
cy.on('tap', 'node', function (event) {
  if (focusedOn === event.target){
    const node = event.target;
    const data = node.data()
    openQCM(data);
  } else {
    const node = event.target;
    if (node.isParent()) return;

    // Reset visuel
    cy.nodes().removeClass('undisplayed');
    cy.edges().removeClass('undisplayed');

    cy.nodes().unselect();
    cy.edges().removeClass('highlighted');
    cy.nodes().removeClass('highlighted');
    navigation = true
    focusedOn = node
    focusDirectNeighbors(node)
  }
});

function focusDirectNeighbors(node) {

  // =================
  // 1. Récupérer voisins directs
  // =========================

  const predecessors = node.incomers('node');
  const successors   = node.outgoers('node');

  const subgraph = node
    .union(predecessors)
    .union(successors)
    .union(node.connectedEdges());

  const ids = new Set(subgraph.map(e => e.id()));

  // =========================
  // 2. Masquer le reste
  // =========================

  cy.elements().forEach(ele => {
    if (!ids.has(ele.id())) {
      ele.addClass('undisplayed');
    } else {
      ele.removeClass('undisplayed');
    }
  });

  // =========================
  // 3. Calcul positions
  // =========================
 
 // Viewport size
  let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

  const positions = {};

  const centerX = storedNodePositions[node.id()].x;
  const centerY = storedNodePositions[node.id()].y;
  
  const maxItemNumber = 11
  const maxLength = Math.max(predecessors.length, successors.length)
  const spacingX = vw/2.5;
  const spacingY = Math.max(vh/maxLength, 200);

  // --- centre ---
  positions[node.id()] = { x: centerX, y: centerY };

  // --- prédécesseurs (a gauche) ---
  const totalHeightPred = (predecessors.length - 1) * spacingY;
  // --- successeurs (a droite) ---
  const totalHeightSucc = (successors.length - 1) * spacingY;



  var nbCol = Math.floor((predecessors.length-1)/maxItemNumber)+1
  var itemPerCol = Math.floor((predecessors.length-1)/nbCol)+1
  predecessors.forEach((n, i) => {
    positions[n.id()] = {
      x: centerX - spacingX - spacingX/2*(Math.floor(i/itemPerCol)),
      y: centerY + spacingY*(i % itemPerCol) + spacingY/2*(Math.floor(i/itemPerCol)) - totalHeightPred / (2*nbCol)
    };
  });
  var nbCol = Math.floor((successors.length-1)/maxItemNumber)+1
  var itemPerCol = Math.floor((successors.length-1)/nbCol)+1
  successors.forEach((n, i) => {
    positions[n.id()] = {
      x: centerX + spacingX + spacingX/2*(Math.floor(i/itemPerCol)),
      y: centerY + spacingY*(i % itemPerCol) + spacingY/2*(Math.floor(i/itemPerCol)) - totalHeightSucc / (2*nbCol)
    };
  });

  // =========================
  // 4. Appliquer layout
  // =========================

  const layout = subgraph.layout({
    name: 'preset',
    positions: positions,
    fit: true,
    padding: 80,
    animate: true,
    animationDuration: 400
  });

  layout.run();
}

/// FIN TEST CHATGPT


document.addEventListener("click", e => {
  nodeId = e.target.getAttribute("data_node")
  if (nodeId) {
    currentNodeList.push(nodeId)
    animateToFit(currentNodeList);
  }
})

// Enregistrer la positions des noeuds lorsqu'on ferme la fenetre
window.addEventListener("beforeunload", function(e){
  if (navigation) {return;}
  let nodePositions = getAllPositions(); 
  localStorage.setItem("storedNodePositions", JSON.stringify(nodePositions));
});


// NODE BUTTONS

function displayNodeButtons(node){
  buttonToggleProgress.classList.add("visible")
  if (progress[node.id()]){
    buttonToggleProgress.classList.remove('show-progress-up')
  } else {
    buttonToggleProgress.classList.add('show-progress-up')
  }
  const pos = node.renderedPosition();
  const w = node.renderedWidth()
  const h = node.renderedHeight()
  const x = pos.x - w/2
  const y = pos.y + h/2
  buttonToggleProgress.style.width = (w-8)+"px"
  buttonToggleProgress.style.height = (h/6)+"px"
  buttonToggleProgress.style.left = (x)+"px";
  buttonToggleProgress.style.top = (y)+"px";
}

function saveProgress() {
  localStorage.setItem("questionProgress", JSON.stringify(questionProgress));
}

// Change le status du noeud sélectionné 
function toggleProgress() {
  console.log('click')
  const selectedNodes = cy.nodes(':selected');
  selectedNodes.forEach(node => {
    const nodeId = node.id()
    if (isAccessible(nodeId) && !progress[nodeId]) {
      progress[nodeId] = true; // Mark as acquired
      buttonToggleProgress.classList.toggle('show-progress-up')
    } else if (isAccessible(nodeId) && progress[nodeId]){
      delete progress[nodeId]
      progressDown(nodeId)
      buttonToggleProgress.classList.toggle('show-progress-up')
    } else {return;}
  localStorage.setItem("mathProgress", JSON.stringify(progress));
  updateColors(nodeId);
});
}


buttonToggleProgress.addEventListener('click', toggleProgress)


// ***************************************************
// TOOLTIP
// ***************************************************

// fonction qui détecte s'il y a des maths
function containsMath(text){
  return /\\\(|\\\[|\$/.test(text);
}



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
  if (navigation){
    displayNodeButtons(cy.$(':selected')[0])
  }
  if(!tooltipsActivated) return;
  if(!hoveredNode) return;

  const pos = hoveredNode.renderedPosition();
  const x = pos.x + hoveredNode.renderedWidth()/2
  const y = pos.y 

  const text =
    hoveredNode.data("tooltip") ||
    hoveredNode.data('label')

  /* si tooltip math → HTML */
  
  if(useMathTooltip){

    mathTooltip.style.left = (x)+"px";
    mathTooltip.style.top = (y)+"px";

    return;
  } else {

    tooltip.style.left = (x)+"px";
    tooltip.style.top = (y)+"px";
  }
});

// ***************************************************
// MENU
// ***************************************************


const graphGearBtn = document.getElementById("gear-btn");
const graphDropdown = document.getElementById("menu-graph-dropdown");


function closeMenu(){
  graphDropdown.classList.add("hidden");
}
graphGearBtn.addEventListener("click", () => {
  graphDropdown.classList.toggle("hidden");
});


const checkboxChapters = document.getElementById("toggle-chapter-nodes");

checkboxChapters.addEventListener("change", () => {

  if (checkboxChapters.checked) {
    cy.nodes(".chapter-node").removeClass("hidden");
    cy.nodes(".chapter-label").removeClass("hidden");
    cy.nodes(".subchapter-node").removeClass("hidden");
    cy.nodes(".subchapter-label").removeClass("hidden");
  } 
  else {
    cy.nodes(".chapter-node").addClass("hidden");
    cy.nodes(".chapter-label").addClass("hidden");
    cy.nodes(".subchapter-node").addClass("hidden");
    cy.nodes(".subchapter-label").addClass("hidden");
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

