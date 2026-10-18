# P9 | 桔槔: transmitted text, interpretive mechanics and uncertainty

**Research stage:** source-checked **general principle diagram**. **NOT a named historical artifact reconstruction or a measured mechanical model.** Date: 2026-10-18.

## Evidence extracted from transmitted source texts

| Claim ID | Limited proposition supported | Source / original locator | Status |
|---|---|---|---|
| JG-C01 | Rear-heavy/front-light lever-like water lifter described in a literary exchange | [《庄子·天地》](https://ctext.org/text.pl?if=en&node=2795&remap=gb&show=parallel), 子贡与汉阴丈人, "凿木为机，后重前轻，挈水若抽" | DOCUMENTED (as text) |
| JG-C02 | Up/down tipping and manual down / released up described | [《王祯农书》卷十八·桔槔, fixed Wikisource version](https://zh.wikisource.org/w/index.php?title=王禎農書/卷十八&oldid=1142890), "引之则俯，舍之则仰" | DOCUMENTED (as transmitted text) |
| JG-C03 | Distinction from windlass spindle/rotational lift | [《王祯农书》卷十八·辘轳](https://zh.wikisource.org/w/index.php?title=王禎農書/卷十八&oldid=1142890), "取其俯仰则桔槔，取其圆转则辘轳" | DOCUMENTED (as text) |
| JG-C04 | A counterweight and front hanging load form a torque balance about a pivot | Modern **idealized interpretation** of C01/C02, not ancient numerical measurements | INFERRED |
| JG-C05 | Masses, geometry, cord lengths, colors, motion speed and torque examples | No dimensions located in cited text; model authored for teaching | ILLUSTRATIVE |
| JG-C06 | Dimensions/flow/efficiency and original device identification | Not established in retrieved texts | UNKNOWN |

**Important dependence:** The Yuan-period *Nong Shu* recounts and quotes older writings, including the Zhuangzi incident. Do not treat its quotation as a second independent measurement. Wikisource here is a *transcribed/edited text*, not an original Yuan imprint scanned and independently collated. The wording and reading are documented at the fixed version URL; manuscript variant analysis is a separate task.

## Ideal mechanical model (P9 only)

- One beam rotates about a **schematic** pivot. Counterweight hangs to the left; vessel to the right. No physical dimensions in these sources warrant exact placement or historical material texture.
- User may vary 0–30 kg hypothetical load/counterweight, 0.5–2.5 m hypothetical arms, ±28° schematic inclination. These are **UI ranges**, not historically measured ranges.
- Modern ideal gravitational moment formula for inclined beam: `tau_net = g * cos(theta) * (m_counter*L_counter - m_load*L_load)` (g=9.81 m/s², illustrative). Positive sign means the counterweight tends to raise the front load; negative, the front tends to fall.
- Automatic 'release' button **chooses a demonstration angle based on torque sign**; it does NOT numerically integrate angular acceleration, tension, friction, filling/draining or temporal motion. Surface the simplification to readers.
- The example does not measure labor efficiency or verify literary claims such as irrigating 100 plots/day.

## Visual component evidence mapping

| Part ID | Interpretation | Source-level confidence |
|---|---|---|
| support | Upright post / pivot from references to the fixed/turning parts | INFERRED |
| beam | Tipping rod, stylized not measured | INFERRED |
| counterweight | Rear-heavy component rendered as a weight | INFERRED |
| cord | Hanging rope for bucket, shape invented | ILLUSTRATIVE |
| vessel | Water receptacle from lifting-water story; shape invented | INFERRED |
| waterline | Schematic well water level | ILLUSTRATIVE |

## Independent verification & falsifiers

- `tests/jiegao.test.mjs`: static moment signs, inclination correction, typed source IDs, intact documented claims after parameter manipulation, part maps and invalid-input rejection.
- `scripts/browser_jiegao.py`: Chromium 1366px/390px screenshots, keyboard focus, click-through evidence, state changes, source link, CSS overflow and JS error checks. These tests prove model/UI consistency, **not historically accurate construction**.
- Future physical verification would require a dated original woodcut at known repository/page, measurements or an extant apparatus, structural comparison and uncertainty assessment. A conflicting physical lever length or contrary rigging would falsify **this rendering** while leaving cited text unchanged.

## Sources and verification scope

1. CTP text of *Zhuangzi*, [天地](https://ctext.org/text.pl?if=en&node=2795&remap=gb&show=parallel).
2. *Wang Zhen Nong Shu*, [卷十八 灌溉门 桔槔 / 辘轳](https://zh.wikisource.org/w/index.php?title=王禎農書/卷十八&oldid=1142890). Textual transcription; not collated against original image.
3. General modern lever torque relationship, a **model assumption**, not a historical datum. The existing project evidence protocol remains in [`skills/evidence-first-anatomy/references/protocol.md`](../skills/evidence-first-anatomy/references/protocol.md).
