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
];


// Fonction récursive pour nettoyer les relations de prérequis
const memo = new Map();

function getAllPrereqs(id, prereqsMap) {
  if (memo.has(id)) return memo.get(id);

  const result = new Set();

  for (const p of prereqsMap[id] || []) {
    result.add(p);
    for (const t of getAllPrereqs(p, prereqsMap)) {
      result.add(t);
    }
}
memo.set(id, result);
return result;
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

  const files = getMarkdownFiles(NODES_DIR);

  const filenameToId = {};
  const nodes = [];
  const edges = [];
  const rawPrereqs = {};


  // Noeuds parents pour chaque folder
  ALLOWED_FOLDERS.forEach(folder => {
    const id = `folder_${folder.replace(/\s+/g, "_")}`;
    filenameToId[folder] = id;
    nodes.push({
      data: {
        id: id,
        label: folder,
        category: folder,
        prerequis: [],
      },
      grabbable: false
    });
    nodes.push({
      data : {
        id : id+"_label",
        parent: id,
        category: folder,
        label: folder,
        prerequis: [],
      },
      classes : ['chapter_label'],
    })
  });



  /*
  PASS 1 : lire les id
  */
  files.forEach(file => {

    const folder = getTopFolder(file);

    if (ALLOWED_FOLDERS.length && !ALLOWED_FOLDERS.includes(folder))
      return;

    const raw = fs.readFileSync(file, "utf8");
    const { meta } = parseFrontmatter(raw);

    if (!meta.id) return;

    const filename = path.basename(file, ".md");

    filenameToId[filename] = meta.id;

  });

  /*
  PASS 2 : construire les nodes
  */

  files.forEach(file => {

    const folder = getTopFolder(file);
  
    if (ALLOWED_FOLDERS.length && !ALLOWED_FOLDERS.includes(folder))
      return;
  
    const raw = fs.readFileSync(file, "utf8");
  
    const { meta, body } = parseFrontmatter(raw);
  
    if (!meta.id) return;
  
    const filename = path.basename(file, ".md");
  
    /*
    1️⃣ prerequis dans le frontmatter
    */
  
    let prereqNames = [];
    console.log(meta.prerequis)
    if (meta.prerequis) {
      prereqNames = extractLinks(meta.prerequis);
    }
  
    /*
    3️⃣ conversion vers ids
    */
  
    const prereqIds = prereqNames
      .map(name => filenameToId[name])
      .filter(Boolean);
  
    /*
    4️⃣ création des edges
    */
    
    prereqsList = prereqIds
    // let prereqsMap = {}
    // files.forEach(file =>{
    //   const filename = path.basename(file, ".md");
    //   id = filenameToId[filename]
    //   const raw = fs.readFileSync(file, "utf8");
    //   const { meta, body } = parseFrontmatter(raw);
    //   prereqNames = extractLinks(meta.prerequis);
    //   prereqsMap[id] = prereqNames
    //   .map(name => filenameToId[name])
    //   .filter(Boolean);
    //   })

    // let prereqsList = getAllPrereqs(meta.id, prereqsMap)
    // console.log(prereqsList)

    prereqsList.forEach(pr => {
      if (!pr){return;}
      edges.push({
        data: {
          id: `${pr}->${meta.id}`,
          source: pr,
          target: meta.id
        }
      });
  
    });


    /*
    node
    */

    nodes.push({
      data: {
        id: meta.id,
        label: meta.title || filename || meta.id,
        parent : `folder_${folder.replace(/\s+/g, "_")}`,
        category: folder,
        prerequis: prereqIds || []
      },
      classes: ['item_cours']
    });
  
    /*
    contenu HTML
    */
  
    const html = renderMarkdown(body, filenameToId);
  
    writeContentFile(meta.id, html);
  
  });

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
