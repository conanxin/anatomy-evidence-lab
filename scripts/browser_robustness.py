#!/usr/bin/env python3
"""P8 browser regression: synthetic grid, query-mix controls and study-arm exclusion."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'browser-artifacts';OUT.mkdir(exist_ok=True)
checks=[]
def check(value,description):
    assert value,description
    checks.append(description)

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH'),args=['--no-sandbox'])
    for width in [1366,390]:
        page=browser.new_page(viewport={'width':width,'height':940},device_scale_factor=1)
        errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
        page.set_content((ROOT/'dist/index.html').read_text(encoding='utf8'),wait_until='domcontentloaded')
        lab=page.locator('#robustness-lab')
        check(lab.is_visible(),f'{width}: P8 section visible')
        check(lab.get_attribute('data-cases')=='864',f'{width}: locked sample size')
        check(lab.get_attribute('data-tradeoffs')=='336',f'{width}: tradeoff cases')
        check(lab.get_attribute('data-spacing-mismatches')=='0',f'{width}: exact negative control')
        check(page.locator('#rob-total').inner_text()=='336/864',f'{width}: correct denominator')
        check(page.locator('#rob-percent').inner_text()=='38.89%',f'{width}: exact displayed rate')
        check(page.locator('#rob-mix-body tr').count()==4,f'{width}: four fixed lookup mixes')
        check(page.locator('#rob-order-body tr').count()==4,f'{width}: four insertion orders')
        check(page.locator('.rob-control-row').count()==3,f'{width}: three key spacing maps')
        metrics=page.locator('.rob-control-row').evaluate_all('(xs)=>xs.map(x=>x.dataset.metrics)')
        check(len(set(metrics))==1,f'{width}: rank-transform metrics identical')
        first_id=lab.get_attribute('data-current-id')
        check(first_id.startswith('P8-n42-s19-clustered-gap-bursty-miss-between'),f'{width}: default selected registered cell')
        orig_label=page.locator('#rob-current').inner_text()
        page.locator('#rob-spacing').select_option('expanding-gap')
        metrics2=page.locator('.rob-control-row').evaluate_all('(xs)=>xs.map(x=>x.dataset.metrics)')
        check(metrics2==metrics,f'{width}: changing spacing leaves metrics invariant')
        check('expanding-gap' in lab.get_attribute('data-current-id'),f'{width}: selection updates chosen case')
        page.locator('#rob-mix').select_option('hit-heavy')
        check(page.locator('#rob-mix-body tr[data-selected="true"]').count()==1,f'{width}: selected query mix shown')
        assert page.locator('#rob-order-body tr').count()==4
        # Weighted view updates from pure saved rows, doesn't mutate the trace/model.
        check(page.locator('#rob-order-body tr[data-order="ascending"] td').nth(1).inner_text().endswith('/432'),f'{width}: weighted query denominator per order')
        page.locator('#rob-order').select_option('descending')
        page.locator('#rob-size').select_option('80')
        page.locator('#rob-probe').select_option('hit-max')
        check('descending-hit-max' in lab.get_attribute('data-current-id'),f'{width}: independent factors select actual cell')
        check(lab.get_attribute('data-cases')=='864',f'{width}: filters never erase grid totals')
        page.locator('#toggle-language').click()
        check('survive' in page.locator('#rob-heading').inner_text(),f'{width}: English copy')
        check(page.locator('#rob-mix-label').inner_text().startswith('Lookup mix'),f'{width}: translated labels')
        check(not errors,f'{width}: no browser errors: {errors}')
        page.screenshot(path=str(OUT/f'p8-robustness-{width}.png'),full_page=True)
        if width==390:
            check(page.locator('.robustness-lab .sensitivity-table-wrap').first.evaluate('(el)=>el.scrollWidth>=el.clientWidth'),f'{width}: scrollable wide table')
            check(page.locator('#rob-mix').is_visible(),f'{width}: controls accessible on mobile')
        page.close()
    for arm in ['static','interactive']:
        page=browser.new_page(viewport={'width':390,'height':940})
        errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
        page.set_content((ROOT/'dist'/f'study-{arm}.html').read_text(encoding='utf8'),wait_until='domcontentloaded')
        check(not page.locator('#robustness-lab').is_visible(),f'{arm}: robustness section hidden from study exposure')
        check(page.locator('body').get_attribute('data-study-status')=='preview-only',f'{arm}: no study outcomes fabricated')
        check(not errors,f'{arm}: no errors: {errors}')
        page.close()
    browser.close()

for msg in checks:print('PASS:',msg)
print(f'P8_BROWSER_SMOKE_PASS: {len(checks)} assertions across desktop/mobile and both study modes')
