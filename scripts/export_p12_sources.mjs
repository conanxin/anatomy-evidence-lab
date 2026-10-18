import {mkdir,writeFile} from 'node:fs/promises';
import {P12_SCHEMA,P12_ADDITIONAL_WITNESSES,p12Coverage} from '../src/p12-folio-sources.js';
await mkdir(new URL('../artifacts/', import.meta.url),{recursive:true});
await writeFile(new URL('../artifacts/p12-folio-witnesses.json',import.meta.url),JSON.stringify({schema:P12_SCHEMA,coverage:p12Coverage(),witnesses:P12_ADDITIONAL_WITNESSES},null,2)+'\n');
console.log(`P12_SOURCE_EXPORT_PASS witnesses=${P12_ADDITIONAL_WITNESSES.length} folio_verified=${p12Coverage().verifiedOriginalFolio}`);
