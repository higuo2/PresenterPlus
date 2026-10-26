# PresenterPlus

PresenterPlus 是一套多模态演讲界面：讲者用提词器、语音、手势和现场提示管理演示；观众观看沉浸式投影片与实时字幕；结束后查看语速、专注度与演示复盘。

截至 2026-10-26，六项功能均已在本地预览中测试成功。完整实现状态、测试步骤与限制见 [PROCESS.md](PROCESS.md)。

## 启动

```powershell
pnpm install
pnpm dev
```

打开本地 Vite 预览地址（常见为 `http://localhost:8443/`；Figma Make 环境会提供自己的预览端口）。左侧导航可切换各页面，**Help & shortcuts** 提供语音和现场控制说明。

## 六项功能

1. **Smart Teleprompter**
   - 显示前一句、当前句与下一句；当前句有 **YOU'RE HERE** 标记。
   - 按完整词数和标点暂停估算停留时间。
   - 空闲时不滚动；点击 **Start presentation** 后自动滚动，仍可用 **Auto-scroll** 手动暂停或恢复。
   - 可点击任意可见脚本句、跳过/回看，或在切换投影片时重新定位。

2. **Pacing Coach**
   - 只用已确认的英文字幕计算最近八秒的 WPM，每两秒刷新一次。
   - Slow（<120）、Optimal（120–140）和 Fast（>140）会同步到 Presenter workspace、Pacing coach 及 Audience display。
   - 面板提供 WPM、目标区间、近期曲线、会话指标、辅导建议与逐页 tip；快速语速结束后会在曲线上留下 peak 标记。

3. **Gesture-assisted Q&A**
   - 摄像头不会自动打开；讲者手动选择 **Start gesture camera** 才会请求权限。
   - 本地 WASM 手部关键点检测连续识别到双手约 0.8 秒后进入 Q&A；单独检测到人脸不会触发。

4. **Lecture → Q&A**
   - 支持按钮、双手手势或 `Enter Q&A` 语音口令进入问答。
   - Q&A 包含五分钟计时、暂停/继续、加一分钟、字幕书签，以及浏览器支持时的内存音频回放。
   - `End Q&A` 可回到讲课界面并保留本场数据。

5. **Live Captions & Audience Display**
   - 浏览器英文实时字幕会同步到独立 Audience display 标签页。
   - Audience display 是深色 theater mode，投影片最大化，字幕作为最多两行的浮动玻璃字幕条显示。
   - 每次开始或结束演示都会清空 Audience display；不会恢复上一场的字幕。
   - 可下载按 Slide 和时间戳整理的 **Structured session notes** 文本文件。

6. **Attention & Session Analytics**
   - Attention dashboard 与 Students 可连接可选的教室摄像头服务，显示匿名专注度、在场人数、手机、举手、眨眼、活动和趋势。
   - Session analytics 会在结束演示后使用本场时间显示报告，并提供语速、受众专注度、分布、活动与手机使用摘要。

## 快速验收

1. 进入 Presenter workspace，选择 **Start presentation**，允许麦克风权限。
2. 确认 Auto-scroll 启动；用英文连续讲话约十秒，检查 Pacing coach WPM 和状态变化。
3. 打开 **Audience display**，确认只有本场字幕显示、字幕位于投影片下方浮层，且底部光条随 WPM 状态变化。
4. 选择 **Enter Q&A mode**，测试计时和返回；或使用手动开启的 gesture camera，双手入镜约一秒进入 Q&A。
5. 结束演示后查看 **Session analytics**。
6. 若使用专注度功能，按下方说明启动 Python 服务，再检查 `/attention` 和 `/students`。

## Attention service（可选）

专注度摄像头服务位于独立仓库：[higuo2/classroom-attention-monitor](https://github.com/higuo2/classroom-attention-monitor)。本仓库不包含该服务。将它克隆到项目旁，并使用 Python 3.12：

```powershell
git clone https://github.com/higuo2/classroom-attention-monitor.git
cd classroom-attention-monitor
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts/download_models.py
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn backend.app.asgi:app --host 127.0.0.1 --port 8000
```

回到此项目运行 `pnpm dev`，进入 `/attention` 并选择 **Start stream**。后端不可用时，前端会显示内置演示数据。

## 技术限制

- 字幕依赖浏览器 Web Speech Recognition 与麦克风权限，目前使用 `en-US`。
- 注意力服务的首次画面会等待其模型加载。
- Structured session notes 目前导出为 `.txt`，不是 PDF。
