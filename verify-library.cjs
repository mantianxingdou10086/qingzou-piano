async page=>{
 const checks=[];const check=(ok,msg)=>{if(!ok)throw Error(msg);checks.push(msg)};
 await page.goto('http://localhost:4186');await page.evaluate(()=>recordingsReady);
 const before=await page.locator('.recording-take').count();
 await page.locator('#recordStart').click();await page.waitForFunction(()=>recorder?.state==='recording');await page.keyboard.down('a');await page.waitForTimeout(500);await page.keyboard.up('a');await page.locator('#recordStop').click();await page.waitForFunction(n=>$('recordings').children.length>n&&unsavedTakes.size===0,before);
 const id=await page.evaluate(async()=>{const all=await takeStore('getAll');return all.sort((a,b)=>b.created-a.created)[0].id});
 check(await page.evaluate(async()=>{const all=await takeStore('getAll');return all.at(-1).blob.size>0}),'recording saved to IndexedDB');
 await page.getByRole('tab',{name:/我的录音/}).click();await page.evaluate(()=>window.prompt=()=> '测试旋律');await page.locator('.recording-take').first().getByRole('button',{name:'重命名'}).click();
 await page.waitForFunction(async id=>(await takeStore('getAll')).find(t=>t.id===id).name==='测试旋律',id);
 await page.reload();await page.evaluate(()=>recordingsReady);await page.getByRole('tab',{name:/我的录音/}).click();
 check(await page.locator('.recording-take').first().textContent().then(t=>t.includes('测试旋律')),'rename and audio survive reload');
 const audio=await page.locator('.recording-take audio').first().evaluate(async el=>{const data=await fetch(el.src).then(r=>r.arrayBuffer());const c=new AudioContext();const b=await c.decodeAudioData(data);await c.close();return b.duration});check(audio>0,'restored recording decodes');
 await page.getByRole('tab',{name:'跟弹练习'}).click();await page.locator('#scoreName').fill('测试收藏');await page.locator('#scoreSave').click();await page.reload();await page.evaluate(()=>recordingsReady);await page.getByRole('tab',{name:'跟弹练习'}).click();await page.locator('#savedScore').selectOption('测试收藏');await page.locator('#scoreLoad').click();
 check(await page.locator('#scoreText').inputValue().then(t=>t.startsWith('1 1')),'score survives reload');check(await page.evaluate(()=>!practicing&&scoreIndex===0),'no practice resumption');
 await page.getByRole('tab',{name:'键位设置'}).click();const pending=page.waitForEvent('download');await page.locator('#backupExport').click();const download=await pending;await download.saveAs('output/playwright/library-backup.json');
 const payload=await page.evaluate(()=>({format:'qingzou-backup',version:1,scores:savedScores,keymaps:{layouts:{'恢复测试':[...bindings]},active:'恢复测试',current:[...bindings]}}));
 await page.evaluate(()=>window.confirm=()=>true);await page.locator('#backupFile').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});await page.waitForFunction(()=>$('backupMessage').textContent.includes('已恢复'));
 check(await page.evaluate(()=>activeLayout==='恢复测试'),'backup imports layouts');
 await page.locator('#backupFile').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{}')});await page.waitForFunction(()=>$('backupMessage').textContent.includes('恢复失败'));check(await page.evaluate(()=>activeLayout==='恢复测试'),'invalid backup rejected without mutation');
 await page.evaluate(async id=>{await takeStore('delete',id);delete savedScores['测试收藏'];localStorage.setItem(scoresKey,JSON.stringify(savedScores));delete layouts['恢复测试'];activeLayout='';persistKeymap();},id);
 await page.reload();await page.evaluate(()=>recordingsReady);check(await page.locator('.recording-take').count()===before,'recording deletion persists');
 return {passed:true,checks,restoredAudioDuration:audio};
}
