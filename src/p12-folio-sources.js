/** P12: independent catalogue witnesses are not a verified jiégāo folio. */
import { HISTORICAL_SOURCES, renderHistoricalAtlas } from './historical-atlas.js';
import { P11_EDITION_CANDIDATES } from './p11-edition-sources.js';

export const P12_SCHEMA = 'anatomy/p12-folio-witnesses-v1';
export const P12_ADDITIONAL_WITNESSES = Object.freeze([
  Object.freeze({
    id:'P12-HARVARD-YENCHING-1530-FRAGMENT',
    title:'哈佛燕京藏《農書》嘉靖九年本残存《農器圖譜》：T 8036 1138',
    genre:'INSTITUTIONAL_PARTIAL_SCAN', repository:'Harvard-Yenching Library · Harvard Chinese Rare Books',
    url:'https://id.lib.harvard.edu/curiosity/chinese-rare-books/49-990078925110203941',
    locator:'Harvard-Yenching T 8036 1138；4册影印，Commons Harvard drs 54071517 v.1–v.4；「此本存農器圖譜之部份，凡涉及卷數處皆被剜改」',
    dateLabel:'馆藏标注明嘉靖九年（1530）；残存卷数及桔槔条是否留存在本需核',
    verification:'PARTIAL_SURVIVAL_NOT_FOLIO_VERIFIED', sourceClass:'INSTITUTIONAL_PARTIAL_DIGITIZATION',
    editionYear:1530, originalFolio:null, originalFolioVerified:false,
    support:'证实另一独立残本馆藏标识及图谱残存事实；不能推断含卷十八桔槔图，更不能把残本假作全本。'
  }),
  Object.freeze({
    id:'P12-NAJDA-300-0073-1530',
    title:'日本国立公文书馆内阁文库：農書，300-0073（六册）',
    genre:'INSTITUTIONAL_MING_EDITION_CATALOG', repository:'国立公文書館デジタルアーカイブ／内閣文庫',
    url:'https://www.digital.archives.go.jp/file/1083466.html',
    locator:'請求番号300-0073；六冊；明嘉靖09年山東布政司刊本；可阅图像入口需另行核叶',
    dateLabel:'馆藏目录确认明嘉靖九年刻本；原图单叶/版心尚未打开核对',
    verification:'INSTITUTIONAL_EDITION_VERIFIED_FOLIO_PENDING', sourceClass:'INSTITUTIONAL_CATALOG',
    editionYear:1530, originalFolio:null, originalFolioVerified:false,
    support:'确证同版年与实物藏所；不能在未打开卷册图像时填桔槔原叶编号。'
  }),
  Object.freeze({
    id:'P12-NANJING-01780-1530',
    title:'国家珍贵古籍名录号01780：南京图书馆藏王祯《農書》',
    genre:'NATIONAL_RARE_BOOKS_CATALOG', repository:'《国家珍贵古籍名录》／南京图书馆',
    url:'https://oss.clcn.net.cn/bjgujibaohu/Editor/server/upload/uploadfiles/2014-02-20-394df96cf1-a186-41a0-ae95-52c4bd65b7ae.pdf',
    locator:'国家珍贵古籍名录号01780；三十六卷；明嘉靖九年（1530）山东布政使司刻本；馆藏南京图书馆。Commons NJlib-0110709 分册是否即该藏本尚需馆号对照',
    dateLabel:'馆藏书目及版年已定位，图像分册与特定书叶尚未闭合',
    verification:'CATALOG_ID_CONFIRMED_SCAN_MAPPING_PENDING', sourceClass:'RARE_BOOKS_REGISTRY',
    editionYear:1530, originalFolio:null, originalFolioVerified:false,
    support:'提供国家目录与机构对应的书目层级证据；不能把Commons同名数字文件自动映射为01780本。'
  }),
]);
const all = Object.freeze([...HISTORICAL_SOURCES,...P11_EDITION_CANDIDATES,...P12_ADDITIONAL_WITNESSES]);
if(new Set(all.map(s=>s.id)).size!==all.length) throw new Error('duplicate P12 source IDs');

/** Never upgrade on applicant-supplied page hints alone; a source record needs an independent, versioned review. */
export function p12FolioCitationGate({sourceId,pdfPage,leaf,imageUrl,sourceSha256,caption}) {
  const source=all.find(s=>s.id===sourceId);
  if(!source) return Object.freeze({accepted:false,reason:'UNKNOWN_SOURCE'});
  if(source.originalFolioVerified!==true || !source.originalFolio) return Object.freeze({accepted:false,reason:'FOLIO_NOT_INDEPENDENTLY_VERIFIED'});
  if(!Number.isInteger(pdfPage)||pdfPage<1||typeof leaf!=='string'||!leaf.trim()||
     typeof imageUrl!=='string'||!/^https:\/\//.test(imageUrl)||
     typeof sourceSha256!=='string'||!/^[a-f0-9]{64}$/i.test(sourceSha256)||
     typeof caption!=='string'||!caption.includes('桔'))
     return Object.freeze({accepted:false,reason:'REQUIRED_EVIDENCE_MISSING'});
  return Object.freeze({accepted:true,reason:'IMAGE_AND_FOLIO_REVIEWED'});
}
export function p12Coverage(){return Object.freeze({total:all.length,p10:HISTORICAL_SOURCES.length,p11:P11_EDITION_CANDIDATES.length,p12:P12_ADDITIONAL_WITNESSES.length,verifiedOriginalFolio:all.filter(s=>s.originalFolioVerified===true).length,gate:'EXACT_JIEGAO_FOLIO_NOT_LOCATED'});}
export function renderP12FolioAtlas(){return renderHistoricalAtlas(all).replaceAll('P10｜桔槔史料与图版版本地图','P12｜桔槔明刊藏本与原叶核验').replace('桔槔：七条来源线索，零张可确认原刊叶面','桔槔：十四条来源线索，原刊桔槔确切叶面仍待核').replace('P10 以版本、正文、二手转载和馆藏目录为不同来源类型。','P12 增补哈佛燕京残本、日本内阁文库1530年本和国家古籍名录01780；目录、影印和原叶分层显示。');}
