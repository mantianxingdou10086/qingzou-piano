"""下载公开授权的 Salamander 钢琴轻量 MP3，并校验来源与文件完整性。"""
import json, urllib.request, hashlib, concurrent.futures
from pathlib import Path
root = Path(__file__).parent / 'samples' / 'salamander'
root.mkdir(parents=True, exist_ok=True)
def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'KeyboardPiano-SampleCollector'})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read()
items = json.loads(fetch('https://api.github.com/repos/Tonejs/audio/contents/salamander'))
(root/'source-list.json').write_text(json.dumps(items, indent=2), encoding='utf-8')
readme = fetch(next(i['download_url'] for i in items if i['name']=='README'))
(root/'README-original.txt').write_bytes(readme)
print(readme.decode(), flush=True)
files = [i for i in items if i['name'].endswith('.mp3')]
def download(item):
    data = fetch(item['download_url'])
    assert len(data)==item['size'], item['name']+' size mismatch'
    blob = b'blob '+str(len(data)).encode()+b'\0'+data
    assert hashlib.sha1(blob).hexdigest()==item['sha'], item['name']+' hash mismatch'
    (root/item['name']).write_bytes(data)
    return {'file': item['name'], 'bytes':len(data), 'source': item['download_url'], 'sha256':hashlib.sha256(data).hexdigest()}
records=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for row in pool.map(download, files):
        records.append(row)
        (root/'manifest.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
assert len(records)==len(files)
print(json.dumps({'downloaded':len(records),'expected':len(files),'bytes':sum(r['bytes'] for r in records),'files':[r['file'] for r in records]},indent=2))
