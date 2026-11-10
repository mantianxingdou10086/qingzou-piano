// 键位布局存储在当前浏览器，不上传；预留空格、方向键等控制按键。
const defaultBindings=['a','w','s','e','d','f','t','g','y','h','u','j','k'];
const storageKey='qingzou.keymaps.v1';
let layouts={},activeLayout='',editingKey=-1;
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved.layouts&&typeof saved.layouts==='object')layouts=saved.layouts;if(typeof saved.active==='string')activeLayout=saved.active;}catch{}
function validMap(map){return Array.isArray(map)&&map.length===13&&map.every(k=>typeof k==='string'&&/^[a-z0-9;\[\]',.\/\\=\-`]$/.test(k))&&new Set(map).size===13;}
layouts=Object.fromEntries(Object.entries(layouts).filter(([name,map])=>name.length<=40&&validMap(map)));
const keyPanel=document.createElement('section');keyPanel.className='practice';
keyPanel.innerHTML=`<h2>自定义键位</h2><p class="subtle">点击一个音符，再按字母、数字或标点键。空格与方向键保留给延音和八度切换；Esc 取消设置。布局随音区一起移动。</p><div class="controls"><label for="layoutSelect">已保存布局</label><select id="layoutSelect"></select><button id="layoutDelete">删除所选布局</button><button id="layoutDefault">恢复默认键位</button></div><div id="keyEditors" class="key-editors"></div><div class="controls"><label for="layoutName">布局名称</label><input id="layoutName" maxlength="40" placeholder="例如：我的数字键布局"><button id="layoutSave">保存当前布局</button></div><output id="keymapMessage" aria-live="polite">点击下方音符即可改键。未命名的修改也会自动保留。</output>`;
document.querySelector('.bottom').before(keyPanel);
const keyStyle=document.createElement('style');keyStyle.textContent='.key-editors{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.key-editors button{min-width:68px;display:flex;flex-direction:column;align-items:center}.key-editors small{color:var(--muted)}.key-editors button.waiting{outline:3px solid #40d9c0}#layoutName{max-width:260px;padding:9px;background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:5px}';document.head.append(keyStyle);
const editorButtons=bindings.map((_,i)=>{const button=document.createElement('button');button.onclick=()=>{stop();editingKey=i;renderKeymap();$('keymapMessage').textContent='正在设置 '+label(i)+'，请按一个按键；Esc 取消。';};$('keyEditors').append(button);return button});
function persistKeymap(){try{localStorage.setItem(storageKey,JSON.stringify({layouts,active:activeLayout,current:[...bindings]}));return true;}catch{$('keymapMessage').textContent='浏览器存储不可用，本次修改可用，但刷新后不会保留。';return false;}}
function renderKeymap(){
 keys.forEach((key,i)=>{key.querySelector('kbd').textContent=bindings[i].toUpperCase();key.setAttribute('aria-label',label(i)+'，键盘 '+bindings[i]);});
 editorButtons.forEach((button,i)=>{button.replaceChildren();const small=document.createElement('small');small.textContent=label(i);const text=document.createElement('span');text.textContent=editingKey===i?'请按键…':bindings[i].toUpperCase();button.append(small,text);button.classList.toggle('waiting',editingKey===i);button.setAttribute('aria-label','设置 '+label(i)+' 的按键，目前 '+bindings[i]);});
 document.querySelector('.legend span').textContent='白键 '+bindings.filter((_,i)=>![1,3,6,8,10].includes(i)).join(' ').toUpperCase()+'　黑键 '+[1,3,6,8,10].map(i=>bindings[i]).join(' ').toUpperCase();
 document.querySelector('.bottom h2').textContent='弹奏小提示';
 document.querySelectorAll('.melody').forEach((el,i)=>el.textContent=(i===0?[0,0,7,7,9,9,7]:[5,5,4,4,2,2,0]).map(n=>bindings[n].toUpperCase()).join(' '));
 if(typeof renderPractice==='function')renderPractice();
}
function refreshLayouts(){const select=$('layoutSelect');select.replaceChildren();const initial=document.createElement('option');initial.value='';initial.textContent='当前键位 / 未选择布局';select.append(initial);for(const name of Object.keys(layouts)){const option=document.createElement('option');option.value=name;option.textContent=name;select.append(option);}select.value=activeLayout;$('layoutDelete').disabled=!activeLayout;}
function applyKeymap(map){stop();editingKey=-1;bindings.splice(0,bindings.length,...map);renderKeymap();}
window.addEventListener('keydown',e=>{
 if(editingKey<0)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(e.key==='Escape'){editingKey=-1;renderKeymap();$('keymapMessage').textContent='已取消改键。';return;}
 if(e.repeat||e.isComposing||e.ctrlKey||e.metaKey||e.altKey)return;
 const key=e.key.toLowerCase();
 if(!/^[a-z0-9;\[\]',.\/\\=\-`]$/.test(key)){$('keymapMessage').textContent='请选择字母、数字或常用标点；空格、方向键等已保留。';return;}
 const conflict=bindings.indexOf(key);
 if(conflict!==-1&&conflict!==editingKey){$('keymapMessage').textContent='按键 '+key.toUpperCase()+' 已绑定 '+label(conflict)+'，请换一个键。';return;}
 const note=label(editingKey);bindings[editingKey]=key;editingKey=-1;activeLayout='';renderKeymap();refreshLayouts();$('keymapMessage').textContent=note+' 已绑定 '+key.toUpperCase()+'。可命名保存为一套布局。';persistKeymap();
},true);
$('layoutSave').onclick=()=>{const name=$('layoutName').value.trim();if(!name){$('keymapMessage').textContent='请先输入布局名称。';return;}if(Object.hasOwn(layouts,name)&&!confirm('覆盖已保存的布局「'+name+'」？'))return;Object.defineProperty(layouts,name,{value:[...bindings],writable:true,configurable:true,enumerable:true});activeLayout=name;refreshLayouts();if(persistKeymap())$('keymapMessage').textContent='已保存布局「'+name+'」。';};
$('layoutSelect').onchange=()=>{const name=$('layoutSelect').value;if(!name){activeLayout='';refreshLayouts();persistKeymap();return;}applyKeymap(layouts[name]);activeLayout=name;$('layoutName').value=name;refreshLayouts();if(persistKeymap())$('keymapMessage').textContent='已切换到「'+name+'」。';$('layoutSelect').blur();};
$('layoutDelete').onclick=()=>{if(!activeLayout||!confirm('删除布局「'+activeLayout+'」？当前键位会保留。'))return;delete layouts[activeLayout];activeLayout='';refreshLayouts();if(persistKeymap())$('keymapMessage').textContent='布局已删除，当前键位仍可使用。';};
$('layoutDefault').onclick=()=>{applyKeymap(defaultBindings);activeLayout='';refreshLayouts();if(persistKeymap())$('keymapMessage').textContent='已恢复默认键位，保存的布局不受影响。';};
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(validMap(saved.current))applyKeymap(saved.current);}catch{}
if(!Object.hasOwn(layouts,activeLayout))activeLayout='';refreshLayouts();renderKeymap();
