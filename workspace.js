// 只调整现有界面的布局，保留各功能原有 DOM 与事件。
const instrument=document.querySelector('.instrument');
const intro=document.querySelector('.intro');
intro.querySelector('h1').textContent='坐下来，弹一会儿。';
intro.querySelector('p').textContent='自由弹奏，也可以导入曲谱，留下自己的旋律。';
const practicePanel=$('scoreText').closest('section');
const layoutPanel=$('keyEditors').closest('section');
const recordPanel=$('recordings').closest('section');
const freePanel=document.querySelector('.bottom');
const workspace=document.createElement('section');workspace.className='workspace';
const tabs=document.createElement('div');tabs.className='workspace-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','钢琴工作区');
const content=document.createElement('div');content.className='workspace-content';
workspace.append(tabs,content);instrument.after(workspace);
const panels=[freePanel,practicePanel,layoutPanel,recordPanel];
const tabNames=['自由弹奏','跟弹练习','键位设置','我的录音'];
const practiceStrip=document.createElement('div');practiceStrip.className='practice-strip';practiceStrip.hidden=true;
practiceStrip.append($('practiceMessage'),$('practiceJump'));instrument.append(practiceStrip);
const recordBar=document.createElement('div');recordBar.className='record-bar';
const recordLabel=document.createElement('span');recordLabel.className='subtle';recordLabel.textContent='录音台';
recordBar.append(recordLabel,$('recordStart'),$('recordStop'),$('recordTime'),$('recordMessage'));instrument.append(recordBar);
const emptyRecordControls=recordPanel.querySelector('.controls');emptyRecordControls.remove();
const recordHint=document.createElement('p');recordHint.className='subtle';recordHint.textContent='使用琴键下方的录音台开始录制，录好的片段会显示在这里。';recordPanel.querySelector('h2').after(recordHint);
function selectWorkspace(index){
 panels.forEach((panel,i)=>{panel.hidden=i!==index;const button=tabs.children[i];button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
 practiceStrip.hidden=index!==1&&!(typeof practicing!=='undefined'&&practicing);
 if(typeof editingKey!=='undefined'&&editingKey>=0&&index!==2){editingKey=-1;renderKeymap();$('keymapMessage').textContent='已取消改键。';}
}
panels.forEach((panel,i)=>{
 panel.id='workspace-panel-'+i;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','workspace-tab-'+i);panel.tabIndex=0;content.append(panel);
 const button=document.createElement('button');button.id='workspace-tab-'+i;button.textContent=tabNames[i];button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);
 button.onclick=()=>selectWorkspace(i);
 button.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();let next=e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4;selectWorkspace(next);tabs.children[next].focus();}};
 tabs.append(button);
});
const recordCount=new MutationObserver(()=>{const n=$('recordings').children.length;tabs.children[3].textContent=n?'我的录音（'+n+'）':'我的录音';});recordCount.observe($('recordings'),{childList:true});
const stripObserver=new MutationObserver(()=>{practiceStrip.hidden=panels[1].hidden&&!practicing;});stripObserver.observe($('practiceMessage'),{childList:true,characterData:true,subtree:true});
// 标签栏和播放器的空格/方向键保留原生行为，不误触琴键。
tabs.addEventListener('keydown',e=>e.stopPropagation());
recordPanel.addEventListener('keydown',e=>{if(e.target.tagName==='AUDIO')e.stopPropagation()});
const workspaceStyle=document.createElement('style');workspaceStyle.textContent=`
.intro{margin:24px 0 20px}.intro h1{font-size:28px}.intro p{font-size:13px}.instrument{position:sticky;top:12px;z-index:5;box-shadow:0 10px 30px #07101f66;padding:18px 22px 12px}.instrument>.controls{margin-bottom:16px;gap:18px}.piano{height:220px}.legend{margin-top:3px}.record-bar{display:flex;align-items:center;flex-wrap:wrap;gap:10px;border-top:1px solid var(--line);padding-top:12px;margin-top:12px}.record-bar button{padding:5px 12px}.record-bar #recordMessage{flex:1;min-width:150px}.practice-strip{display:flex;align-items:center;gap:14px;justify-content:space-between;border-top:1px solid var(--line);margin-top:12px;padding-top:10px;font-size:14px}.practice-strip[hidden]{display:none}.workspace{margin-top:24px}.workspace-tabs{display:flex;gap:6px;border-bottom:1px solid var(--line);overflow-x:auto;padding-bottom:9px}.workspace-tabs button{white-space:nowrap;border-color:transparent;background:transparent;color:var(--muted);padding:9px 18px}.workspace-tabs button[aria-selected=true]{background:#324c69;color:var(--text);border-color:#587da2}.workspace-content{padding:23px 0 8px}.workspace-content>.practice{margin:0;padding:0;border:0}.workspace-content>.bottom{margin:0}.workspace-content>[hidden]{display:none}.workspace-content #layoutName{max-width:240px}.workspace-content h2{font-size:17px}.workspace-content #scorePreview{max-height:160px}footer{border-top:1px solid var(--line);padding-top:16px;margin-top:22px}
@media(max-width:700px){.intro{margin:18px 0 14px}.intro h1{font-size:23px}.notes{margin-top:5px;min-height:30px;font-size:20px}.instrument{position:relative;top:auto;padding:14px 12px}.piano{height:190px}.workspace-tabs button{padding:8px 12px}.record-bar #recordMessage{flex-basis:100%}.practice-strip{align-items:start;flex-direction:column;gap:7px}.workspace{margin-top:18px}}@media(max-height:760px){.instrument{position:relative;top:auto}}
`;
document.head.append(workspaceStyle);selectWorkspace(0);
