# 轻奏 · 键盘钢琴

一架可在浏览器中弹奏的钢琴：用电脑键盘或鼠标演奏，导入文本曲谱跟弹，也能录下自己的旋律。

作者：满天星斗烟火繁

## 功能

- 一组八度键盘，支持多键和弦、延音及八度切换。
- Salamander 原声钢琴采样，以及柔和钢琴、清亮电琴两种合成音色。
- TXT / 粘贴简谱与音名，下一琴键亮起，按对才继续；支持曲谱收藏。
- 自定义键位，多布局保存与切换。
- 直接录制网页钢琴声音，不调用麦克风；录音本地保存、重命名、回放和下载。
- 曲谱与键位 JSON 备份、恢复。
- 自由弹奏、跟弹练习、键位设置、我的录音四个工作区。

## 运行

### Windows

安装 Python 3（包含 `py` 启动器），双击 **启动钢琴.cmd**。

也可在项目目录执行：

```bash
py -X utf8 launcher.py
```

启动后打开 **http://localhost:4186/**。保留服务窗口；Ctrl+C 或关闭窗口停止服务。重复启动会打开已有钢琴，不会重复启动服务。端口冲突时会报错，不会关闭其他程序。

### 其他系统

```bash
python3 launcher.py
```

无需安装第三方依赖。采样已经包含在仓库中，本地运行无需联网。不要直接通过 file:// 打开 HTML，浏览器可能阻止采样加载。

## 默认键位

白键：`A S D F G H J K`；黑键：`W E T Y U`。

空格按住延音；左右方向键切换八度。建议使用英文输入法。

## 曲谱示例

音符用空格分隔：

```text
1 1 5 5 6 6 5 | 4 4 3 3 2 2 1
C4 D4 E4 F#4 G4 A4 B4 C5
```

简谱可选择 1 对应 C3/C4/C5；`1'` 高一组八度，`1,` 低一组八度，`#4` 升 Fa。`0` 和 `-` 直接跳过，不考核节奏。

只支持单音旋律文本，暂不支持图片、PDF、MIDI 和和弦曲谱，不保存练习进度。

## 技术与文件

| 部分 | 实现 |
|---|---|
| 页面 | 原生 HTML / CSS / JavaScript |
| 发声 | Web Audio API，采样变调与振荡器合成 |
| 录音 | MediaRecorder，浏览器支持的 WebM / Ogg / MP4 音频 |
| 存储 | IndexedDB 录音；localStorage 曲谱与键位 |
| 启动 | Python 标准库本地 HTTP 服务，仅监听本机 |

- `index.html`：页面和基础钢琴引擎。
- `sample-engine.js`：原声采样加载与播放。
- `practice.js`：曲谱解析与跟弹。
- `keymap.js`：键位设置。
- `recorder.js`、`library.js`：录音、持久化、收藏和备份。
- `workspace.js`：工作区布局。
- `samples/salamander/`：音色及来源、授权说明。
- `verify*.cjs`：开发时的 Playwright 浏览器检查脚本，需本地服务与 Playwright CLI；不会随启动器自动运行。
- [完整使用说明](使用说明.md)。

## 数据安全与限制

所有用户资料保存在本机浏览器，不上传。请使用同一浏览器、同一配置与同一地址；换端口或改用 127.0.0.1 会进入不同存储空间。清除网站数据会删除资料。

重要录音请单独下载。JSON 备份只包含曲谱与键位，不含录音。浏览器存储不能替代备份。

本仓库不包含个人录音、用户曲谱备份、浏览器记录或密钥。仓库上传不等于部署在线网站。

## 音色许可与致谢

Piano samples: **Salamander Grand Piano by Alexander Holm**, **CC BY 3.0**; MP3 distribution via [Tonejs/audio](https://github.com/Tonejs/audio/tree/master/salamander). Playback pitch-shifts samples as needed.

采样文件保持来源 MP3 字节，播放时使用邻近采样变调补全音高。参见 [音色署名与来源](samples/salamander/ATTRIBUTION.md) 和 [原始说明](samples/salamander/README-original.txt)。这是轻量采样集合，不包含原始音源全部力度层。
