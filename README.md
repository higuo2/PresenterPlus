# PresenterPlus

PresenterPlus 是一套多模态演讲界面：讲者用提词器、语音、手势和现场提示管理演示；观众观看沉浸式投影片与实时字幕；结束后查看语速、专注度与演示复盘。

截至 2026-10-27，六项功能均已在本地预览中测试成功。完整实现状态、测试步骤与限制见 [PROCESS.md](PROCESS.md)。

## 收到 ZIP 后：安装与启动

以下步骤面向第一次拿到 ZIP 的使用者。不需要任何 Git 帐号、Git 客户端或线上仓库；只要解压 ZIP 并在本机运行即可。

### 0. 安装前准备

| 用途 | 必需软件 | 说明 |
| --- | --- | --- |
| PresenterPlus 网页 | Node.js 22、pnpm、Chrome | 必须安装。字幕、语速与网页 Q&A 手势建议使用 Chrome。 |
| Attention / Students 摄像头分析 | Python 3.12 | 可选；不启动服务时页面仍会显示演示数据。 |
| 独立手势控制器 | macOS、Python 3.12、摄像头 | 可选，仅 macOS；用于系统级翻页、激光与标注。 |

可在终端确认基础环境：

```bash
node --version
pnpm --version
python3.12 --version
```

前两条应分别显示 Node 22 与 pnpm 的版本。没有安装 pnpm 时，可在已安装 Node 后运行 `corepack enable`，再运行 `corepack prepare pnpm@latest --activate`。若不使用 Attention 或独立手势控制器，则不需要 Python。

### 1. 解压并进入项目根目录

1. 双击 `PresenterPlus.zip` 解压。不要只打开 ZIP 预览；必须先完整解压到本地磁盘。
2. 打开解压后的 `PresenterPlus` 文件夹。根目录应能看到 `package.json`、`src/`、`classroom-attention-monitor/` 和 `hand-gesture-controller/`。
3. 在这个根目录打开终端：
   - **macOS**：在 Finder 右键文件夹，选择“新建位于文件夹位置的终端窗口”，或在 Terminal 中执行 `cd ` 后把文件夹拖入终端。
   - **Windows**：在文件夹空白处右键，选择“在终端中打开”。

后续第 2 步的命令必须在包含 `package.json` 的根目录执行。

### 2. 安装并启动 PresenterPlus 网页（必做）

在第一个终端中执行：

```bash
pnpm install
pnpm dev
```

第一次安装会下载网页依赖，完成后终端会显示本机地址；通常是 `http://localhost:8443/`。按住 `Cmd`（macOS）或 `Ctrl`（Windows）点击地址，或复制到 Chrome 打开。**保持这个终端运行**；关闭它会停止网站。

首次使用建议按以下顺序验证：

1. 打开 **Presenter workspace**，点击 **Start presentation**。
2. Chrome 询问时允许麦克风；说英文约十秒，检查字幕和 Pacing coach 的 WPM。
3. 打开 **Audience display**，确认字幕只属于当前一场演示。
4. 结束演示后打开 **Session analytics** 查看本场报告。

字幕依赖 Chrome 的 Web Speech Recognition，目前设为英文（`en-US`）。若没有收到麦克风弹窗，请在 Chrome 地址栏左侧的网站权限中将 Microphone 设为 Allow，然后刷新页面。

### 3. 启动 Attention / Students 摄像头分析（可选）

这项服务与网页分开运行，因此请**保持第一个 `pnpm dev` 终端不关闭**，再打开第二个终端。三个本地模型文件已经随项目放在 `classroom-attention-monitor/models/`。

Windows（PowerShell）：

```powershell
cd classroom-attention-monitor
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn backend.app.asgi:app --host 127.0.0.1 --port 8000
```

Mac（终端）：

```bash
cd classroom-attention-monitor
python3.12 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python -m alembic upgrade head
./.venv/bin/python -m uvicorn backend.app.asgi:app --host 127.0.0.1 --port 8000
```

