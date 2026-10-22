# PresenterPlus

PresenterPlus 是一个多模态演讲界面。讲者用手势、语音和现场提示来控制幻灯片，观众看实时字幕，讲完之后回看自己的表现。

当前仓库是这套界面。麦克风、摄像头、语音识别和会后数据都是演示状态，点得动，但没有接入真实设备。

## 打开网页

在项目目录里：

```powershell
pnpm install
pnpm dev
```

浏览器打开 http://localhost:8443/ 。

左侧可以切换六个界面对应的页面。**Help & shortcuts** 是手势、语音口令和现场提示的说明。

## 六个功能

界面按 `Project_Description.pdf` 里的六个任务来排。

1. **讲稿跟着讲走（Smart Teleprompter）**
   Presenter workspace 里的提词器一次只显示几句，当前句会高亮。可以向上跳过、向下回看。说明里有把提词放大的语音口令。

2. **控制语速，并感知现场气氛（Pacing Coach & Ambient Sensing）**
   主界面用绿、琥珀、蓝色提示语速偏慢、合适或过快。Audience sensing 显示现场声音的时间线。说明里有心跳声、绿光、闪烁和房间灯光这些提示。

3. **不用碰设备来翻页和指向（Hands-Free Control）**
   幻灯片可以点缩略图或用方向键翻。激光笔是一个开关。也可以先指向图表，再说放大。说明里写了滑动手势、握拳锁定和手指激光。

4. **从讲课切到问答（Lecture 到 Q&A）**
   Enter Q&A mode 会收起侧栏，进入问答倒计时。结束后可以回到讲课。说明里有对应的语音口令。

5. **观众看字幕，会后拿笔记（Live Captions & Auto Notes）**
   Audience display 是给观众看的画面：幻灯片、实时字幕，关键词会标出来。可以从这里下载这场的 session notes。

6. **讲完之后回看（Analytics）**
   Session analytics 是会后报告，包括语速曲线、填充词、问答时长、每组幻灯片用时，以及一条改进建议。
