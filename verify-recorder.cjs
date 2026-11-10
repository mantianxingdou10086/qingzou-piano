async page=>{
 const check=(ok,msg)=>{if(!ok)throw Error(msg)};
 await page.goto('http://localhost:4186');
 await page.locator('#tone').selectOption('sample');await page.waitForFunction(()=>sampleBuffers.length===30);
 await page.locator('#recordStart').click();await page.waitForFunction(()=>recorder?.state==='recording');
 await page.keyboard.down('a');await page.keyboard.down('d');await page.keyboard.down('g');await page.waitForTimeout(900);
 for(const k of ['a','d','g'])await page.keyboard.up(k);
 await page.locator('#recordStop').click();await page.waitForSelector('.recording-take audio');
 const result=await page.evaluate(async()=>{
  const link=document.querySelector('.recording-take a');const bytes=await fetch(link.href).then(r=>r.arrayBuffer());
  const ac=new AudioContext();const decoded=await ac.decodeAudioData(bytes.slice(0));let peak=0;for(const x of decoded.getChannelData(0))peak=Math.max(peak,Math.abs(x));await ac.close();
  return {bytes:bytes.byteLength,duration:decoded.duration,peak,filename:link.download,mime:recorder.mimeType};
 });
 check(result.bytes>1000&&result.duration>.5&&result.peak>.001,'recorded file must decode to actual audio');
 await page.locator('.recording-take audio').evaluate(async el=>{await el.play()});
 check(await page.locator('.recording-take audio').evaluate(el=>!el.paused),'playback works');
 await page.locator('#recordStart').click();await page.waitForFunction(()=>recorder.state==='recording');
 await page.keyboard.down('s');await page.waitForTimeout(500);await page.keyboard.up('s');await page.locator('#recordStop').click();
 await page.waitForFunction(()=>document.querySelectorAll('.recording-take').length===2);
 check(await page.locator('.recording-take').count()===2,'second take preserves first');
 const downloadPromise=page.waitForEvent('download');await page.locator('.recording-take a').last().click();const download=await downloadPromise;
 await download.saveAs('output/playwright/recording-test.webm');
 await page.evaluate(()=>window.confirm=()=>true);await page.locator('.recording-take button').first().click();
 check(await page.locator('.recording-take').count()===1,'delete removes chosen take only');
 await page.locator('.recording-take button').first().click();
 check(await page.evaluate(()=>takeUrls.size===0),'delete releases recording URLs');
 await page.setViewportSize({width:390,height:844});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile no overflow');
 return {passed:true,...result,download:download.suggestedFilename(),takesTested:2};
}
