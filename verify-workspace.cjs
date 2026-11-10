async page=>{
 const results=[];const check=(ok,name)=>{if(!ok)throw Error(name);results.push(name)};
 await page.goto('http://localhost:4186');await page.setViewportSize({width:1280,height:900});
 check(await page.locator('[role=tab]').count()===4,'four tabs');
 check(await page.locator('[role=tabpanel]:visible').count()===1,'only one panel visible');
 await page.getByRole('tab',{name:'跟弹练习'}).click();await page.locator('#practiceStart').click();
 check(await page.locator('.practice-strip').isVisible(),'practice prompt by keys');
 await page.keyboard.press('a');check(await page.evaluate(()=>scoreIndex===1),'practice works');
 await page.getByRole('tab',{name:'键位设置'}).click();check(await page.locator('.practice-strip').isVisible(),'active practice prompt stays across tabs');
 check(await page.locator('#keyEditors').isVisible(),'key editor visible');
 await page.locator('#keyEditors button').first().click();await page.keyboard.press('Escape');
 await page.getByRole('tab',{name:'自由弹奏'}).click();
 await page.locator('#recordStart').click();await page.waitForFunction(()=>recorder?.state==='recording');await page.keyboard.down('g');await page.waitForTimeout(500);await page.keyboard.up('g');await page.locator('#recordStop').click();await page.waitForFunction(()=>$('recordings').children.length===1);
 check(await page.getByRole('tab',{name:'我的录音（1）'}).isVisible(),'recording count');
 await page.getByRole('tab',{name:'我的录音（1）'}).click();check(await page.locator('.recording-take audio').isVisible(),'recordings playable panel');
 check(await page.locator('#recordStart').isVisible(),'record controls always visible');
 await page.getByRole('tab',{name:'自由弹奏'}).focus();const before=await page.locator('#octave').textContent();await page.keyboard.press('ArrowRight');check(await page.getByRole('tab',{name:'跟弹练习'}).getAttribute('aria-selected')==='true','accessible tab arrow navigation');check(await page.locator('#octave').textContent()===before,'tab navigation does not change octave');
 await page.locator('#practiceStop').click();await page.getByRole('tab',{name:'自由弹奏'}).click();
 await page.screenshot({path:'output/playwright/workspace-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile no overflow');
 check(await page.locator('.instrument').evaluate(el=>getComputedStyle(el).position==='relative'),'mobile no oversized sticky panel');
 await page.screenshot({path:'output/playwright/workspace-mobile.png',fullPage:true});
 await page.evaluate(()=>window.confirm=()=>true);await page.getByRole('tab',{name:'我的录音（1）'}).click();await page.locator('.recording-take button').click();
 return {passed:true,results};
}
