// 曲谱仅在本地解析，不上传文件。每个标记代表一个待弹音符。
const practice=document.createElement('section');
practice.className='practice';
practice.innerHTML=`<h2>导入曲谱 · 跟弹练习</h2>
<p class="subtle">粘贴简谱或音名，也可导入 UTF-8 TXT。单音旋律，按对才前进，不考核节奏；0 和 - 跳过。高音加 '，低音加英文逗号，如 1'、1,。音符之间用空格分隔。</p>
<label for="scoreText">曲谱内容</label><textarea id="scoreText" rows="3" spellcheck="false" placeholder="1 1 5 5 6 6 5 | 4 4 3 3 2 2 1">1 1 5 5 6 6 5 | 4 4 3 3 2 2 1</textarea>
<div class="controls"><div class="group"><label for="scoreBase">简谱 1 对应</label><select id="scoreBase"><option>C3</option><option selected>C4</option><option>C5</option></select></div><label class="file-label">导入 TXT <input id="scoreFile" type="file" accept=".txt,text/plain"></label><button id="practiceStart">开始 / 重新练习</button><button id="practiceStop">退出跟弹</button><button id="practiceJump" hidden>切换到目标音区</button></div>
<output id="practiceMessage" aria-live="polite">等待开始。示例：1 2 3 4 5 6 7 1'，或 C4 D4 E4 F#4。</output>
<div id="scorePreview" aria-label="曲谱进度"></div>`;
document.querySelector('.bottom').before(practice);
const style=document.createElement('style');style.textContent=`.practice{margin-top:30px;border-top:1px solid var(--line);padding-top:24px}.practice textarea{display:block;width:100%;max-width:none;background:#1c2c43;color:var(--text);border:1px solid var(--line);border-radius:6px;padding:12px;font:17px/1.8 'Segoe UI',sans-serif;margin:8px 0 16px;resize:vertical}.practice .controls{gap:12px;margin-bottom:12px}.file-label input{max-width:190px;font-size:12px}#practiceMessage{color:var(--blue)}#scorePreview{display:flex;gap:7px;flex-wrap:wrap;margin-top:16px;max-height:180px;overflow:auto}.score-note{padding:3px 8px;border:1px solid var(--line);border-radius:4px;color:var(--muted)}.score-note.done{opacity:.45}.score-note.current{color:#11273e;background:var(--blue);border-color:var(--blue)}.key.next-note{outline:3px solid #40d9c0;outline-offset:-4px;background:#bcefe6;color:#123b36}.black.next-note{background:#247d79;color:white}button[hidden]{display:none}`;document.head.append(style);
let score=[],scoreIndex=0,practicing=false,practiceFeedback='';
function parseScore(text,base){
 const parts=text.trim().replace(/[|｜，;；]/g,' ').split(/\s+/).filter(Boolean);
 if(!parts.length)throw Error('请输入曲谱。');
 if(parts.length>2000)throw Error('每次最多导入 2000 个音符。');
 const result=[];
 for(const token of parts){
  if(token==='0'||token==='-'||token==='—')continue;
  let midi,m=token.match(/^([#b]?)([1-7])([',]*)$/);
  if(m){const shifts=[...m[3]];if(shifts.includes("'")&&shifts.includes(','))throw Error('高低音标记不能混用：'+token);midi=base+[0,2,4,5,7,9,11][Number(m[2])-1]+(m[1]==='#'?1:m[1]==='b'?-1:0)+shifts.reduce((s,c)=>s+(c==="'"?12:-12),0);}
  else {m=token.match(/^([A-Ga-g])([#♯b♭]?)([1-7])$/);if(!m)throw Error('无法识别「'+token+'」。请用空格分隔音符，如 1 2 #4 或 C4 D4 F#5。');midi=12*(Number(m[3])+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1].toUpperCase()]+(['#','♯'].includes(m[2])?1:['b','♭'].includes(m[2])?-1:0);}
  if(midi<24||midi>96)throw Error('音符超出支持音域 C1–C7：'+token);
  result.push(midi);
 }
 if(!result.length)throw Error('曲谱没有可弹奏的音符。');
 return result;
}
function midiName(m){return names[m%12]+(Math.floor(m/12)-1)}
function renderPractice(){
 keys.forEach(k=>k.classList.remove('next-note'));
 $('practiceJump').hidden=true;
 if(!practicing)return;
 const target=score[scoreIndex],base=12*(octave+1),offset=target-base;
 if(offset>=0&&offset<keys.length)keys[offset].classList.add('next-note');
 else $('practiceJump').hidden=false;
 const key=offset>=0&&offset<bindings.length?bindings[offset].toUpperCase():'需切换音区';
 $('practiceMessage').textContent=practiceFeedback+'下一音 '+midiName(target)+' · '+key+' · 进度 '+scoreIndex+'/'+score.length;
 [...$('scorePreview').children].forEach((el,i)=>{el.className='score-note'+(i<scoreIndex?' done':i===scoreIndex?' current':'')});
}
function practiceNote(midi){
 if(!practicing)return;
 if(midi!==score[scoreIndex]){practiceFeedback='刚弹的是 '+midiName(midi)+'，再试一次。';renderPractice();return;}
 scoreIndex++;practiceFeedback='';
 if(scoreIndex===score.length){practicing=false;keys.forEach(k=>k.classList.remove('next-note'));$('practiceJump').hidden=true;[...$('scorePreview').children].forEach(el=>el.className='score-note done');$('practiceMessage').textContent='已弹完！共 '+score.length+' 个音符，可点击重新练习。';return;}
 renderPractice();
}
$('practiceStart').onclick=()=>{
 try{
  const next=parseScore($('scoreText').value,12*(Number($('scoreBase').value.slice(1))+1));
  stop();score=next;scoreIndex=0;practicing=true;practiceFeedback='';
  $('scorePreview').replaceChildren(...score.map(m=>{const el=document.createElement('span');el.className='score-note';el.textContent=midiName(m);return el}));
  renderPractice();$('practiceStart').blur();
 }catch(error){$('practiceMessage').textContent=error.message;}
};
$('practiceStop').onclick=()=>{practicing=false;keys.forEach(k=>k.classList.remove('next-note'));$('practiceJump').hidden=true;$('practiceMessage').textContent='已退出跟弹，可以自由演奏。';stop();};
$('practiceJump').onclick=()=>{if(!practicing)return;const targetOctave=Math.max(1,Math.min(6,Math.floor(score[scoreIndex]/12)-1));shift(targetOctave-octave);$('practiceJump').blur();};
$('scoreFile').onchange=async()=>{const file=$('scoreFile').files[0];if(!file)return;if(!/\.txt$/i.test(file.name)){$('practiceMessage').textContent='仅支持 TXT 文本曲谱，暂不支持图片、PDF 或 MIDI。';return;}if(file.size>100000){$('practiceMessage').textContent='文件过大，请导入小于 100 KB 的 TXT。';return;}try{$('scoreText').value=await file.text();$('practiceMessage').textContent='已读取 '+file.name+'，点击开始练习。';}catch{$('practiceMessage').textContent='读取失败，请重新选择文件。';}};
