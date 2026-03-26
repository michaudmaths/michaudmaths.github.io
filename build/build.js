const fs = require("fs");
const path = require("path");
const { marked } = require("marked")
const yaml = require("js-yaml");


const NODES_DIR = "../nodes";
const OUTPUT = "../_data/graph.json";

/*
Sous-dossiers autorisés
*/
const ALLOWED_FOLDERS = [
  "1 - Trigonométrie",
  "2 - Logique",
  "3 - Ensembles et applications",
  "4 - Entiers, sommes, récurrence"
];


const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)


const files = getMarkdownFiles(NODES_DIR);
const filenameToId = createFilenameToIdMap()
const prereqsMap = createPrereqsMap()
const minimumPrereqsMap = createMinimumPrereqsMap() 
const unlockedMap = createUnlockedMap() 
const nodes = [];
const edges = [];

/*
PASS 1 : lire les id
*/




//  prereqsMap[id] = list of id
function createPrereqsMap(){
  var prereqsMap = {}
    files.forEach(file =>{
    const filename = path.basename(file, ".md");
    id = filenameToId[filename]
    const raw = fs.readFileSync(file, "utf8");
    const { meta, body } = parseFrontmatter(raw);
    if (!meta.prerequis){return;}
    prereqNames = extractLinks(meta.prerequis);
    prereqsMap[id] = prereqNames
    .map(name => filenameToId[name])
    .filter(Boolean);
  })
  return prereqsMap;
}

function createMinimumPrereqsMap(){
  var minimumPrereqsMap = {}
  files.forEach(file=>{
    const filename = path.basename(file, ".md");
    const id = filenameToId[filename];
    minimumPrereqsMap[id] = getMinimumPrereqs(id, prereqsMap)
  })
  return minimumPrereqsMap;
}

function createUnlockedMap(){
  var unlockedMap = {}
  files.forEach(file => {
    const filename = path.basename(file, ".md");
    id_source = filenameToId[filename]
    unlockedMap[id_source] = []
    files.forEach(file =>{
      const filename = path.basename(file, ".md");
      id_target = filenameToId[filename]
      if (minimumPrereqsMap[id_target].includes(id_source)) {
        unlockedMap[id_source].push(id_target)
      }
    })
  })
  return unlockedMap;
}
  
// filenamToId[id] = id
function createFilenameToIdMap(){
  var filenameToId = {}
  files.forEach(file => {
    const folder = getTopFolder(file);
    if (ALLOWED_FOLDERS.length && !ALLOWED_FOLDERS.includes(folder))
      return;
    const raw = fs.readFileSync(file, "utf8");
    const { meta } = parseFrontmatter(raw);
    if (!meta.id) return;
    const filename = path.basename(file, ".md");
    filenameToId[filename] = meta.id.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  });
  return filenameToId;
}

// Fonction récursive pour nettoyer les relations de prérequis
function getMinimumPrereqs(id, prereqsMap) {
  const prereqs = prereqsMap[id] || [];

  function reachable(from, target) {
    const stack = [...(prereqsMap[from] || [])];
    const visited = new Set();

    while (stack.length) {
      const n = stack.pop();
      if (n === target) return true;

      if (!visited.has(n)) {
        visited.add(n);
        stack.push(...(prereqsMap[n] || []));
      }
    }

    return false;
  }

  return prereqs.filter(p =>
    !prereqs.some(q => q !== p && reachable(q, p))
  );
}


/*
Lire tous les markdown récursivement
*/
function getMarkdownFiles(dir) {

  let results = [];

  const list = fs.readdirSync(dir);

  list.forEach(file => {

    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);

    if (stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(filepath));
    }

    else if (file.endsWith(".md")) {
      results.push(filepath);
    }

  });

  return results;
}

/*
Dossier principal
*/
function getTopFolder(filepath) {

  const relative = path.relative(NODES_DIR, filepath);
  const parts = relative.split(path.sep);

  if (parts.length > 1) return parts[0];

  return "root";
}

function getSubFolder(filepath) {
  const relative = path.relative(NODES_DIR, filepath);
  const parts = relative.split(path.sep);
  if (parts.length >2) {return parts[1]}
  else {return false}
}

/*
Frontmatter simple
*/
function parseFrontmatter(content) {

  const match = content.match(/^---([\s\S]*?)---/);

  if (!match) {
    return { meta: {}, body: content };
  }

  let meta = {};

  try {
    meta = yaml.load(match[1]) || {};
  } catch (e) {
    console.error("Erreur YAML dans frontmatter:", e);
  }

  /*
  Normalisation de prerequis
  */

  if (meta.prerequis) {

    if (Array.isArray(meta.prerequis)) {

      // liste YAML → string compatible extractLinks
      meta.prerequis = meta.prerequis.join(" ");

    } else {

      // s'assurer que c'est une string
      meta.prerequis = String(meta.prerequis);

    }

  }

  const body = content.slice(match[0].length).trim();

  return { meta, body };

}

/*
Extraire [[links]]
*/
function extractLinks(text) {
  const matches = [...text.matchAll(/\[\[(.*?)\]\]/g)];
  return matches.map(m => m[1].trim());

}

