# Classroom Attention Monitor

This folder is the optional local camera service for the PresenterPlus **Attention dashboard** and **Audience** page. It runs on `http://127.0.0.1:8000`. While the Vite development server is running, PresenterPlus proxies its requests through `/cam`.

The analysis stays on this machine and uses anonymous labels. It detects head pose, gaze direction, blinks, phones, and raised hands, and it stores tracker labels such as `Audience 1`. It does not store names or face embeddings.

## Requirements

- Python 3.12
- A camera for live capture
- The three model files already included in `models/`

## Start the service

### Windows PowerShell

```powershell
cd classroom-attention-monitor
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn backend.app.asgi:app --host 127.0.0.1 --port 8000
```

### macOS Terminal

```bash
cd classroom-attention-monitor
python3.12 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python -m alembic upgrade head
./.venv/bin/python -m uvicorn backend.app.asgi:app --host 127.0.0.1 --port 8000
```

Keep this terminal open. Then start PresenterPlus from the repository root, open `/attention`, and select **Start stream**.

## API used by PresenterPlus

- `GET /health` checks the current pipeline state
- `POST /stream/start` and `POST /stream/stop` control the camera
- `GET /statistics`, `/analytics`, `/attendance`, and `/students` supply the dashboard
- `GET /students/{id}/timeline` returns one anonymous audience curve
- `WS /ws/live` sends annotated camera frames and live metrics

## Configuration and local data

`config.yaml` sets the camera source, thresholds, analysis cadence, database location, and model paths. Runtime data is written under `data/` and is ignored by version control. Change `video.source` if the camera you need is not index `0`.

## Safety and privacy

- Get consent before anyone is on camera.
- Use the record to review the talk. Do not use it to grade, identify, or discipline anyone.
- This service and the gesture controller both need a camera. Run only one of them at a time.
