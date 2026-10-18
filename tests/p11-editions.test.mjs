import test from 'node:test';
import assert from 'node:assert/strict';
import {P11_EDITION_CANDIDATES,p11Coverage,assessImageCitation,renderP11EditionAtlas,getP11EditionSource} from '../src/p11-edition-sources.js';

test('P11 digital resource IDs are unique, and every edition candidate has actionable locator and URL',()=>{
 assert.equal(new Set(P11_EDITION_CANDIDATES.map(s=>s.id)).size,4);
 for(const s of P11_EDITION_CANDIDATES){ assert.match(s.url,/^https:\/\//); assert.ok(s.locator.length>22); assert.ok(s.verification.includes('PENDING'));assert.equal(s.originalFolio,null);assert.equal(s.originalFolioVerified,false); }
});
test('P11 version-years not confused: Ming 1530 versus Qing 1776',()=>{
 assert.equal(getP11EditionSource('P11-MING-JIAJING-COMMONS').editionYear,1530);
 assert.equal(getP11EditionSource('P11-NLC-WUYINGDIAN-COMMONS').editionYear,1776);
 assert.equal(getP11EditionSource('P11-JAPAN-NAIKAKU-NONGSHU12').editionYear,null);
});
test('P11 edition-level discovery is never silently promoted to verified folio',()=>{
 assert.equal(p11Coverage().verifiedOriginalFolio,0);
 assert.equal(p11Coverage().combinedEntries,11);
 assert.deepEqual(assessImageCitation({sourceId:'P11-MING-JIAJING-COMMONS',pdfPage:100,folio:'卷十八某叶',editionYear:1530}), {accepted:false,reason:'SPECIFIC_FOLIO_NOT_VERIFIED'});
});
test('P11 unknown source cannot create a historical image citation',()=>{
 assert.equal(assessImageCitation({sourceId:'bad',pdfPage:1,folio:'甲叶',editionYear:1530}).reason,'SOURCE_ID_UNKNOWN');
});
test('P11 historic atlas renders 11 source cards and admits zero verified folios',()=>{
 const page=renderP11EditionAtlas(); assert.equal((page.match(/class="source"/g)||[]).length,11);assert.match(page,/十一条来源线索/); assert.match(page,/零张核验到叶/);assert.match(page,/ZHSY100417/); assert.match(page,/日本国立公文书馆/); assert.match(page,/1530/);
});
