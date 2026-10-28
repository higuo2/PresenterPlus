# PresenterPlus

PresenterPlus 是一套多模态演讲界面：讲者用提词器、语音、手势和现场提示管理演示；观众观看沉浸式投影片与实时字幕；结束后查看语速、专注度与演示复盘。

组员拿到项目后，按下面的顺序把网页、专注度和手势都打开即可。交互方式见 [交互说明.md](交互说明.md)。

## 收到 ZIP 后：安装与启动

以下步骤面向第一次拿到 ZIP 的使用者。不需要任何 Git 帐号、Git 客户端或线上仓库；只要解压 ZIP 并在本机运行即可。

### 0. 安装前准备

| 用途 | 必需软件 | 说明 |
| --- | --- | --- |
| PresenterPlus 网页 | Node.js 22、pnpm、Chrome | 必须安装。字幕、语速与网页 Q&A 手势建议使用 Chrome。 |
| Attention / Audience 摄像头分析 | Python 3.12 | 可选；不启动服务时页面仍会显示演示数据。 |
| 翻页、激光与标注 | macOS、Python 3.12、摄像头 | 可选，仅 macOS。网页里的双手手势只负责进入问答，不包含翻页和激光。 |

可在终端确认基础环境：

```bash
node --version
pnpm --version
python3.12 --version
```

前两条应分别显示 Node 22 与 pnpm 的版本。没有安装 pnpm 时，可在已安装 Node 后运行 `corepack enable`，再运行 `corepack prepare pnpm@latest --activate`。若不使用 Attention 或翻页激光，则不需要 Python。

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
2. Chrome 询问时允许麦克风；说英文约十秒，检查字幕和语速。
3. **另开一个浏览器标签**打开 **Audience display**。不要在讲者这个标签里点侧栏进去，否则当前这场的状态会丢掉。
4. 结束演示后打开 **Session analytics** 查看复盘版面。

字幕依赖 Chrome 的 Web Speech Recognition，目前设为英文（`en-US`）。若没有收到麦克风弹窗，请在 Chrome 地址栏左侧的网站权限中将 Microphone 设为 Allow，然后刷新页面。

### 3. 启动 Attention / Audience 摄像头分析（可选）

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

看到服务正在监听 `127.0.0.1:8000` 后，回到已经打开的 PresenterPlus，进入 **Attention dashboard**（`/attention`），点击 **Start stream**，并允许摄像头权限。**Audience**（`/audience-members`）会读取同一场的匿名数据。服务未启动时，这两个页面会展示可浏览的演示数据，不影响其他功能。

Mac 上若提示找不到 `python3.12`，先安装 Python 3.12，再从该区块第一行重新执行。Attention 服务、网页手势和翻页激光都需要摄像头，不能同时使用同一颗摄像头。

### 4. 启动翻页、激光与标注（可选，限 macOS）

此程序单独运行，不修改网页里的会话。它会向当前前台窗口发送翻页按键，并在屏幕上画激光和笔迹。请另开终端，在项目根目录执行：

```bash
cd hand-gesture-controller
python3.12 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python main.py
```

首次启动时，在 macOS 弹窗中允许终端使用 **Camera**；并到“系统设置 → 隐私与安全性 → 辅助功能”允许所用终端，以便程序可发送左右方向键。打开 PresenterPlus 的 **Audience display**、让它保持前台后再使用手势。按 `q` 退出；将鼠标移到屏幕左上角可触发紧急停止。完整手势表见 [hand-gesture-controller/README.md](hand-gesture-controller/README.md)。

网页里的 **Start gesture camera** 是另一项：双手保持约 0.8 秒会进入 Q&A，不能翻页，也没有激光。

### 5. 关闭与下次启动

1. 在 PresenterPlus 点击 **End presentation**。
2. 在每个终端按 `Ctrl+C` 停止对应服务；翻页激光可先按 `q`。
3. 下次启动时，网页通常只需重复第 2 步的 `pnpm dev`；已完成 `pnpm install` 后无需再次安装。
4. Attention 服务或手势程序已创建 `.venv` 后，仍可直接重复各自区块的最后一条启动命令。若更换电脑或删除 `.venv`，才需要从创建虚拟环境开始重做。

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

不要把 `.git` 目录、`.venv`、`node_modules` 或 `data/` 放入分享包。`classroom-attention-monitor/frontend/` 是未被 PresenterPlus 使用的独立旧前端，也不需要放入分享包。

## 打开后能点到的功能

1. **Smart Teleprompter**（Presenter workspace）
   - 显示上一句、当前句与下一句；当前句有 **YOU'RE HERE**。
   - 点击 **Start presentation** 后 **Auto-scroll** 开始，可再手动暂停或恢复。
   - 可点击可见句子，或在换页时回到该页第一句。

2. **Pacing Coach**（工作台顶部色带，以及 `/sensing`）
   - 用已确认的英文字幕计算最近八秒的 WPM，每两秒刷新一次。
   - Slow（低于 120）、Optimal（120–140）、Fast（高于 140）。
   - 听众屏底部光条使用同一状态。请在**另一个标签**打开 Pacing coach；不要从正在演讲的标签点过去。

3. **双手进入 Q&A**（Presenter workspace 的 **Start gesture camera**）
   - 不会自动打开摄像头。
   - 双手保持约 0.8 秒后进入 `/qa`。人脸或单手不会触发。

4. **Q&A session**（`/qa`）
   - 也可按 **Enter Q&A mode**，或在字幕里说 “Enter Q&A”。
   - 五分钟计时、暂停、加一分钟、字幕书签；浏览器支持时有内存音频。
   - **End Q&A** 或口令 “End Q&A” 回到讲授页。

5. **Live Captions 与 Audience display**（另开标签访问 `/audience`）
   - 英文实时字幕同步到听众标签。
   - 深色画面，投影片尽量大，字幕最多两行。
   - 开始或结束演示会清空听众标签上的字幕。
   - **Structured session notes** 在听众标签上下载 `.txt`。要在按 **End presentation** 之前下载，结束后字幕会被清掉。

6. **Attention、Audience 与 Session analytics**
   - `/attention` 与 `/audience-members`：未启动 Python 服务时是 Demo session；**Start stream** 后使用摄像头。标签是 Audience 1、Audience 2，不存姓名。
   - `/analytics`：复盘版面。图上的数字是固定样例，不是刚才这场实时算出来的。

## 快速验收

1. 进入 Presenter workspace，选择 **Start presentation**，允许麦克风权限。
2. 用英文连续讲话约十秒，检查 WPM 和 Auto-scroll。
3. 另开标签打开 **Audience display**，确认有本场字幕，且没有提词。
4. 选择 **Enter Q&A mode**，看计时后再返回。双手入口需另外打开 **Start gesture camera**。
5. 结束前如需笔记，在听众标签下载 **Structured session notes**。
6. 打开 **Session analytics** 看版面。
7. 若使用专注度，先启动 Python 服务，再检查 `/attention` 和 `/audience-members`。
8. 若在 macOS 上使用翻页和激光，按第 4 节启动，并让 Audience display 保持前台。
