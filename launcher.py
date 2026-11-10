"""轻奏本地启动器，仅依赖 Python 标准库。"""
import argparse
import functools
import http.server
from pathlib import Path
import socket
import sys
import threading
import urllib.request
import webbrowser

ROOT = Path(__file__).resolve().parent
URL = 'http://localhost:4186/'
parser = argparse.ArgumentParser()
parser.add_argument('--no-browser', action='store_true')
args = parser.parse_args()

def existing_piano():
    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(URL, timeout=2) as response:
            text = response.read(20000).decode('utf-8', errors='replace')
            return '<title>轻奏 · 键盘钢琴</title>' in text
    except Exception:
        return False

def open_page():
    if not args.no_browser:
        webbrowser.open(URL)

if existing_piano():
    print('Piano already running: ' + URL, flush=True)
    open_page()
    sys.exit(0)

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, fmt, *values):
        # 只报告错误，避免演奏时刷请求日志。
        if values and str(values[1] if len(values)>1 else '').startswith(('4', '5')):
            super().log_message(fmt, *values)

try:
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 4186), functools.partial(Handler, directory=str(ROOT)))
except OSError as error:
    # 处理两个启动器同时启动的情况，不切换端口，以免分裂浏览器数据。
    if existing_piano():
        open_page()
        sys.exit(0)
    print('Port 4186 is unavailable. Close the conflicting application and retry.\n' + str(error), flush=True)
    sys.exit(1)

print('Qingzou Piano: ' + URL, flush=True)
print('Keep this window open while playing. Ctrl+C stops the server.', flush=True)
threading.Timer(0.3, open_page).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
