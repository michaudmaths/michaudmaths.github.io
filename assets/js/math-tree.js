const elements = [];

treeData.nodes.forEach(node => {

  elements.push({
    data: { id: node.id, label: node.label },
  });
  node.prerequis.forEach(p => {
    elements.push({
      data: {
        id: p + "_" + node.id,
        source: p,
        target: node.id
      }
    });
  });

});


// pour $être éventuellement modifié plus tar
const typeShape = {
  definition: { 'shape' : 'round-rectangle' },
  theorem: { 'shape': 'round-rectangle'},
  example: { 'shape': 'round-rectangle'},
  exercise: { 'shape': 'round-rectangle'},
};

const statusColors = {
  'unavailable': "#888",
  'in_progress': "#3ab218",
  'acquired': "#0e3dc0"
};


const cy = cytoscape({
  container: document.getElementById('graph'),
  elements: elements,
  style: [
    {
      selector: 'node',
      style: {
        'shape': 'round-rectangle',
        'width': '250px',
        'height': '50px',
        'background-color': '#fff',
        'border-width': '2px',
        'border-color': '#888',
        'overlay-opacity': 0,
        'label': 'data(label)', // Add label to display node title
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#000',
        'font-size': '16px',
        'transition-property': 'width height font-size',
        'transition-duration' : '150ms'
      }
    },
    {
      selector: 'node.acquired',
      style: {
        'border-color': '#2ecc71',
        'border-width': '4px'
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
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': '#ccc',
        'target-arrow-color': '#ccc'
      }
    }
  ],
  layout: {
    name: 'breadthfirst',
    directed: true,
    direction: 'rightward', // Remet l'arbre de gauche à droite
    spacingFactor: 1.5
  }
});

// Add style for the selected node

cy.style().selector('node:selected').style({
  'border-color': '#f1c40f',
  'border-width' : '6px'});


let progress = JSON.parse(localStorage.getItem("mathProgress") || "{}");

function isAccessible(nodeId) {
  const node = treeData.nodes.find(n => n.id === nodeId);
  return node.prerequis.every(p => progress[p]);
}

function updateColors() {
  treeData.nodes.forEach(n => {
    const node = cy.getElementById(n.id);
    if (isAccessible(n.id)) {
      node.removeClass('unavailable');
    } else {
      node.addClass('unavailable');
      node.removeClass('acquired');
    }

    if (progress[n.id]) {
      node.addClass('acquired');
    } else {
      node.removeClass('acquired');
    }

    // Set style based on progress
    const statusColor = progress[n.id] ? statusColors.acquired : (isAccessible(n.id) ? statusColors.in_progress : statusColors.unavailable);
    node.style("background-color", statusColor);
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

function loadNodeDetails(nodeId) {
  const filePath = `/nodes/${nodeId}.txt`; // Use relative path
  console.log(`Fetching Markdown file from: ${filePath}`); // Log the file path for debugging

  fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Markdown file for node "${nodeId}" not found`);
      }
      return response.text();
    })
    .then(markdown => {
      const htmlContent = marked(markdown); // Convert Markdown to HTML
      console.log(document.getElementById('detail-panel')); // Log the details panel element for debugging
      document.getElementById('detail-panel').innerHTML = htmlContent; // Display in details tab
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
      document.getElementById('detail-panel').innerHTML = `<p>Details for node "${nodeId}" are not available.</p>`;
    });
}

function setToAcquired() {
  const selectedNodes = cy.nodes(':selected');

  selectedNodes.forEach(node => {
    if (isAccessible(node.id())) {
    const nodeId = node.id();
    progress[nodeId] = true; // Mark as acquired
    localStorage.setItem("mathProgress", JSON.stringify(progress));
    updateColors();
    }
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
}


function reset() {
  progress = {};
  localStorage.removeItem("mathProgress");
  updateColors();
}

// Ensure nodes are selectable with a single click
cy.on('tap', 'node', function (event) {
  const nodeId = event.target.id(); // Get selected node ID
  loadNodeDetails(nodeId); // Load corresponding Markdown content
});

// Hover effect on node
cy.on('mouseover', 'node', (e) =>{
  e.target.addClass('hover');
})

cy.on('mouseout', 'node', (e) =>{
  e.target.removeClass('hover');
})


cy.ready(() => {
  updateColors();
});