const panel = document.getElementById("detail-panel");
const overlay = document.getElementById("panel-overlay");
const detailPanelTitle = document.getElementById("panel-title");
const detailPanelContent = document.getElementById("panel-content");
const closeBtn = document.getElementById("close-panel");
const handle = document.getElementById("drag-handle");



// pour $être éventuellement modifié plus tar
const typeShape = {
  definition: { 'shape' : 'round-rectangle' },
  theorem: { 'shape': 'round-rectangle'},
  example: { 'shape': 'round-rectangle'},
  exercise: { 'shape': 'round-rectangle'},
};

const statusColors = {
  'unavailable': "#888",
  'current': "#3ab218",
  'acquired': "#0e3dc0"
};

const chapterToColor = [
  {title: "1 - Trigonométrie", color : "#8e44ad"},
  {title: "2 - Logique" , color : "#3ab218"},
  {title: "3 - Ensembles et applications" , color: "#0e3dc0"},
  {title: "4 - Entiers, sommes, récurrences", color: "#d35400"},
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
    selector: `node[category = "${chapter.title}"]:parent`,
    style: {
      'color' : chapter.color,
      'text-background-color' : chapter.color,
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



const cy = cytoscape({
  container: document.getElementById('graph'),
  elements: [...treeData.nodes, ...treeData.edges],
  style: [
    {
      selector: 'node',
      style: {
        'shape': 'round-rectangle',
        'width': '250px',
        'height': '50px',
        'border-width': '2px',
        'overlay-opacity': 0,
        'label': '', // Add label to display node title
        'text-valign': 'center',
        'text-halign': 'center',
        'font-weight': 'bold',
        'text-wrap': 'wrap',
        'text-max-width': '230px',
        'color': '#000',
        'font-size': '18px',
        'transition-property': 'width height font-size background-color border-color color',
        'transition-duration' : '300ms',
      }
    },
    {
      selector: ':parent',
      style: {
        'padding': '60px',
        'text-wrap': 'none',
        'background-opacity': 0.1,
        'text-background-opacity' : 0.1,
        'label': 'data(label)',
        'font-size': '30px',
        'text-margin-y': function (node) { return -node.height()/2-25; },
        'events' : 'no',
      }
    },
    {
      selector: 'node.hover',
      style: {
        'width': '275px',
        'height': '55px',
        'font-size': '18px',
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
        'transition-duration' : '300ms',
      }
    },
    {
      selector: 'edge.parent_acquired',
      style: {
        'line-color': '#000000',
        'target-arrow-color': '#000000',
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

var layoutOptions = {
  name : 'cose-bilkent',
  // Called on `layoutready`
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
  animate: 'false',
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

cy.layout(layoutOptions).run();
// Add style for the selected node

cy.nodeHtmlLabel([{
  query: 'node',
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
}
]);


let progress = JSON.parse(localStorage.getItem("mathProgress") || "{}");

function isAccessible(nodeId){
  const node = treeData.nodes.find(n => n.data.id === nodeId);
  return node.data.prerequis.every(p => progress[p]);
}

function updateColors() {
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
      node.addClass('current')
    } else {
      node.removeClass('acquired');
      node.removeClass('current');
      node.addClass('unavailable');
    }
  });
  treeData.edges.forEach(e => {
    const sourceAcquired = progress[e.data.source];
    const edge = cy.getElementById(e.data.id);
    if (edge.hasClass('highlighted')){
      return;
    }
    if (sourceAcquired) {
      edge.addClass('parent_acquired');
    } else {
      edge.removeClass('parent_acquired'); 
    }
  })
}

function highlightEdges(sourceIds, targetId){
  cy.edges().removeClass('highlighted');
  sourceIds.forEach(sourceId => {
    const edge = cy.getElementById(`${sourceId}->${targetId}`);;
    edge.addClass('highlighted');
  });
}
function highlightPrerequisites(prereqs){
  prereqs.forEach(pr => {
    const node = cy.getElementById(pr);
    node.addClass('highlighted');
  });
}

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

function loadProgress(event) {
  const file = event.target.files[0];

  const reader = new FileReader();

  reader.onload = function (e) {
    progress = JSON.parse(e.target.result);

    localStorage.setItem("mathProgress", JSON.stringify(progress));

    updateColors();
  };

  reader.readAsText(file);
}

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

function closePanel() {
  panel.classList.remove("half","full");
  overlay.classList.remove("visible");
}

function setToAcquired() {
  const selectedNodes = cy.nodes(':selected');
  selectedNodes.forEach(node => {
    const nodeId = node.id()
    if (isAccessible(nodeId)) {
    progress[nodeId] = true; // Mark as acquired
    localStorage.setItem("mathProgress", JSON.stringify(progress));
    updateColors();
    }
  closePanel()
});
}

function setToAccessible() {
  const selectedNodes = cy.nodes(':selected');
  selectedNodes.forEach(node => {
      const nodeId = node.id();
      delete progress[nodeId]; // Mark as accessible (not acquired)
});
    localStorage.setItem("mathProgress", JSON.stringify(progress));
    updateColors();
    closePanel();
}

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
  highlightPrerequisites(prereqs);
  animateToFit(currentNodeList);
  closePanel();
}


function reset() {
  progress = {};
  localStorage.removeItem("mathProgress");
  updateColors();
}


// Hover effect on node
cy.on('mouseover', 'node', (e) =>{
  e.target.addClass('hover');
})

cy.on('mouseout', 'node', (e) =>{
  e.target.removeClass('hover');
})


// Clic sur le fond ou sur les noeuds chapitres
cy.on('tap', function (event) {
  if ((event.target === cy) || event.target.isParent()) {
    cy.nodes().unselect();
    cy.edges().removeClass('highlighted');
    cy.nodes().removeClass('highlighted');
    closePanel();
    currentNodeList = [];
  }
});


cy.ready(() => {
  updateColors();
});

let currentNodeList = []


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