function build() {
  // Noeuds et sous noeud parents pour chaque folder
  ALLOWED_FOLDERS.forEach(folder => {
    const id = `chapter_${folder.replace(/[^a-zA-Z0-9]/g,'_').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')}`;
    filenameToId[folder] = id;


    // Création des noeuds parents par chapitre et sous-parties et des noeuds labels de chapitre
    nodes.push({
      data: {
        id: id,
        label: folder,
        chapter: folder,
        prereqs: [],
      },
      classes: ['chapter-node'],
      grabbable: true, // A enlever 
      selectable: false
    });
    nodes.push({
      data : {
        id : id+"_label",
        parent: id,
        chapter: folder,
        label: folder,
        prereqs: [],
      },
      classes : ['chapter-label'],
      grabbable: true,
      selectable: false
    })
  const subfolders = getDirectories(path.join(NODES_DIR, folder))
  subfolders.forEach(subfolder=>{
      const subId = `subchapter_${subfolder.replace(/[^a-zA-Z0-9]/g,'_')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')}`;
        nodes.push({
          data: {
            id: subId,
            label: subfolder,
            chapter: folder,
            parent: id,
            prereqs: [],
          },
          classes: ['subchapter-node'],
          grabbable: true, // A enlever 
          selectable: false
        });
        nodes.push({
          data : {
            id : subId+"_label",
            parent: subId,
            chapter: folder,
            label: subfolder,
            prereqs: [],
          },
          classes : ['subchapter-label'],
          grabbable: true,
          selectable: false
        })
  });

  })


  /*
  PASS 2 : construire les nodes
  */

  files.forEach(file => {
    const folder = getTopFolder(file);
    const subfolder = getSubFolder(file);
    if (ALLOWED_FOLDERS.length && !ALLOWED_FOLDERS.includes(folder))
      return;
    
    const raw = fs.readFileSync(file, "utf8");
    const { meta, body } = parseFrontmatter(raw);
  
    if (!meta.id) return;
    const id = meta.id.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (!subfolder){
      var parentId = `chapter_${folder.replace(/[^a-zA-Z0-9]/g,'_').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')}`;
    } else{
      var parentId = `subchapter_${subfolder.replace(/[^a-zA-Z0-9]/g,'_').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')}`;
    }
    const filename = path.basename(file, ".md");
    const prereqs = minimumPrereqsMap[id] || []
    const unlocked = unlockedMap[id] || []
    const label = filename || ""
    const tooltip = meta.tooltip || ""
    const qcms = extractQCMs(body)
    const cleanBody = removeQCMBlocks(body)
    
    nodes.push({data : {
      id: id,
      parent:  parentId,
      prereqs: prereqs,
      chapter: folder, 
      label: label,
      unlocked: unlocked,
      tooltip: tooltip,
      quizz : qcms
          },
      classes: ['item-cours']
      })
               
    /*
    4️⃣ création des edges
    */
    
    prereqs.forEach(pr => {
      if (!pr){return;}
      edges.push({
        data: {
          id: `${pr}_to_${id}`,
          source: pr,
          target: id
        },
        classes: [],
        grabbable: false,
        selectable: false,
        pannable: true,
      });
    });
  
    /*
    contenu HTML
    */
  
    const html = renderMarkdown(body, filenameToId);
    writeContentFile(id, html);
  });
   
  // Ecriture et enregistrement du graphe au format json 
  const graph = {
    nodes,
    edges
  };
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(graph, null, 2)
  );
  console.log(`Graph généré : ${nodes.length} noeuds`);

}

build();

function writeContentFile(id, html){

  const dir="../content/nodes";
  
  if(!fs.existsSync(dir)){
  fs.mkdirSync(dir,{recursive:true});
  }
  
  fs.writeFileSync(
  `${dir}/${id}.html`,
  html
  );
  
  }

function convertWikiLinks(text, filenameToId){

  return text.replace(/\[\[(.*?)\]\]/g,(match,content)=>{
  
  let [name,label] = content.split("|")
  
  name=name.trim()
  label=(label || name).trim()
  
  const id = filenameToId[name]
  
  if(!id){
  console.warn("Lien inconnu :", name)
  return label
  }
  
  return `<a href="#" data_node="${id}">${label}</a>`
  
})}


function renderMarkdown(md, filenameToId){

  const withWikiLinks = convertWikiLinks(md, filenameToId)
  
  return marked.parse(withWikiLinks)
  
  }

  // QCM PARSER
  function extractQCMs(md) {
    const regex = /:::qcm([\s\S]*?):::/g;
    const matches = [...md.matchAll(regex)];
  
    return matches.map(match => {
      const block = match[1].trim();
      const lines = block.split("\n");
  
      let question = "";
      let explanation = "";
      const choices = [];
  
      lines.forEach(rawLine => {
        const line = rawLine.trim();
  
        if (!line) return;
  
        // question (tolérant)
        if (line.toLowerCase().startsWith("question")) {
          question = line.split(":").slice(1).join(":").trim();
          return;
        }
  
        // explanation (tolérant)
        if (line.toLowerCase().startsWith("explication")) {
          explanation = line.split(":").slice(1).join(":").trim();
          return;
        }
  
        // choix
        const choiceMatch = line.match(/- \[(x| )\] (.*)/i);
        if (choiceMatch) {
          const fullText = choiceMatch[2].trim();
  
          const parts = fullText.split("|");
          const text = parts[0]?.trim() || "";
          const feedback = parts[1]?.trim() || "";
  
          choices.push({
            text,
            correct: choiceMatch[1].toLowerCase() === "x",
            feedback
          });
        }
      });
  
      return {
        type: "qcm",
        question,
        choices,
        explanation
      };
    });
  }

function removeQCMBlocks(md) {
  return md.replace(/:::qcm[\s\S]*?:::/g, "");
}