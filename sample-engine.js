// 只读取本地素材；加载完成后用最近的采样变调，补齐每个半音。
const sampleBuffers = [];
let sampleLoading = null;
async function loadSamples() {
 if (sampleBuffers.length === 30) return;
 if (sampleLoading) return sampleLoading;
 sampleLoading = (async () => {
  const response = await fetch('samples/salamander/manifest.json');
  if (!response.ok) throw new Error('无法读取音色清单');
  const manifest = await response.json();
  const loaded = await Promise.all(manifest.map(async item => {
   const response = await fetch('samples/salamander/' + item.file);
   if (!response.ok) throw new Error('无法读取 ' + item.file);
   const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
   const match = item.file.match(/^(A|C|Ds|Fs)(\d)\.mp3$/);
   if (!match) throw new Error('无法识别采样音高');
   const midi = 12 * (Number(match[2]) + 1) + {A:9,C:0,Ds:3,Fs:6}[match[1]];
   return {buffer,midi,file:item.file};
  }));
  sampleBuffers.splice(0, sampleBuffers.length, ...loaded);
 })();
 try { await sampleLoading; } catch (error) {sampleLoading=null;throw error;}
}
$('tone').addEventListener('change', async () => {
 stop();
 if ($('tone').value !== 'sample') {$('status').textContent='已切换为合成音色';return;}
 audio();
 $('status').textContent='正在加载本地原声采样…';
 try {
  await loadSamples();
  if ($('tone').value === 'sample') $('status').textContent='原声钢琴已就绪 · 30 个采样';
 } catch (error) {
  if ($('tone').value === 'sample') {
   $('tone').value='piano';
   $('status').textContent='原声加载失败，已恢复合成音；请用本地网址打开';
  }
  console.warn('采样加载失败：',error.message);
 }
 $('tone').blur();
});
function sampleVoice(offset, gain, now) {
 const midi=12*(octave+1)+offset;
 const nearest=sampleBuffers.reduce((a,b)=>Math.abs(a.midi-midi)<=Math.abs(b.midi-midi)?a:b);
 const source=ctx.createBufferSource();
 source.buffer=nearest.buffer;
 source.playbackRate.value=Math.pow(2,(midi-nearest.midi)/12);
 source.connect(gain);
 gain.gain.cancelScheduledValues(now);
 gain.gain.setValueAtTime(1.7,now);
 source.start(now);
 return {source,duration:nearest.buffer.duration/source.playbackRate.value};
}
