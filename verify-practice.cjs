async page=>{
 const results=[];const check=(ok,name)=>{if(!ok)throw Error(name);results.push(name)};
 await page.goto('http://localhost:4186');
 await page.locator('#practiceStart').click();
 check(await page.locator('[data-offset="0"]').evaluate(e=>e.classList.contains('next-note')),'first note highlighted');
 await page.keyboard.press('s');check(await page.evaluate(()=>scoreIndex===0),'wrong note does not advance');
 await page.keyboard.press('a');check(await page.evaluate(()=>scoreIndex===1),'correct note advances');
 await page.keyboard.press('a');check(await page.locator('[data-offset="7"]').evaluate(e=>e.classList.contains('next-note')),'repeated notes advance to G');
 await page.locator('#scoreText').fill('F#5 C4');await page.locator('#practiceStart').click();
 check(await page.locator('#practiceJump').isVisible(),'cross octave prompts');
 await page.locator('#practiceJump').click();check(await page.locator('[data-offset="6"]').evaluate(e=>e.classList.contains('next-note')),'F#5 highlighted after octave switch');
 await page.keyboard.press('t');check(await page.evaluate(()=>scoreIndex===1),'F#5 accepted');
 await page.locator('#practiceJump').click();await page.keyboard.press('a');check(await page.locator('#practiceMessage').textContent().then(s=>s.includes('已弹完')),'completion');
 await page.locator('#scoreFile').setInputFiles({name:'test.txt',mimeType:'text/plain',buffer:Buffer.from("1, 1 1' #4 0 -")});
 await page.waitForFunction(()=>$('scoreText').value.includes("1,"));await page.locator('#practiceStart').click();
 check(await page.evaluate(()=>JSON.stringify(score)==='[48,60,72,66]'),'TXT import, lower/higher octave, accidental, rest');
 await page.locator('#scoreText').fill('<script>alert(1)</script>');await page.locator('#practiceStart').click();
 check(await page.locator('#practiceMessage').textContent().then(s=>s.includes('无法识别')),'invalid score rejected safely');
 await page.locator('#practiceStop').click();check(await page.locator('.next-note').count()===0,'exit clears highlights');
 await page.setViewportSize({width:390,height:844});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile no page overflow');
 return {passed:true,results};
}
