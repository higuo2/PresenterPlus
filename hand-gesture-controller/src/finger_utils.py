# Each finger has: TIP (top), PIP (middle joint).
# tip is ABOVE pip → finger is UP. That test misses an index pointed at the
# camera, because the fingertip is then no higher than the knuckle.

import math

FINGERTIPS = [8, 12, 16, 20]
PIP_JOINTS = [6, 10, 14, 18]
THUMB_TIP = 4
THUMB_IP  = 3

# mcp, pip, tip
_INDEX = (5, 6, 8)
_OTHERS = ((9, 10, 12), (13, 14, 16), (17, 18, 20))


def _dist(a, b):
    return math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)


def _straightness(landmarks, mcp, pip, tip):
    ax = landmarks[pip].x - landmarks[mcp].x
    ay = landmarks[pip].y - landmarks[mcp].y
    az = landmarks[pip].z - landmarks[mcp].z
    bx = landmarks[tip].x - landmarks[pip].x
    by = landmarks[tip].y - landmarks[pip].y
    bz = landmarks[tip].z - landmarks[pip].z
    na = math.sqrt(ax * ax + ay * ay + az * az) + 1e-6
    nb = math.sqrt(bx * bx + by * by + bz * bz) + 1e-6
    return (ax * bx + ay * by + az * bz) / (na * nb)


def index_pointing(landmarks):
    # Drawing holds the index straight and the other fingers curled. Depth
    # keeps that true when the index points at the screen.
    index = _straightness(landmarks, *_INDEX)
    others = [_straightness(landmarks, *ids) for ids in _OTHERS]
    index_len = _dist(landmarks[8], landmarks[5])
    middle_len = _dist(landmarks[12], landmarks[9])
    bent = sum(score < 0.35 for score in others)
    return index > 0.75 and bent >= 2 and index_len > middle_len * 1.25


def count_fingers(landmarks, handedness):
    count = 0

    for tip_id, pip_id in zip(FINGERTIPS, PIP_JOINTS):
        if landmarks[tip_id].y < landmarks[pip_id].y:
            count += 1

    if count == 0 and index_pointing(landmarks):
        count = 1

    return count


def is_fist(landmarks, handedness):
    if index_pointing(landmarks):
        return False

    # All fingers must be DOWN
    for tip_id, pip_id in zip(FINGERTIPS, PIP_JOINTS):
        if landmarks[tip_id].y < landmarks[pip_id].y - 0.04:
            return False

    # Thumb must also be closed
    thumb_tip = landmarks[THUMB_TIP]
    thumb_ip = landmarks[THUMB_IP]

    if abs(thumb_tip.x - thumb_ip.x) > 0.05:
        return False
    return True


def get_static_gesture(n_fingers):
    mapping = {
        # 0: "FIST",
        1: "DRAW",
        2: "POINTER",
        3: "UNDO",
        4: "CLEAR",
    }
    return mapping.get(n_fingers, None)
