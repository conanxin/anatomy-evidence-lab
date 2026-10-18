#!/usr/bin/env node
/** Only scores rows from an explicitly supplied JSON file; no synthetic participants. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { aggregateStudy } from '../src/learning.js';
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const input=process.argv[2];
  if(!input){
    console.error('Usage: node scripts/score_study.mjs <real-pseudonymous-responses.json>');
    process.exitCode=2;
  }else{
    const rows=JSON.parse(await readFile(input,'utf8'));
    const summary=aggregateStudy(rows);
    const dest=new URL('../artifacts/study-summary.json',import.meta.url);
    await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
    await writeFile(dest,JSON.stringify(summary,null,2)+'\n');
    console.log(`Study summary: ${fileURLToPath(dest)}; status: ${summary.status}`);
  }
}
