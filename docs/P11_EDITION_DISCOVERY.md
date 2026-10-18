# P11｜桔槔史料：明嘉靖本影印资源定位与原叶核验门槛

**核查日期：2026-10-18。** P11 不是已完成的图像复原，而是将原先只知道清代版本与明代《三才图会》转载图，推进至**有明确版本题名和可点击 PDF 的明嘉靖本扫描资源**。本阶段在可访问的来源页核实了文件元数据与条目，**未从卷十八扫描中亲眼定位、裁剪或校订桔槔原叶**。

## 新发现的四条来源（不可互相替代）

| P11 ID | 机构/资源及精确定位 | 能证明 | 不能证明 |
|---|---|---|---|
| P11-MING-JIAJING-COMMONS | [Wikimedia Commons `ZHSY100417`：《農書》明嘉靖九年山東布政使司刻本 PDF](https://commons.wikimedia.org/wiki/File:ZHSY100417_農書_元王禎撰_明嘉靖九年山東布政使司刻本.pdf)，文件为 454 页、约151.71MB，Commons 标注来源 `The Reconstruction of Chinese Rare Books` | 有一个以 1530 年刻本为底的现代数字扫描/复制资源，文件编号与页总数可复核 | 尚未确认桔槔所在的 PDF 页索引、卷内叶码；不能称它为元代1313年原印 |
| P11-MING-JIAJING-SHUGE | [书格《農書》](https://old.shuge.org/ebook/nong-shu/)，明嘉靖九年山东布政司刊，原色PDF约920MB、黑白版约57.3MB | 另一套标注刻年的数字影印资源，后续可以对照版式 | 尚不能假设其页码、排版或扫描来源与 `ZHSY100417` 完全一致 |
| P11-NLC-WUYINGDIAN-COMMONS | [Commons《農書》分类](https://commons.wikimedia.org/wiki/Category:%E8%BE%B2%E6%9B%B8)，国图 `NLC892-412000007188` 十六分册系列，含第12册 `...231991`、第13册 `...231992` | 国家图书馆来源的清代聚珍版扫描分册入口 | 未查页前不能断言某一个分册恰含桔槔图，更不能将它称为1530明代刊本 |
| P11-JAPAN-NAIKAKU-NONGSHU12 | [日本国立公文书馆「農書12」](https://www.digital.archives.go.jp/item/4770067)，请示号 `300-0080`，册次 `0012` | 可供版本对照的馆藏目录项 | 尚未确定具体刻年、卷十八对应页，不能与明嘉靖版同版处理 |

## 既有文本与版本冲突的处理

- 《庄子·天地》传世文本、《王祯农书》卷十八**文本**与现代教学模型是不同证据层；文学叙述不是测绘纪录。
- [故宫《农书》馆藏介绍](https://www.dpm.org.cn/ancient/hall/151496.html)所载武英殿聚珍版为 **1776 年**版本，提到从《永乐大典》辑出佚文（约原书五分之二），不能作为1313原版完整形制的直接替身。
- [国家博物馆《农书》](https://www.chnmuseum.cn/zp/zpml/gjwxbt/202203/t20220301_254053.shtml)记述1313年刊印史，不等于我们手头持有该元代刻本原图。
- [《三才图会》桔槔条目](https://www.shidianguji.com/zh/book/HY7188/chapter/1m6m51x69yo8k)与 [2022年转载图](https://www.waterconserving.cn/universal/detail/6165)可以提示构件类型，不能跨书互作原图替代。
- Commons 的 `ZHSY100417` 对应的是标有明嘉靖九年题名的**现代影印文件**，也不是我们已经取得了原刻本中的正确“桔槔”叶。

## 目前可以推进的最小下一动作（未执行）

1. 下载 `ZHSY100417` 对应 PDF；查看书末目录或PDF书签，定位《农器图谱》灌溉门卷，再以**人工视觉**核对“桔槔”题名与图。
2. 同版刻印证：保留图叶左/右页与版心、卷头、图题同框，并记录 `source_file_sha256`、`pdf_page_index`（从1计）、`printed_folio`（原书标叶号）、`caption`, `folio_verification_date`。无需从现代转载图片倒推页号。
3. 分别给图像中支持的实物构件打 `DOCUMENTED_IMAGE`、`INFERRED`、`ILLUSTRATIVE`、`UNKNOWN`；不以渲染效果填补历史尺寸。
4. 若确属明代嘉靖版，也只能说本图反映**明嘉靖九年刊本图示**，不能直接证明元朝原刊完全相同。

### 审计门槛

```text
P11_SCAN_DOCUMENT_IDENTIFIED=YES
P11_MING_EDITION_1530_SOURCE_IDENTIFIED=YES
P11_ORIGINAL_JIEGAO_FOLIO_PAGE=UNKNOWN
P11_FOLIO_IMAGE_VERIFIED=0
P11_HISTORICAL_GEOMETRY_EXACT=NOT_SUPPORTED
P11_ILLUSTRATIVE_MODEL_STILL_VALID_AS_PEDAGOGY=YES
```

数据文件：`artifacts/p11-edition-candidates.json`；新增目录页：`dist/source-atlas-p11.html`。版本上以 P10 的七条目录为基线，新增四条线索，历史文献目录一共十一条；不把数量增加当作四件已经校订的图像。
