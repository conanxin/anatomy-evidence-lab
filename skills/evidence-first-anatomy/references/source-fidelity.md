# Source fidelity + statics tests | Evidence-first Anatomy (P12)

## Text fidelity gate

- Never present **reconstructed memory text** as a verified direct quotation. For a quote, open a **specific stable edition text**, verify exact characters and locator, label variants/unresolved passages. Otherwise paraphrase explicitly and mark `QUOTE_NOT_VERIFIED`.
- Quote small evidence-bearing fragments only. For the jiégāo example, check [Zhuangzi Tian Di](https://ctext.org/text.pl?if=en&node=2795&remap=gb&show=parallel) and [Wang Zhen Nongshu juan 18](https://zh.wikisource.org/w/index.php?title=王禎農書/卷十八&oldid=1142890). *Nongshu* quotes *Zhuangzi*, so quotation alone is not an independent instrument measurement.
- Separate `DOCUMENTED` (recorded as text), `INFERRED` (mechanical interpretation), `ILLUSTRATIVE` (shape/dimensions chosen to explain), and `UNKNOWN` (original dimensions, flow, efficiency, construction dates). A visual SVG model is not source validation.

## Valid model tests for a modern, idealized lever

For counterweight mass `m_c`, counterweight arm `L_c`, front load mass `m_l`, front arm `L_l`, and beam inclination `theta` relative to horizontal in a simplified vertical gravity model:

`tau = 9.81 * cos(theta) * (m_c * L_c - m_l * L_l)`.

1. If `m_c * L_c == m_l * L_l` and `|theta|<90°`, the idealized net gravity moment is zero. If the program displays a nonzero net moment, its *implementation* is wrong; real bearing friction etc. are out of model.
2. If other terms are held constant and `m_c * L_c > m_l * L_l`, idealized net moment should favor raising the front load; reversing the strict inequality reverses its sign.
3. If `m_c == 0` and `m_l > 0` with nonzero front arm and modest inclination, the front falls under the model.
4. Holding beam arm length **does not determine lifted water volume**. Lifted volume requires available stroke geometry, available load, bucket capacity, fill/drain timing, friction/losses and human effort. Do **not** claim `3:1 arm ratio ⇒ 3× water volume or efficiency`.

These are falsifiable **source-code/model consistency** checks only, not a field experiment on an ancient object.

## Agent transcript scoring

`SOURCE_LOCATORS` (specific edition link+place); `EXACT_QUOTE_VERIFIED` (yes/no or no verbatim attempted); `UNKNOWN_DIMENSIONS` (must explicit); `FOUR_EVIDENCE_STATES` (clear and mapped); `TEST_1_VALID` and `TEST_2_VALID` (mechanically falsifiable without imaginary performance claims). Agent CLI completion is not this gate.
