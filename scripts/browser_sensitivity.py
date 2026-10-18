#!/usr/bin/env python3
"""P7 headless Chromium smoke; use CHROMIUM_PATH=/usr/bin/chromium locally."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'browser-artifacts'
OUT.mkdir(exist_ok=True)
CHECKS=[]

def check(ok,label):
    assert ok,label
    CHECKS.append(label)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH'),args=['--no-sandbox'])
    for width in (1366,390):
        page=browser.new_page(viewport={'width':width,'height':940},device_scale_factor=1)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content((ROOT/'dist/index.html').read_text(encoding='utf-8'),wait_until='domcontentloaded')
        lab=page.locator('#sensitivity-lab')
        check(lab.get_attribute('data-grid-total')=='288',f'{width}: 288 locked scenarios')
        check(lab.get_attribute('data-tradeoffs')=='111',f'{width}: tradeoff count is 111')
        check(page.locator('#sens-fraction').inner_text()=='111/288',f'{width}: count and denominator shown')
        check(page.locator('#sens-rate').inner_text()=='38.54%',f'{width}: finite-grid proportion shown')
        check([el.inner_text() for el in page.locator('.sensitivity-category strong').all()]==['13','152','111','12'],f'{width}: four exhaustive categories')
        check(page.locator('#sensitivity-size-body tr').count()==4,f'{width}: four key sizes')
        check(page.locator('#sens-current').inner_text().startswith('P7-n42-s7-ascending-hit-median'),f'{width}: default tradeoff case')
        check(lab.get_attribute('data-current-class')=='tradeoff',f'{width}: strict opposite-sign tradeoff')
        grid=page.locator('#sens-heatmap tbody td')
        check(grid.count()==16,f'{width}: 16 hypothesis-score heatmap cells')
        check(page.locator('#sens-heatmap td[data-node-weight="1"][data-comparison-weight="10"]').get_attribute('data-preference')=='t2',f'{width}: key-heavy weights favor t2')
        check(page.locator('#sens-heatmap td[data-node-weight="10"][data-comparison-weight="1"]').get_attribute('data-preference')=='t3',f'{width}: visit-heavy weights favor t3')
        check(page.locator('#sens-heatmap td[data-node-weight="2"][data-comparison-weight="1"]').get_attribute('data-preference')=='tie',f'{width}: equality is explicitly shown')
        baseline=page.locator('#case-2').get_attribute('data-scenario-id')
        page.locator('#sens-size').select_option('12')
        page.locator('#sens-probe').select_option('miss-between')
        check(lab.get_attribute('data-current-id')=='P7-n12-s7-ascending-miss-between',f'{width}: selection updates query case')
        check('MISS' in page.locator('#sens-current').inner_text(),f'{width}: corresponding miss label')
        check(page.locator('#case-2').get_attribute('data-scenario-id')==baseline,f'{width}: P7 selectors never modify live teaching tree')
        page.locator('#sens-order').select_option('shuffled')
        page.locator('#sens-seed').select_option('37')
        check(lab.get_attribute('data-current-id')=='P7-n12-s37-shuffled-miss-between',f'{width}: seed and insertion order select real case')
        page.locator('#toggle-language').click()
        check(page.locator('#sensitivity-heading').inner_text().startswith('No cherry-picked'),f'{width}: English sensitivity copy')
        check(page.locator('#sens-heatmap').get_attribute('aria-label') is None and grid.count()==16,f'{width}: table remains accessible after language change')
        check(not errors,f'{width}: no JavaScript errors {errors}')
        page.screenshot(path=str(OUT/f'p7-sensitivity-{width}.png'),full_page=True)
        if width==390:
            check(page.locator('.sensitivity-table-wrap').first.evaluate('(el)=>el.scrollWidth>=el.clientWidth'),f'{width}: mobile wide table scroll container')
        page.close()
    saved_banks=[]
    for arm in ('static','interactive'):
        page=browser.new_page(viewport={'width':390,'height':940},device_scale_factor=1)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content((ROOT/'dist'/f'study-{arm}.html').read_text(encoding='utf-8'),wait_until='domcontentloaded')
        check(page.locator('body').get_attribute('data-study-condition')==arm,f'{arm}: distinct registered preview document')
        check(page.locator('body').get_attribute('data-study-status')=='preview-only',f'{arm}: not misrepresented as a real trial')
        check(page.locator('#study-questions select').count()==5,f'{arm}: unchanged five comprehension items')
        ids=page.locator('#study-questions select').evaluate_all('(xs)=>xs.map(x=>x.name)')
        saved_banks.append(ids)
        check(page.locator('.workspace').is_visible()==(arm=='interactive'),f'{arm}: only interactive condition sees model')
        check(page.locator('#study-static-sheet').is_visible()==(arm=='static'),f'{arm}: only static condition sees text sheet')
        check(not page.locator('#sensitivity-lab').is_visible(),f'{arm}: P7 data excluded from exposure material')
        check('5' in page.locator('#study-protocol-note').inner_text(),f'{arm}: matching exposure instructions')
        check(not errors,f'{arm}: zero JavaScript errors {errors}')
        page.screenshot(path=str(OUT/f'p7-study-{arm}-390.png'),full_page=True)
        page.close()
    check(saved_banks[0]==saved_banks[1], 'both study arms use identical question IDs and sequence')
    browser.close()
for item in CHECKS:print('PASS:',item)
print(f'P7_BROWSER_SMOKE_PASS: {len(CHECKS)} assertions across desktop/mobile and unlaunched study-arm previews')
