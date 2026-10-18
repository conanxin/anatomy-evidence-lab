#!/usr/bin/env python3
"""P11 edition audit browser smoke — validates honest provenance labeling."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'browser-artifacts';OUT.mkdir(exist_ok=True)
checks=[]
def check(cond,name):
    assert cond,name
    checks.append(name)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    for width in (1366,390):
        page=browser.new_page(viewport={'width':width,'height':900})
        errors=[]
        page.on('pageerror',lambda exc:errors.append(str(exc)))
        page.set_content((ROOT/'dist/source-atlas-p11.html').read_text('utf8'),wait_until='domcontentloaded')
        check(page.locator('article.source').count()==11,f'{width} eleven cards')
        check('零张核验到叶' in page.locator('h1').inner_text(),f'{width} folio gap marked')
        check(page.get_by_text('EDITION_PDF_IDENTIFIED_FOLIO_PENDING').count()==1,f'{width} Ming digital edition labelled')
        check(page.get_by_text('MULTI_VOLUME_SCANS_IDENTIFIED_FOLIO_PENDING').count()==1,f'{width} Qing multipart volume labelled')
        check(page.locator('article.source').filter(has_text='ZHSY100417').count()==1,f'{width} unique Ming scan')
        check(page.locator('article.source a[target="_blank"][rel="noopener noreferrer"]').count()==11,f'{width} linked locators')
        check(page.locator('body').evaluate('(node)=>node.scrollWidth <= innerWidth + 2'),f'{width} width fits')
        check(not errors,f'{width} page errors')
        page.screenshot(path=str(OUT/f'p11-editions-{width}.png'),full_page=True)
        page.close()
    browser.close()
print(f'P11_BROWSER_PASS {len(checks)}')
