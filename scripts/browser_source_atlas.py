#!/usr/bin/env python3
from pathlib import Path
import os
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];out=root/'browser-artifacts';out.mkdir(exist_ok=True)
count=0
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or None,args=['--no-sandbox'])
 for width in (1366,390):
  page=browser.new_page(viewport={'width':width,'height':900})
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content((root/'dist/source-atlas.html').read_text(encoding='utf8'),wait_until='domcontentloaded')
  for valid in [
   page.locator('h1').is_visible(),
   page.locator('article.source').count()==7,
   page.get_by_text('SECONDARY_ATTRIBUTION_ONLY').is_visible(),
   page.get_by_text('CATALOG_ONLY_NOT_DIGITIZED').is_visible(),
   '零张可确认原刊叶面' in page.locator('h1').inner_text(),
   page.locator('article.source a[target="_blank"][rel="noopener noreferrer"]').count()==7,
   page.locator('article.source').filter(has_text='1776').count()==1,
   len(errors)==0
  ]:
   assert valid,(width,count,errors)
   count+=1
  if width==390:
   assert page.locator('body').evaluate('(e)=>e.scrollWidth<=innerWidth+2')
   count+=1
  page.screenshot(path=str(out/f'p10-atlas-{width}.png'),full_page=True)
  page.close()
 browser.close()
print('P10_BROWSER_PASS',count)
