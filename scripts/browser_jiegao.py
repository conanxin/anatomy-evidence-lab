#!/usr/bin/env python3
"""P9 browser smoke: source-linked historical mechanism, desktop/mobile."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'browser-artifacts';OUT.mkdir(exist_ok=True)
checks=[]
def check(cond, label):
    assert cond,label
    checks.append(label)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH'),args=['--no-sandbox'])
    for width in [1366,390]:
        page=browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
        errs=[];page.on('pageerror', lambda e:errs.append(str(e)))
        page.set_content((ROOT/'dist/jiegao.html').read_text(encoding='utf8'),wait_until='domcontentloaded')
        check(page.locator('h1').is_visible(),f'{width} historical heading visible')
        check(page.locator('#jg-diagram').count()==1,f'{width} SVG rendered')
        check(page.locator('[data-part]').count()==6,f'{width} six evidence-linked parts')
        check('ILLUSTRATIVE' in page.locator('.jg-controls').inner_text(),f'{width} numeric assumption label')
        check('N·m' in page.locator('#jg-tau-net').inner_text(),f'{width} simulated moment shown')
        before=page.locator('#jg-tau-net').inner_text()
        page.locator('#jg-counter').fill('2')
        check(page.locator('#jg-tau-net').inner_text()!=before,f'{width} slider updates ideal torque')
        check('前端载荷倾向下落' in page.locator('#jg-tendency').inner_text(),f'{width} load tendency changes')
        page.locator('#jg-release').click()
        check('示意' in page.locator('#jg-motion-msg').inner_text(),f'{width} manual animation marked hypothetical')
        page.locator('[data-part="counterweight"]').click()
        check('后端配重' in page.locator('#jg-evidence-card').inner_text(),f'{width} part click reveals contextual evidence')
        page.locator('#jg-reset').click()
        check('配重倾向提起' in page.locator('#jg-tendency').inner_text(),f'{width} reset restores state')
        page.locator('[data-part="beam"]').focus()
        page.keyboard.press('Enter')
        check('俯仰横杆' in page.locator('#jg-evidence-card').inner_text(),f'{width} keyboard evidence inspection')
        check(page.locator('#jg-evidence-card a[href*="1142890"]').count()==1,f'{width} versioned source link')
        check('不是' in page.locator('header').inner_text(),f'{width} clear non-reconstruction disclaimer')
        check(not errs,f'{width} no JavaScript error {errs}')
        if width==390:
            check(page.locator('body').evaluate('(el)=>el.scrollWidth<=window.innerWidth+2'),f'{width} no horizontal page overflow')
        page.screenshot(path=str(OUT/f'p9-jiegao-{width}.png'),full_page=True)
        page.close()
    browser.close()
print(f'P9_BROWSER_PASS {len(checks)}')
