async page=>{
 const results=[];const check=(ok,name)=>{if(!ok)throw Error(name);results.push(name)};
 await page.goto('http://localhost:4186');
 const original=await page.evaluate(()=>localStorage.getItem(storageKey));
 try{
 await page.evaluate(()=>localStorage.removeItem(storageKey));await page.reload();
 await page.locator('#keyEditors button').first().click();await page.keyboard.press('s');
 check(await page.locator('#keymapMessage').textContent().then(t=>t.includes('已绑定')),'duplicate rejected');check(await page.evaluate(()=>bindings[0]==='a'&&editingKey===0),'conflict preserves original');
 await page.keyboard.press('Space');check(await page.evaluate(()=>editingKey===0&&bindings[0]==='a'),'reserved key rejected');
 await page.keyboard.press('1');check(await page.evaluate(()=>bindings[0]==='1'&&held.size===0),'custom key set without sounding');
 await page.keyboard.down('1');check(await page.locator('#notes').textContent()==='C4','custom key plays note');await page.keyboard.up('1');
 await page.locator('#practiceStart').click();await page.keyboard.press('1');check(await page.evaluate(()=>scoreIndex===1),'custom key advances practice');await page.locator('#practiceStop').click();
 await page.locator('#layoutName').fill('测试数字布局');await page.locator('#layoutSave').click();
 await page.locator('#layoutDefault').click();check(await page.evaluate(()=>bindings[0]==='a'),'restore default');
 await page.locator('#layoutSelect').selectOption('测试数字布局');check(await page.evaluate(()=>bindings[0]==='1'),'switch saved layout');
 await page.reload();check(await page.evaluate(()=>bindings[0]==='1'&&activeLayout==='测试数字布局'),'reload persists layout');
 await page.locator('#up').click();check(await page.locator('#keyEditors button').first().textContent().then(t=>t.includes('C5')),'editor labels follow octave');
 await page.keyboard.down('1');check(await page.locator('#notes').textContent()==='C5','custom binding follows octave');await page.keyboard.up('1');
 await page.locator('#keyEditors button').nth(1).click();await page.keyboard.press('Escape');check(await page.evaluate(()=>editingKey===-1),'escape cancels');
 await page.evaluate(()=>{window.confirm=()=>true});await page.locator('#layoutDelete').click();check(await page.evaluate(()=>!Object.hasOwn(layouts,'测试数字布局')),'delete layout');
 await page.setViewportSize({width:390,height:844});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile no overflow');
 return {passed:true,results};
 }finally{await page.evaluate(old=>{if(old===null)localStorage.removeItem(storageKey);else localStorage.setItem(storageKey,old)},original);await page.reload();}
}
