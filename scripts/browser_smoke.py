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
