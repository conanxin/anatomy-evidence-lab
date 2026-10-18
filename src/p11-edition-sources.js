/** P11: record-level scan discovery, NOT a claim that the specific jiégāo folio is verified. */
import { HISTORICAL_SOURCES, renderHistoricalAtlas } from './historical-atlas.js';

export const P11_EDITION_SCHEMA = 'anatomy/p11-edition-candidates-v1';

export const P11_EDITION_CANDIDATES = Object.freeze([
  Object.freeze({
    id: 'P11-MING-JIAJING-COMMONS',
    title: '《農書》明嘉靖九年山東布政使司刻本：454页数字书影',
    genre: 'DIGITIZED_MING_EDITION',
    repository: 'Wikimedia Commons / 中華再造善本明清編（国家图书馆出版社来源标记）',
    url: 'https://commons.wikimedia.org/wiki/File:ZHSY100417_農書_元王禎撰_明嘉靖九年山東布政使司刻本.pdf',
    locator: 'ZHSY100417；PDF共454页；《農器圖譜》「桔槔」的准确PDF页号及书叶未查验',
    dateLabel: '所据明嘉靖九年（1530）刻本；数字出版/扫描文件非元代1313年原刊',
    verification: 'EDITION_PDF_IDENTIFIED_FOLIO_PENDING', originalFolio: null,
    support: '确认明确刻本来源的扫描文件存在；尚不能把其中任意图说成桔槔所处叶面',
    sourceClass: 'DIGITIZED_EDITION', editionYear: 1530, filePages: 454,
    originalFolioVerified: false, originalFileType: 'application/pdf',
  }),
  Object.freeze({
    id: 'P11-MING-JIAJING-SHUGE',
    title: '书格：嘉靖九年山东布政司刊《农书》',
    genre: 'DIGITIZED_EDITION_CATALOG',
    repository: '书格数字图书馆',
    url: 'https://old.shuge.org/ebook/nong-shu/',
    locator: '2017-05-24资源页面，记录920MB原色/57.3MB黑白PDF及刻本信息；未核查其桔槔叶',
    dateLabel: '明嘉靖九年（1530）山东布政司刊本；网络资源2017年介绍',
    verification: 'DIGITAL_RESOURCE_INDEXED_FOLIO_PENDING', originalFolio: null,
    support: '与Commons的同刻年资源构成可比对线索，但不可未经核对宣称两份PDF页码或版别完全一致',
    sourceClass: 'RESOURCE_CATALOG', editionYear: 1530,
    originalFolioVerified: false,
  }),
  Object.freeze({
    id: 'P11-NLC-WUYINGDIAN-COMMONS',
    title: '国图数字古籍《農書》武英殿聚珍版16分册',
    genre: 'NLC_DIGITIZED_VOLUME_INDEX',
    repository: '中国国家图书馆数字古籍 / Wikimedia Commons馆藏文件列表',
    url: 'https://commons.wikimedia.org/wiki/Category:%E8%BE%B2%E6%9B%B8',
    locator: 'NLC892-412000007188第1–16册；第12册NLC892-412000007188-231991、第13册231992（卷十八所在册未逐页查验）',
    dateLabel: '武英殿清乾隆时期聚珍版系统；不是明嘉靖九年刻本',
    verification: 'MULTI_VOLUME_SCANS_IDENTIFIED_FOLIO_PENDING', originalFolio: null,
    support: '提供馆藏扫描分册标识；目前仍没有桔槔对应PDF页和卷内叶码',
    sourceClass: 'SCANNED_VOLUME_INDEX', editionYear: 1776,
    originalFolioVerified: false,
  }),
  Object.freeze({
    id: 'P11-JAPAN-NAIKAKU-NONGSHU12',
    title: '日本国立公文书馆内阁文库《農書12》',
    genre: 'INSTITUTIONAL_VOLUME_CATALOG',
    repository: '日本国立公文书馆数字档案',
    url: 'https://www.digital.archives.go.jp/item/4770067',
    locator: '請求番号300-0080；冊次0012；条目《農書12》；公开状态；具体版年和桔槔位置未核实',
    dateLabel: '实物刻印年代在此记录中尚未确认，不得视为1530明刊同版本',
    verification: 'INSTITUTIONAL_VOLUME_LOCATED_FOLIO_PENDING', originalFolio: null,
    support: '另一国家级馆藏目录供交叉校勘，不能据题名断定与特定PDF同版',
    sourceClass: 'CATALOG_RECORD', editionYear: null,
    originalFolioVerified: false,
  }),
]);

const allIds = new Set([...HISTORICAL_SOURCES, ...P11_EDITION_CANDIDATES].map(x=>x.id));
if (allIds.size !== HISTORICAL_SOURCES.length + P11_EDITION_CANDIDATES.length) throw new Error('Historical source IDs duplicate');

export function p11Coverage() {
  return Object.freeze({
    baselineEntries: HISTORICAL_SOURCES.length,
    addedEntries: P11_EDITION_CANDIDATES.length,
    combinedEntries: HISTORICAL_SOURCES.length+P11_EDITION_CANDIDATES.length,
    verifiedOriginalFolio: P11_EDITION_CANDIDATES.filter(s=>s.originalFolioVerified).length,
    outcome:'EDITION_LEVEL_DIGITAL_SURROGATES_FOUND_FOLIO_UNVERIFIED',
  });
}

export function getP11EditionSource(id) { return P11_EDITION_CANDIDATES.find(s=>s.id===id)??null; }

export function assessImageCitation({sourceId,pdfPage,folio,editionYear}) {
  const record = getP11EditionSource(sourceId);
  if (!record) return Object.freeze({accepted:false,reason:'SOURCE_ID_UNKNOWN'});
  if (!record.originalFolioVerified || !record.originalFolio) return Object.freeze({accepted:false,reason:'SPECIFIC_FOLIO_NOT_VERIFIED'});
  if (!Number.isInteger(pdfPage) || pdfPage<1 || typeof folio!=='string' || !folio.trim()) return Object.freeze({accepted:false,reason:'PAGE_AND_FOLIO_REQUIRED'});
  if (editionYear!==record.editionYear) return Object.freeze({accepted:false,reason:'EDITION_MISMATCH'});
  return Object.freeze({accepted:true,reason:'SOURCE_AND_FOLIO_MATCHED'});
}

export function renderP11EditionAtlas(){
  const html = renderHistoricalAtlas([...HISTORICAL_SOURCES,...P11_EDITION_CANDIDATES]);
  return html.replaceAll('P10｜桔槔史料与图版版本地图','P11｜桔槔版本与图像检索图谱')
    .replace('桔槔：七条来源线索，零张可确认原刊叶面','桔槔：十一条来源线索，零张核验到叶的原刊图')
    .replace('P10 以版本、正文、二手转载和馆藏目录为不同来源类型。','P11 新增明嘉靖九年与馆藏数字书影线索，继续区分原刊年代、现代数字复制和二手转载。');
}
