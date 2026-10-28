# Classroom Attention Monitor

This folder is the optional local camera service used by PresenterPlus **Attention dashboard** and **Audience**. It runs independently on `http://127.0.0.1:8000`; PresenterPlus proxies its requests through `/cam` while the Vite development server is running.

The service performs local, anonymous room analysis. It detects observable attention signals — head pose, gaze direction, blinks, phone visibility, and raised hands — and stores only tracker-generated labels such as `Audience 1`. It does not store names or face embeddings.

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

- `GET /health` — current pipeline state
- `POST /stream/start` and `POST /stream/stop` — camera control
- `GET /statistics`, `/analytics`, `/attendance`, and `/students` — dashboard data
- `GET /students/{id}/timeline` — anonymous audience-member curve
- `WS /ws/live` — annotated camera frames and live metrics

## Configuration and local data

`config.yaml` contains the camera source, thresholds, analysis cadence, database location, and model paths. Runtime data is written below `data/` and is ignored by version control. Adjust `video.source` if the required camera is not index `0`.

## Safety and privacy

- Obtain consent before analyzing anyone on camera.
- This is a presentation-support signal, not a grading, identification, or disciplinary system.
- The gesture controller and this service both use the camera. Run only one camera-consuming feature at a time.
