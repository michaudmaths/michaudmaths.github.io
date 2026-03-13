const fs = require("fs");
const path = require("path");
const { marked } = require("marked")

const NODES_DIR = "../nodes";
const OUTPUT = "../_data/graph.json";

/*
Sous-dossiers autorisés
*/
const ALLOWED_FOLDERS = [
  "1 - Trigonométrie",
  "2 - Logique",
  "3 - Ensembles et applications",
  "4 - Entiers, sommes, récurrences",
  "5 - Nombres réels",
  "6 - Suites numériques",
  "7 - Fonction réelle de la variable réelle",
  "8 - Espaces probabilisés"
];

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

  if (!match) return { meta: {}, body: content };

  const meta = {};
  const lines = match[1].trim().split("\n");

  lines.forEach(line => {

    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();

    meta[key.trim()] = value;

  });

  const body = content.replace(match[0], "").trim();

  return { meta, body };

}

/*
Extraire [[links]]
*/
function extractLinks(text) {
  console.log(text)
  const matches = [...text.matchAll(/\[\[(.*?)\]\]/g)];
  return matches.map(m => m[1].trim());

}

/*
Convertir liens dans le texte
*/
function convertLinks(text, filenameToId) {

  return text.replace(/\[\[(.*?)\]\]/g, (_, name) => {

    const id = filenameToId[name];

    if (!id) return name;

    return `<a href="#" data-node="${id}">${name}</a>`;

  });

}

function build() {

  const files = getMarkdownFiles(NODES_DIR);

  const filenameToId = {};
  const nodes = [];
  const edges = [];
  const rawPrereqs = {};

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
  
    prereqIds.forEach(pr => {
  
      edges.push({
        data: {
          id: `${pr}_${meta.id}`,
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
        label: filename || meta.id,
        category: folder,
        prerequis: prereqIds || []
      }
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
  
  return `<a href="#" data-node="${id}">${label}</a>`
  
})}


function renderMarkdown(md, filenameToId){

  const withWikiLinks = convertWikiLinks(md, filenameToId)
  
  return marked.parse(withWikiLinks)
  
  }