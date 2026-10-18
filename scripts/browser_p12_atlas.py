#!/usr/bin/env python3
"""P12 in-browser provenance regression. No old folio identification is asserted."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'browser-artifacts';OUT.mkdir(exist_ok=True)
checks=[]
def check(ok,name):
    assert ok,name
    checks.append(name)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    for width in (1366,390):
        page=browser.new_page(viewport={'width':width,'height':900})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content((ROOT/'dist/source-atlas-p12.html').read_text(encoding='utf-8'))
        check(page.locator('article.source').count()==14,f'{width}: 14 records')
        check('原刊桔槔确切叶面仍待核' in page.locator('h1').inner_text(),f'{width}: uncertainty retained')
        for marker in ['300-0073','01780','T 8036 1138']:
            check(page.locator('article.source').filter(has_text=marker).count()==1,f'{width}: {marker} unique')
        check(page.locator('article.source a[target="_blank"]').count()==14,f'{width}: all sources linked')
        check(page.locator('body').evaluate('(node)=>node.scrollWidth<=innerWidth+2'),f'{width}: no horizontal overrun')
        check(not errors,f'{width}: no JS error')
        page.screenshot(path=str(OUT/f'p12-edition-{width}.png'),full_page=True)
        page.close()
    browser.close()
print(f'P12_BROWSER_PASS {len(checks)}')
