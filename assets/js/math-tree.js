const elements = [];

treeData.nodes.forEach(node => {

  elements.push({
    data: { id: node.id, label: node.label }
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

const typeColors = {
  definition: "#f1c40f",
  theorem: "#9b59b6",
  example: "#e67e22",
  exercise: "#1abc9c"
};

const typeBorders = {
  definition: { width: "4px", color: "#f1c40f" },
  theorem: { width: "4px", color: "#9b59b6" },
  example: { width: "4px", color: "#e67e22" },
  exercise: { width: "4px", color: "#1abc9c" }
};

const statusColors = {
  unexplored: "#888",
  in_progress: "#3498db",
  acquired: "#2ecc71"
};

const statusBorders = {
  unexplored: { width: "2px", color: "#888" },
  in_progress: { width: "4px", color: "#3498db" },
  acquired: { width: "4px", color: "#2ecc71" }
};

const cy = cytoscape({
  container: document.getElementById('graph'),
  elements: elements,
  style: [
    {
      selector: 'node',
      style: {
        'shape': 'round-rectangle',
        'width': '200px',
        'height': 'auto',
        'background-color': '#fff',
        'border-width': '2px',
        'border-color': '#888',
        'overlay-opacity': 0
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

// Register the cytoscape-html extension
try {
  if (typeof cytoscapeHtml === 'function') {
    cytoscape.use(cytoscapeHtml);
  } else {
    console.error('cytoscape-html is not loaded or is incompatible with the current Cytoscape version.');
  }
} catch (error) {
  console.error('Failed to register cytoscape-html:', error);
}

// Add HTML content to nodes using cytoscape-html
if (typeof cytoscapeHtml === 'function') {
  cy.nodes().forEach(node => {
    const type = node.data('type') || 'default';
    const label = node.data('label') || '';

    const htmlContent = `
      <div style="position: relative; width: 100%; height: 100%; text-align: center;">
        <div class="node-banner ${type}"></div>
        <div style="padding-top: 25px;">${label}</div>
      </div>
    `;

    node.data('html', htmlContent);
  });

  // Initialize cytoscape-html extension
  cytoscapeHtml(cy, {
    template: function (node) {
      return node.data('html');
    }
  });
} else {
  console.warn('cytoscape-html is not available. Nodes will not display HTML content.');
}

let progress = JSON.parse(localStorage.getItem("mathProgress") || "{}");

function isAccessible(nodeId) {
  const node = treeData.nodes.find(n => n.id === nodeId);
  return node.prerequis.every(p => progress[p]);
}

function updateColors() {
  treeData.nodes.forEach(n => {
    const node = cy.getElementById(n.id);

    if (progress[n.id]) {
      node.addClass('acquired');
    } else {
      node.removeClass('acquired');
    }

    // Set border style based on type
    const typeBorder = typeBorders[n.type] || { width: "2px", color: "#888" };
    node.style("border-width", typeBorder.width);
    node.style("border-color", typeBorder.color);
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

cy.ready(() => {
  updateColors();
});