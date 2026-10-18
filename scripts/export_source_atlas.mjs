import {mkdir,writeFile} from 'node:fs/promises';
import {HISTORICAL_SOURCES,historicalCoverage,HISTORY_ATLAS_SCHEMA} from '../src/historical-atlas.js';
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
await writeFile(new URL('../artifacts/p10-source-atlas.json',import.meta.url),JSON.stringify({schema:HISTORY_ATLAS_SCHEMA,coverage:historicalCoverage(),sources:HISTORICAL_SOURCES},null,2)+'\n');
console.log('P10_ATLAS_PASS sources='+HISTORICAL_SOURCES.length+' verifiedOriginalFolio='+historicalCoverage().verifiedOriginalFolio);
