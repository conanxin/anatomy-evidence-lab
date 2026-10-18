import {mkdir,writeFile} from 'node:fs/promises';
import {P11_EDITION_SCHEMA,P11_EDITION_CANDIDATES,p11Coverage} from '../src/p11-edition-sources.js';
const dest=new URL('../artifacts/p11-edition-candidates.json',import.meta.url);
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
await writeFile(dest,JSON.stringify({schema:P11_EDITION_SCHEMA,coverage:p11Coverage(),sources:P11_EDITION_CANDIDATES},null,2)+'\n');
console.log(`P11_EDITION_EXPORT_PASS addenda=${P11_EDITION_CANDIDATES.length} folios=${p11Coverage().verifiedOriginalFolio}`);
