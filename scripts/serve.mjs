import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, relative, sep } from 'node:path';
const root=resolve(process.argv[2] || new URL('../dist/',import.meta.url).pathname);
const port=Number(process.env.PORT||4317);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
createServer(async (req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const f=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if (relative(root,f).startsWith('..'+sep)||f===root||(!f.startsWith(root+sep))) {res.writeHead(403);res.end();return;}
    const data=await readFile(f);
    res.writeHead(200,{'Content-Type':types[extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
  }catch {res.writeHead(404);res.end('Not Found');}
}).listen(port,'127.0.0.1',()=>console.log(`Preview http://127.0.0.1:${port}/ (serving ${root})`));
