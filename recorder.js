// 从钢琴音频图直接录制，不申请麦克风权限。
const recordingPanel=document.createElement('section');recordingPanel.className='practice';
recordingPanel.innerHTML=`<h2>录制你的旋律</h2><p class="subtle">只录钢琴声音，不使用麦克风。每段录音单独保留，可回听、下载；刷新或关闭页面会清空未下载的录音。</p><div class="controls"><button id="recordStart">开始录制</button><button id="recordStop" disabled>停止录制</button><output id="recordTime">00:00</output><output id="recordMessage" aria-live="polite">准备好后，点击开始录制。</output></div><div id="recordings"></div>`;
document.querySelector('.bottom').before(recordingPanel);
const recordingStyle=document.createElement('style');recordingStyle.textContent='.recording-take{border-top:1px solid var(--line);padding:14px 0;display:flex;align-items:center;flex-wrap:wrap;gap:12px}.recording-take audio{max-width:100%;height:38px}.recording-take a{color:var(--blue)}#recordTime{font-variant-numeric:tabular-nums}#recordMessage{font-size:13px;color:var(--muted)}#recordStart.recording{background:#b44858;color:white}';document.head.append(recordingStyle);
let recorder=null,recordDestination=null,recordTimer=null,recordStarted=0,takeNumber=0;
const takeUrls=new Set();
function recordingClock(){const seconds=Math.floor((performance.now()-recordStarted)/1000);$('recordTime').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');return seconds;}
function stopRecording(){if(!recorder||recorder.state==='inactive')return;clearInterval(recordTimer);recordTimer=null;recorder.stop();$('recordStop').disabled=true;$('recordMessage').textContent='正在整理录音…';}
$('recordStart').onclick=async()=>{
 if(recorder&&recorder.state!=='inactive')return;
 $('recordStart').disabled=true;
 try{
  if(!window.MediaRecorder)throw Error('此浏览器不支持录音，请使用新版 Chrome 或 Edge。');
  audio();await ctx.resume();
  if(!recordDestination){recordDestination=ctx.createMediaStreamDestination();analyser.connect(recordDestination);}
  // 回放先暂停，虽然不进入录音图，也避免与现场演奏混听。
  document.querySelectorAll('#recordings audio').forEach(el=>el.pause());
  const mime=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
  const session=new MediaRecorder(recordDestination.stream,mime?{mimeType:mime}:undefined);
  const chunks=[];recorder=session;
  session.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  session.onstop=()=>{
   clearInterval(recordTimer);recordTimer=null;
   const type=session.mimeType||chunks[0]?.type||'audio/webm';
   const blob=new Blob(chunks,{type});
   const duration=(performance.now()-recordStarted)/1000;
   $('recordStart').disabled=false;$('recordStart').classList.remove('recording');$('recordStart').textContent='再录一段';$('recordStop').disabled=true;
   if(blob.size===0){$('recordMessage').textContent='没有生成有效录音，请重试。';return;}
   saveRecordedTake(blob,duration);
  };
  session.onerror=()=>{$('recordMessage').textContent='录制发生错误，请停止录制后重试。';stopRecording()};
  recordStarted=performance.now();$('recordTime').textContent='00:00';
  session.start(250);$('recordStart').classList.add('recording');$('recordStart').textContent='录制中…';$('recordStop').disabled=false;
  $('recordMessage').textContent='正在录制钢琴声音，最多 10 分钟。';
  recordTimer=setInterval(()=>{if(recordingClock()>=600)stopRecording()},200);
  $('recordStart').blur();
 }catch(error){$('recordStart').disabled=false;$('recordMessage').textContent='无法开始录音：'+error.message;}
};
$('recordStop').onclick=()=>{stopRecording();$('recordStop').blur()};
window.addEventListener('beforeunload',e=>{if(unsavedTakes.size||(recorder&&recorder.state!=='inactive')){e.preventDefault();e.returnValue='';}});
