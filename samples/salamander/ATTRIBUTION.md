# Salamander 钢琴采样来源与授权

- 名称：Salamander Grand Piano（Tonejs/audio 提供的轻量 MP3 集合）
- 原作者：Alexander Holm
- 钢琴型号：Yamaha C5（来源目录原始 README 记载）
- 许可：Creative Commons Attribution 3.0 Unported（CC BY 3.0）
- 许可链接：https://creativecommons.org/licenses/by/3.0/
- 下载来源：https://github.com/Tonejs/audio/tree/master/salamander
- 原始说明：https://raw.githubusercontent.com/Tonejs/audio/master/salamander/README

本目录采集了该来源的全部 30 个 MP3 文件，总计 2,012,677 字节。下载时逐个比对 GitHub 文件长度及 Git blob SHA-1，并保存 SHA-256 到 manifest.json；全部文件已经通过浏览器 AudioContext 解码检查。

这些是稀疏音高采样，不是逐键 88 个音，也不是包含全部力度层的原始大型音源。未采样的音符需在接入播放器时用最近采样变调。此目录保留原始 MP3 字节，未做剪辑或再编码。

分发时应保留作者署名、许可链接、来源和改动说明。项目可用署名：
“Piano samples: Salamander Grand Piano by Alexander Holm, CC BY 3.0; MP3 distribution via Tonejs/audio. Playback pitch-shifts samples as needed.”

本次只采集并验证素材，尚未接入 index.html 的发声逻辑，网页当前仍为合成音。