看到服务正在监听 `127.0.0.1:8000` 后，回到已经打开的 PresenterPlus，进入 **Attention dashboard**（`/attention`），点击 **Start stream**，并允许摄像头权限。**Students** 会读取同一场的匿名数据。服务未启动时，这两个页面会展示可浏览的演示数据，不影响其他功能。

Mac 上若提示找不到 `python3.12`，先安装 Python 3.12，再从该区块第一行重新执行。Attention 服务与独立手势控制器都需要摄像头，不能同时使用同一颗摄像头。

### 4. 启动独立 Hand Gesture Presentation Controller（可选，限 macOS）

此控制器是独立程序，不需要、也不会修改 PresenterPlus 网页内部状态。它会向当前前台的 Audience display 浏览器窗口发送翻页按键，并提供系统级激光与标注。请另开**第三个终端**，在项目根目录执行：

```bash
cd hand-gesture-controller
python3.12 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python main.py
```

首次启动时，在 macOS 弹窗中允许终端使用 **Camera**；并到“系统设置 → 隐私与安全性 → 辅助功能”允许所用终端，以便程序可发送左右方向键。打开 PresenterPlus 的 **Audience display**、让它保持前台后再使用手势。按 `q` 退出；将鼠标移到屏幕左上角可触发 PyAutoGUI 的紧急停止。完整手势表见 [hand-gesture-controller/README.md](hand-gesture-controller/README.md)。

### 5. 关闭与下次启动

1. 在 PresenterPlus 点击 **End presentation**，确保本场字幕与统计正确结束。
2. 在每个终端按 `Ctrl+C` 停止对应服务；手势控制器可先按 `q`。
3. 下次启动时，网页通常只需重复第 2 步的 `pnpm dev`；已完成 `pnpm install` 后无需再次安装。
4. Attention 服务或手势控制器已创建 `.venv` 后，仍可直接重复各自区块的最后一条启动命令。若更换电脑或删除 `.venv`，才需要从创建虚拟环境开始重做。

## 打包分享

发送给别人时，请从项目根目录创建 ZIP，但排除本机 Git 元数据、已安装依赖、虚拟环境、构建输出和运行时数据库。收件人解压后按本 README 重新执行 `pnpm install`，并在需要专注度功能时安装 Python 依赖即可。

macOS / Linux：

```bash
zip -r ../PresenterPlus.zip . \
  -x ".git/*" "*/.git/*" "node_modules/*" "dist/*" \
  -x "classroom-attention-monitor/.venv/*" \
  -x "classroom-attention-monitor/data/*" \
  -x "classroom-attention-monitor/frontend/*" \
  -x "hand-gesture-controller/.venv/*" \
  -x "**/__pycache__/*" "**/.pytest_cache/*" "**/.DS_Store"
```

不要把 `.git` 目录、`.venv`、`node_modules` 或 `data/` 放入分享包；这些内容不是运行源码，且可能带有本机路径、远端配置或本地会话数据。`classroom-attention-monitor/frontend/` 是未被 PresenterPlus 使用的独立旧前端，也不需要放入分享包。

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
   - 另外提供独立的 macOS [Hand Gesture Presentation Controller](hand-gesture-controller/README.md)，可通过系统级手势控制全屏 Audience display 的翻页、激光与标注，不与网页状态耦合。

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
6. 若使用专注度功能，按上方说明启动 Python 服务，再检查 `/attention` 和 `/students`。

## 技术限制

- 字幕依赖浏览器 Web Speech Recognition 与麦克风权限，目前使用 `en-US`。
- 注意力服务的首次画面会等待其模型加载。
- Structured session notes 目前导出为 `.txt`，不是 PDF。
- 独立 Hand Gesture Presentation Controller 仅支持 macOS，并需要 Camera 与 Accessibility 权限。
