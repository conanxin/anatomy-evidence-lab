#!/usr/bin/env python3
"""Optional real-browser smoke test (requires Python Playwright and Chromium).
Run from project root: python3 scripts/browser_smoke.py
Set CHROMIUM_PATH when not at /usr/bin/chromium. Screenshots -> browser-artifacts/.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'browser-artifacts'
OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('CHROMIUM_PATH'), args=['--no-sandbox'])
    checks = []
    for width in [1366, 390]:
        page = browser.new_page(viewport={'width':width,'height':940}, device_scale_factor=1)
        errors=[]
        page.on('pageerror',lambda exc: errors.append(str(exc)))
        page.set_content((ROOT / 'dist' / 'index.html').read_text(encoding='utf-8'), wait_until='domcontentloaded')
        page.wait_for_function('document.querySelectorAll("#machine .drawer").length>1', timeout=3000)
        assert page.locator('#stats').inner_text().count('25')==1
        count=page.locator('#machine .drawer').count()
        assert count>=3, f'drawer count: {count}'
        checks.append(f'{width}px: page rendered, {count} cabinet nodes')
        assert page.locator('#trace-evidence').get_attribute('data-step-type')=='idle'
        assert page.locator('#evidence-claim').get_attribute('data-claim-id')=='C-BALANCED'
        assert page.locator('[data-evidence-id="S-NIST"] a').count()==1
        checks.append(f'{width}px: idle graph has primary source and explicit claim')
        page.locator('#machine .file-card').first.click(force=True)
        assert page.locator('#evidence-claim').get_attribute('data-claim-id')=='C-COMPARE'
        assert page.locator('#evidence-follow').is_visible()
        page.locator('#evidence-follow').click()
        assert page.locator('#trace-evidence').get_attribute('data-step-type')=='idle'
        checks.append(f'{width}px: clickable visual card resolves comparison claim, back restores trace')
        page.locator('#machine .rail').first.focus()
        page.keyboard.press('Enter')
        assert page.locator('#evidence-claim').get_attribute('data-claim-id')=='C-DESCEND'
        page.locator('#evidence-follow').click()
        checks.append(f'{width}px: keyboard-focused rail resolves child-range claim')
        page.screenshot(path=str(OUT / f'initial-{width}.png'),full_page=True)
        page.locator('#query').fill('24')
        page.locator('#search').click()
        total=int(page.locator('#stepcount').inner_text().split('/')[1].strip())
        for _ in range(total+3): page.locator('#next').click(force=True,timeout=1000)
        assert 'FOUND' in page.locator('#status').inner_text()
        assert '命中' in page.locator('#readout').inner_text()
        assert page.locator('#machine .drawer.found').count()==1
        assert page.locator('#evidence-claim').get_attribute('data-claim-id')=='C-RESULT'
        checks.append(f'{width}px: hit trace and SVG highlight linked')
        page.locator('#query').fill('25')
        page.locator('#search').click()
        total=int(page.locator('#stepcount').inner_text().split('/')[1].strip())
        for _ in range(total+3): page.locator('#next').click(force=True,timeout=1000)
        assert 'MISS' in page.locator('#status').inner_text()
        assert '未命中' in page.locator('#readout').inner_text()
        assert page.locator('#evidence-claim').get_attribute('data-claim-id')=='C-RESULT'
        checks.append(f'{width}px: miss trace')
        page.locator('#query').fill('27')
        page.locator('#insert').click()
        assert '26' in page.locator('#stats').inner_text()
        page.locator('#search').click()
        total=int(page.locator('#stepcount').inner_text().split('/')[1].strip())
        for _ in range(total+3): page.locator('#next').click(force=True,timeout=1000)
        assert 'FOUND' in page.locator('#status').inner_text()
        checks.append(f'{width}px: insert 27 then search hit')
        page.locator('#toggle-language').click()
        assert page.locator('html').get_attribute('lang')=='en'
        assert 'Found' in page.locator('#readout').inner_text()
        assert 'Hit or miss' in page.locator('#evidence-claim').inner_text()
        checks.append(f'{width}px: English locale change and claim projection')
        page.locator('#reset').click()
        assert '25' in page.locator('#stats').inner_text()
        assert page.locator('#machine .drawer.found').count()==0
        checks.append(f'{width}px: reset')
        assert page.locator('#degree').input_value()=='2'
        assert page.locator('#case-2').get_attribute('aria-pressed')=='true'
        v2=page.locator('#case-2').get_attribute('data-scenario-id')
        v3=page.locator('#case-3').get_attribute('data-scenario-id')
        assert v2.startswith('BT-2-') and v3.startswith('BT-3-') and v2!=v3
        assert 'I/O' in page.locator('#comparison-boundary').inner_text()
        checks.append(f'{width}px: comparison begins from identical 25-key dataset with explicit measurement boundary')
        nodes2=page.locator('#machine .drawer').count()
        page.locator('#case-3').click()
        assert page.locator('#degree').input_value()=='3'
        assert page.locator('#case-3').get_attribute('aria-pressed')=='true'
        assert page.locator('#case-2').get_attribute('aria-pressed')=='false'
        assert page.locator('#case-2').get_attribute('data-found')==page.locator('#case-3').get_attribute('data-found')
        assert 'MINIMUM DEGREE t = 3' in page.locator('#drawing-note').inner_text()
        nodes3=page.locator('#machine .drawer').count()
        assert nodes2!=nodes3, f'degree change should rebuild geometry ({nodes2} versus {nodes3})'
        checks.append(f'{width}px: switching to t=3 rebuilds real model and geometry ({nodes2} to {nodes3} nodes)')
        page.locator('#scenario-evidence').click()
        assert page.locator('#evidence-claim').get_attribute('data-claim-id')=='C-SCENARIO'
        for item in ['A-SAME-DATA','A-NOT-IO','T-COMPARISON']:
            assert page.locator(f'[data-evidence-id="{item}"]').count()==1
        page.locator('#evidence-follow').click()
        checks.append(f'{width}px: comparison assumption links to claim, model, tests and caution')
        page.locator('#query').fill('25')
        page.locator('#search').click()
        assert page.locator('#case-2').get_attribute('data-found')=='false'
        assert page.locator('#case-3').get_attribute('data-found')=='false'
        checks.append(f'{width}px: both degrees agree on absent key')
        page.locator('#insert').click()
        assert page.locator('#case-2').get_attribute('data-found')=='true'
        assert page.locator('#case-3').get_attribute('data-found')=='true'
        assert '26' in page.locator('#stats').inner_text()
        checks.append(f'{width}px: inserting a key updates both comparison datasets')
        page.locator('#degree').select_option('2')
        assert page.locator('#case-2').get_attribute('aria-pressed')=='true'
        assert page.locator('#degree').input_value()=='2'
        page.locator('#toggle-language').click()
        assert '不是磁盘 I/O' in page.locator('#comparison-result').inner_text()
        checks.append(f'{width}px: degree selector and Chinese comparison readout work')
        page.locator('#reset').click()
        assert page.locator('#degree').input_value()=='2'
        assert page.locator('#case-2').get_attribute('data-found')=='true'
        assert '25' in page.locator('#stats').inner_text()
        checks.append(f'{width}px: reset restores t=2, original dataset and original query')
        # P6: change only hypothetical cost weights, never source tree or trace.
        assert page.locator('#cost-lab').get_attribute('data-tradeoff')=='false'
        initial_t2=page.locator('#case-2').get_attribute('data-scenario-id')
        initial_t3=page.locator('#case-3').get_attribute('data-scenario-id')
        page.locator('#regime-keys').click()
        assert page.locator('#cost-lab').get_attribute('data-winner')=='t2'
        assert page.locator('#case-2').get_attribute('data-scenario-id')==initial_t2
        assert page.locator('#case-3').get_attribute('data-scenario-id')==initial_t3
        checks.append(f'{width}px: cost-only regime does not mutate baseline tree and t=2 retains dominance')
        page.locator('#dataset-tradeoff').click()
        assert '42' in page.locator('#stats').inner_text()
        assert page.locator('#query').input_value()=='7'
        assert page.locator('#cost-lab').get_attribute('data-tradeoff')=='true'
        assert page.locator('#cost-case-2').get_attribute('data-visits')=='4'
        assert page.locator('#cost-case-3').get_attribute('data-visits')=='3'
        assert page.locator('#cost-case-2').get_attribute('data-comparisons')=='5'
        assert page.locator('#cost-case-3').get_attribute('data-comparisons')=='6'
        checks.append(f'{width}px: counterexample reproduces 4/5 vs 3/6 and same absent query')
        page.locator('#regime-nodes').click()
        assert page.locator('#cost-lab').get_attribute('data-winner')=='t3'
        assert [page.locator(f'#cost-case-{i}').get_attribute('data-score') for i in [2,3]]==['25','21']
        c2=page.locator('#case-2').get_attribute('data-scenario-id')
        c3=page.locator('#case-3').get_attribute('data-scenario-id')
        page.locator('#regime-keys').click()
        assert page.locator('#cost-lab').get_attribute('data-winner')=='t2'
        assert [page.locator(f'#cost-case-{i}').get_attribute('data-score') for i in [2,3]]==['29','33']
        assert page.locator('#case-2').get_attribute('data-scenario-id')==c2
        assert page.locator('#case-3').get_attribute('data-scenario-id')==c3
        checks.append(f'{width}px: hypothetical weight flip reverses ranking without changing scenario IDs')
        page.locator('#regime-balanced').click()
        assert page.locator('#cost-lab').get_attribute('data-winner')=='tie'
        assert [page.locator(f'#cost-case-{i}').get_attribute('data-score') for i in [2,3]]==['9','9']
        checks.append(f'{width}px: equal weights create a genuine tie')
        page.locator('#weight-node').evaluate('(el)=>{el.value="7";el.dispatchEvent(new Event("input",{bubbles:true}));}')
        assert page.locator('#cost-lab').get_attribute('data-winner')=='t3'
        assert page.locator('#weight-node-value').inner_text()=='7'
        checks.append(f'{width}px: range slider is live and recomputes fictional scores')
        page.locator('#cost-evidence').click()
        assert page.locator('#evidence-claim').get_attribute('data-claim-id')=='C-COST'
        for e in ['A-WEIGHTS','A-NOT-IO','M-COST','T-COST']:
            assert page.locator(f'[data-evidence-id="{e}"]').count()==1
        page.locator('#evidence-follow').click()
        checks.append(f'{width}px: cost-model claim explicitly links to assumptions and tests')
        for i,v in enumerate(['t2','t3','t2','no','no']): page.locator(f'#study-q-{i}').select_option(v)
        page.locator('#study-submit').click()
        assert page.locator('#study-score').get_attribute('data-correct')=='5'
        checks.append(f'{width}px: same five comprehension items grade correctly with no participant collection')
        page.screenshot(path=str(OUT / f'p6-tradeoff-{width}.png'),full_page=True)
        page.locator('#toggle-language').click()
        assert 'Teaching points' in page.locator('#cost-verdict').inner_text()
        assert page.locator('#study-q-0 option').count()==4
        checks.append(f'{width}px: bilingual P6 cost conclusion and quiz')
        page.locator('#reset').click()
        assert page.locator('#dataset-baseline').get_attribute('aria-pressed')=='true'
        assert page.locator('#cost-lab').get_attribute('data-tradeoff')=='false'
        checks.append(f'{width}px: restoring default dataset, weights and active model')
        page.screenshot(path=str(OUT / f'p5-comparison-{width}.png'),full_page=True)
        assert not errors, f'JS runtime errors: {errors}'
        checks.append(f'{width}px: zero page errors')
        page.emulate_media(reduced_motion='reduce')
        motion=page.evaluate("getComputedStyle(document.documentElement).scrollBehavior")
        assert motion=='auto', f'reduced motion: expected auto scroll, got {motion}'
        checks.append(f'{width}px: reduced-motion CSS turns smooth scrolling off')
        page.emulate_media(reduced_motion='no-preference')
        if width==390:
            assert page.locator('.canvas-scroller').evaluate('(el)=>el.scrollWidth>el.clientWidth'), 'Expected an accessible horizontally-scrollable large diagram'
            assert page.locator('.canvas-scroller').evaluate('(el)=>el.scrollLeft>0'), 'Root should be initially centered within scrollable viewport'
            checks.append('390px: diagram stays accessible via horizontal scrolling')
            page.screenshot(path=str(OUT / 'mobile-390.png'),full_page=True)
        else:
            page.screenshot(path=str(OUT / 'desktop-1366.png'),full_page=True)
        page.close()
    browser.close()
for c in checks: print('PASS:',c)
print(f'BROWSER_SMOKE_PASS: {len(checks)} checks; artifacts in {OUT}')
