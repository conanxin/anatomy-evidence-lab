import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const read = f => readFile(new URL(f,root),'utf8');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
let html = await read('index.html');
const css = (await read('styles.css')).replace(/^@import url\(.+?\);\s*/m,'');
const files = ['src/btree.js','src/scene.js','src/evidence.js','src/comparison.js','src/cost-model.js','src/learning.js','src/sensitivity.js','src/robustness.js','src/app.js'];
const sources = await Promise.all(files.map(read));
const bundled = sources.map((src,i) => `\n// bundled: ${files[i]}\n` + src.replace(/^export\s+/gm,'').replace(/^import\s+.+?;\s*$/gm,'')).join('\n');
html = html.replace('<link rel="stylesheet" href="./styles.css">', `<style>\n${css}\n</style>`);
html = html.replace('<script type="module" src="./src/app.js"></script>', '');
html = html.replace('</body>', `<script>\n${bundled}\n</script>\n</body>`);
if(html.includes('./src/app.js')||html.includes('./styles.css')) throw new Error('Bundle remains external');
await writeFile(new URL('index.html',dist),html);
await writeFile(new URL('study-static.html',dist),html.replace('<body>','<body data-study-condition="static">'));
await writeFile(new URL('study-interactive.html',dist),html.replace('<body>','<body data-study-condition="interactive">'));
console.log(`Build PASS: dist/index.html + study-static.html + study-interactive.html (${Buffer.byteLength(html)} bytes; self-contained each)`);

// P9 standalone documentary mechanism figure; independent of the B-tree view.
let historical=await read('jiegao.html');
const historicalCSS=await read('jiegao.css');
const historicalParts=['src/jiegao.js','src/jiegao-ui.js'];
const historicalSources=await Promise.all(historicalParts.map(read));
const historicalBundle=historicalSources.map((src,i)=>`\n// bundled: ${historicalParts[i]}\n`+src.replace(/^export\s+/gm,'').replace(/^import\s+.+?;\s*$/gm,'')).join('\n');
historical=historical.replace('<link rel="stylesheet" href="./jiegao.css">',`<style>\n${historicalCSS}\n</style>`);
historical=historical.replace('<script type="module" src="./src/jiegao-ui.js"></script>','');
historical=historical.replace('</body>',`<script>\n${historicalBundle}\n</script></body>`);
if(historical.includes('./src/jiegao-ui.js')||historical.includes('./jiegao.css'))throw new Error('Historical figure contains external dependency');
await writeFile(new URL('jiegao.html',dist),historical);
console.log(`P9 historical mechanism: dist/jiegao.html (${Buffer.byteLength(historical)} bytes)`);

// P10 atlas: separately typed source evidence without claiming an original folio.
const {renderHistoricalAtlas}=await import('../src/historical-atlas.js');
const p10atlas=renderHistoricalAtlas();
await writeFile(new URL('source-atlas.html',dist),p10atlas);
console.log('P10 source atlas: dist/source-atlas.html');
