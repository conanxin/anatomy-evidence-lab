/** Version-aware source inventory. Zero verified original jiégāo folios at this stage. */
export const HISTORICAL_SOURCES=Object.freeze([
  {
    "id": "AT-ZZ",
    "title": "《庄子·天地》传世文本",
    "genre": "TRANSMITTED_TEXT",
    "repository": "Chinese Text Project",
    "url": "https://ctext.org/text.pl?if=en&node=2795&remap=gb&show=parallel",
    "locator": "天地·子贡与汉阴丈人",
    "dateLabel": "先秦文本传统（传世校录）",
    "verification": "TEXT_LOCATED",
    "originalFolio": null,
    "support": "后重前轻的提水叙述，不提供实物尺寸"
  },
  {
    "id": "AT-WZ",
    "title": "《王祯农书》卷十八·桔槔",
    "genre": "TRANSCRIBED_TEXT",
    "repository": "Wikisource",
    "url": "https://zh.wikisource.org/w/index.php?title=王禎農書/卷十八&oldid=1142890",
    "locator": "卷十八·农器图谱十三·灌溉门，桔槔与辘轳",
    "dateLabel": "元王祯著；链接为现代转录",
    "verification": "TEXT_LOCATED",
    "originalFolio": null,
    "support": "描述俯仰，区别于辘轳圆转；引述旧典不能算独立实测"
  },
  {
    "id": "AT-SIKU",
    "title": "《钦定四库全书》本《农书》影印分册",
    "genre": "SCANNED_EDITION_CATALOG",
    "repository": "浙江大学图书馆／CADAL／CTP",
    "url": "https://ctext.org/library.pl?if=gb&remap=gb&res=5434",
    "locator": "卷十七～卷十八分册；桔槔叶面尚未定位",
    "dateLabel": "清代四库全书传本，非1313年元刊原本",
    "verification": "VOLUME_LOCATED_FOLIO_PENDING",
    "originalFolio": null,
    "support": "证明影印分册可寻，不证明已经找到桔槔原页"
  },
  {
    "id": "AT-PALACE",
    "title": "故宫博物院藏《农书》",
    "genre": "INSTITUTIONAL_EDITION_RECORD",
    "repository": "故宫博物院（北京）",
    "url": "https://www.dpm.org.cn/ancient/hall/151496.html",
    "locator": "武英殿聚珍版馆藏目录，尚无桔槔单叶定位",
    "dateLabel": "清乾隆四十一年1776年，16册2函",
    "verification": "CATALOG_VERIFIED_IMAGE_PENDING",
    "originalFolio": null,
    "support": "可核对具体版刻信息，不是元刊直接扫描"
  },
  {
    "id": "AT-SANCAI-TEXT",
    "title": "《三才图会》器用十卷·桔槔",
    "genre": "EDITED_DIGITAL_CHAPTER",
    "repository": "识典古籍",
    "url": "https://www.shidianguji.com/zh/book/HY7188/chapter/1m6m51x69yo8k",
    "locator": "器用十卷独立条目“桔𫽿”",
    "dateLabel": "明王圻、王思义撰辑；底本仍需匹配馆藏本",
    "verification": "CHAPTER_LOCATED_FOLIO_PENDING",
    "originalFolio": null,
    "support": "条目及图文关系可核，不等于某馆原刊同叶"
  },
  {
    "id": "AT-SANCAI-CATALOG",
    "title": "台北故宫《三才图会》1609原刊本",
    "genre": "INSTITUTIONAL_EDITION_RECORD",
    "repository": "国立故宫博物院古籍舆图系统",
    "url": "https://rarebooks-maps.npm.edu.tw/index.php?act=Display%2Fimage%2F130834lC-o%3Dwp",
    "locator": "贈善004931–005023，93册，网页注明尚未数字化",
    "dateLabel": "明万历三十七年1609年刊本",
    "verification": "CATALOG_ONLY_NOT_DIGITIZED",
    "originalFolio": null,
    "support": "只证明1609馆藏版本，不证明其桔槔叶面已取得"
  },
  {
    "id": "AT-SANCAI-REPRINT",
    "title": "明代《三才图会》桔槔图（2022年转载）",
    "genre": "SECONDARY_IMAGE_REPRODUCTION",
    "repository": "中国节水网转载《中国三峡》杂志",
    "url": "https://www.waterconserving.cn/universal/detail/6165",
    "locator": "汲水工具首幅古版画及图注",
    "dateLabel": "2022年11月14日转载，原叶码/底本未说明",
    "verification": "SECONDARY_ATTRIBUTION_ONLY",
    "originalFolio": null,
    "support": "可作为查图线索，不可冒称王祯元刊或1609原刊扫描"
  }
].map(x=>Object.freeze(x)));
export const HISTORY_ATLAS_SCHEMA="anatomy/historical-atlas-v1";
const records=new Map(HISTORICAL_SOURCES.map(x=>[x.id,x]));
export function getHistoricalSource(id){return records.get(id)??null}
export function historicalCoverage(){return Object.freeze({catalogedEntries:HISTORICAL_SOURCES.length,verifiedOriginalFolio:HISTORICAL_SOURCES.filter(x=>x.verification==="ORIGINAL_FOLIO_VERIFIED").length,transcriptEntries:HISTORICAL_SOURCES.filter(x=>["TRANSMITTED_TEXT","TRANSCRIBED_TEXT"].includes(x.genre)).length,scannedVolumeFound:HISTORICAL_SOURCES.some(x=>x.genre==="SCANNED_EDITION_CATALOG"),status:"PARTIAL_EDITION_PROVENANCE_NO_FOLIO"})}
export function reconstructionGate({sourceId,claimedExactness}){
const s=getHistoricalSource(sourceId);if(!s)return {allowed:false,reason:"UNKNOWN_SOURCE"};
if(claimedExactness==="EXACT_HISTORICAL_GEOMETRY")return {allowed:false,reason:"NO_MEASURED_FOLIO_OR_ARTIFACT"};
if(claimedExactness==="ORIGINAL_FOLIO_IMAGE"&&!s.originalFolio)return {allowed:false,reason:"FOLIO_NOT_VERIFIED"};
if(claimedExactness==="TEACHING_SCHEMATIC")return {allowed:true,reason:"ILLUSTRATIVE_ONLY"};
return {allowed:false,reason:"CLAIM_UNSUPPORTED"}
}
const safe=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function renderHistoricalAtlas(sources=HISTORICAL_SOURCES){
const cards=sources.map(s=>'<article class="source"><p class="kind">'+safe(s.genre)+'</p><h2>'+safe(s.title)+'</h2><p>'+safe(s.dateLabel)+'</p><p>'+safe(s.repository)+'</p><p><strong>定位：</strong>'+safe(s.locator)+'</p><p><strong>证据边界：</strong>'+safe(s.support)+'</p><p><strong>状态：</strong><code>'+safe(s.verification)+'</code></p><a href="'+safe(s.url)+'" target="_blank" rel="noopener noreferrer">查阅来源 ↗</a></article>').join("\n");
return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>P10 桔槔史料版本地图</title><style>body{margin:0;background:#f4f0e8;color:#263a34;font:16px/1.6 system-ui,-apple-system,sans-serif}main{max-width:1080px;margin:auto;padding:24px}h1{font-size:clamp(24px,4vw,38px)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px}.source{background:white;padding:18px;border:1px solid #d7d0c4;border-radius:12px;overflow-wrap:anywhere}.source h2{font-size:1.1rem}.kind{font:600 11px monospace;color:#416553}.notice{padding:14px;background:#fff4d9;border-left:4px solid #98763f}a{color:#236157}code{overflow-wrap:anywhere}</style></head><body><main><p><a href="jiegao.html">← 返回桔槔原理图</a></p><h1>桔槔：七条来源线索，零张可确认原刊叶面</h1><p class="notice">馆藏版本、传世转录、原卷影印集合及二手转载分开记录。不能把转载图冒充1313年王祯原刊或1609年《三才图会》原叶。网页只支持教学机械示意，不证明真实尺寸。</p><section class="grid">'+cards+'</section><p>后续门槛：institution / collection / edition / volume / folio / stable image / image hash 同版核对。</p></main></body></html>'
}
