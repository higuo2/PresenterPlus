# PresenterPlus

PresenterPlus 是一个多模态演讲界面。讲者用手势、语音和现场提示来控制幻灯片，观众看实时字幕，讲完之后回看自己的表现。

当前仓库是这套界面。语速提示跟着已确认的英文字幕变。会后报告里的语速曲线仍是演示数据。现场专注度接到了本目录里的 Python 摄像头服务。

## 打开网页

在项目目录里：

```powershell
pnpm install
pnpm dev
```

浏览器打开 http://localhost:8443/ 。

左侧切换页面。**Help & shortcuts** 是手势、语音口令和现场提示的说明。

## 六个功能

界面按 `Project_Description.pdf` 里的六个任务来排。

1. **讲稿跟着讲走（Smart Teleprompter）**
   Presenter workspace 里的提词器一次只显示几句，当前句会高亮。可以向上跳过、向下回看。说明里有把提词放大的语音口令。

2. **控制语速（Pacing Coach），现场专注度看摄像头**
   打开 **Start live captions** 之后，只统计已经确认的英文词。每 2 秒用最近 8 秒的词数算出 WPM。120–140 是绿色，高于 140 是琥珀色，低于 120 是蓝色。窗口里没有新词时，颜色保持上一档。Pacing coach 页画出这条曲线；一段语速冲过 140 再落回来时，记下当时的幻灯片号。这一段还没有经过讲者实测。
   原来的 Ambient Sensing 改由 **Attention dashboard** 和 **Students** 承担。摄像头按人脸朝向和视线给匿名分数，不存姓名。左侧 **Pacing coach** 下面就是这两页。这一页只看语速。

3. **不用碰设备来翻页和指向（Hands-Free Control）**
   幻灯片可以点缩略图或用方向键翻。激光笔是一个开关。也可以先指向图表，再说放大。说明里写了滑动手势、握拳锁定和手指激光。

4. **从讲课切到问答（Lecture 到 Q&A）**
   Enter Q&A mode 会收起侧栏，进入问答倒计时。结束后可以回到讲课。说明里有对应的语音口令。

5. **观众看字幕，会后拿笔记（Live Captions & Auto Notes）**
   Audience display 是给观众看的画面：幻灯片、实时字幕，关键词会标出来。可以从这里下载这场的 session notes。

6. **讲完之后回看（Analytics）**
   Session analytics 是会后报告，包括语速曲线、填充词、问答时长、每组幻灯片用时，以及一条改进建议。

## 专注度

后端在 `classroom-attention-monitor`。那个目录里已经有 Python 3.12 虚拟环境。先启动它，监听 `8000`：

```powershell
cd classroom-attention-monitor
.\.venv\Scripts\python.exe -m uvicorn backend.app.asgi:app --host 127.0.0.1 --port 8000
```

再回到本目录执行 `pnpm dev`，打开 http://localhost:8443/attention 。

下拉框默认是 **Latest session**，会跟着正在进行的那一节。点 **Start stream** 打开摄像头并开始记录，按钮变成 **Stop session**。模型加载时状态是 Connecting…，第一帧出来后，平均专注度、在场人数和曲线会跟着更新。**Students** 用同一节课。后端没开时，页面显示一组内置数字。
