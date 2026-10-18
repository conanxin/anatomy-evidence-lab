import test from 'node:test';
import assert from 'node:assert/strict';
import { P12_ADDITIONAL_WITNESSES,p12Coverage,p12FolioCitationGate,renderP12FolioAtlas } from '../src/p12-folio-sources.js';

test('P12: three separately identifiable institution/catalogue witnesses, no automatic folio promotion',()=>{
  assert.equal(P12_ADDITIONAL_WITNESSES.length,3);
  assert.equal(p12Coverage().total,14);
  assert.equal(p12Coverage().verifiedOriginalFolio,0);
  for(const w of P12_ADDITIONAL_WITNESSES){
    assert.ok(w.url.startsWith('https://'));
    assert.equal(w.editionYear,1530);
    assert.equal(w.originalFolioVerified,false);
    assert.equal(w.originalFolio,null);
    assert.ok(w.locator.length>40);
  }
});
test('P12: apparent precise folio and hash cannot override absence of independently verified historical image',()=>{
  for(const w of P12_ADDITIONAL_WITNESSES){
    const got=p12FolioCitationGate({sourceId:w.id,pdfPage:217,leaf:'卷十八第十二葉',imageUrl:'https://example.org/image.jpg',sourceSha256:'a'.repeat(64),caption:'桔槔'});
    assert.deepEqual(got,{accepted:false,reason:'FOLIO_NOT_INDEPENDENTLY_VERIFIED'});
  }
});
test('P12: error on unknown source',()=>{
  assert.equal(p12FolioCitationGate({sourceId:'NOT_A_SOURCE'}).reason,'UNKNOWN_SOURCE');
});
test('P12: portable HTML includes all 14 sources and does not declare an original folio',()=>{
  const h=renderP12FolioAtlas();
  assert.equal((h.match(/class="source"/g)||[]).length,14);
  assert.ok(h.includes('十四条来源'));
  assert.ok(h.includes('原刊桔槔确切叶面仍待核'));
  assert.ok(h.includes('300-0073'));
  assert.ok(h.includes('01780'));
  assert.ok(h.includes('T 8036 1138'));
});
