async page => {
 const check=(ok,msg)=>{if(!ok)throw Error(msg)};
 for(const k of ['a','d','g','t'])await page.keyboard.up(k);
 await page.goto('http://localhost:4186');
 await page.locator('#tone').selectOption('sample');
 await page.waitForFunction(()=>sampleBuffers.length===30);
 await page.keyboard.down('a');await page.keyboard.down('d');await page.keyboard.down('g');
 await page.waitForTimeout(600);
 const signal=await page.evaluate(()=>{const d=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(d);return {voices:voices.size,sampled:[...voices.values()].every(v=>v.oscillators[0] instanceof AudioBufferSourceNode),peak:Math.max(...d.map(Math.abs))}});
 check(signal.voices===3&&signal.sampled&&signal.peak>.001,'sample chord/audio failed '+JSON.stringify(signal));
 for(const k of ['a','d','g'])await page.keyboard.up(k);
 await page.waitForTimeout(400);check(await page.evaluate(()=>voices.size===0),'release failed');
 await page.locator('#up').click();await page.keyboard.down('t');
 check(await page.evaluate(()=>$('notes').textContent==='F♯5'&&[...voices.values()][0].oscillators[0].playbackRate.value===1),'F#5 failed');
 await page.keyboard.up('t');
 await page.locator('#sustain').click();await page.keyboard.press('s');
 check(await page.evaluate(()=>voices.size>0),'sustain failed');
 await page.locator('#sustain').click();await page.waitForTimeout(400);
 check(await page.evaluate(()=>voices.size===0),'sustain release failed');
 await page.locator('#tone').selectOption('bell');await page.locator('#tone').blur();await page.keyboard.down('a');
 check(await page.evaluate(()=>[...voices.values()][0].oscillators[0] instanceof OscillatorNode),'synth switch failed');await page.keyboard.up('a');
 await page.locator('#tone').selectOption('sample');
 await page.waitForFunction(()=>$('status').textContent.includes('已就绪'));
 console.log('PASS: 30 local samples, audible signal, chord, F#5, sustain, synth switch',signal);
 return {passed:true,...signal};
}
