import Quartz
from AppKit import (
    NSBezierPath,
    NSBackingStoreBuffered,
    NSColor,
    NSMakeRect,
    NSScreen,
    NSScreenSaverWindowLevel,
    NSView,
    NSWindow,
    NSWindowCollectionBehaviorCanJoinAllSpaces,
    NSWindowCollectionBehaviorFullScreenAuxiliary,
    NSWindowCollectionBehaviorIgnoresCycle,
    NSWindowCollectionBehaviorStationary,
    NSWindowStyleMaskBorderless,
)

_INK = []


class InkView(NSView):
    def isOpaque(self):
        return False

    def drawRect_(self, rect):
        if not _INK:
            return
        _INK[0].paint(self.bounds())


class ScreenInk:
    """Transparent layer over the slideshow. Ink and the laser live here, not in the camera window."""

    def __init__(self):
        self.strokes = []
        self.current = []
        self.laser = None
        self._smooth = None
        self.view = None
        self.window = None
        _INK.append(self)
        self._open()

    def _open(self):
        screen = NSScreen.mainScreen().frame()
        self.window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            screen,
            NSWindowStyleMaskBorderless,
            NSBackingStoreBuffered,
            False,
        )
        self.window.setOpaque_(False)
        self.window.setBackgroundColor_(NSColor.clearColor())
        self.window.setHasShadow_(False)
        self.window.setLevel_(NSScreenSaverWindowLevel)
        self.window.setIgnoresMouseEvents_(True)
        self.window.setHidesOnDeactivate_(False)
        self.window.setCollectionBehavior_(
            NSWindowCollectionBehaviorCanJoinAllSpaces
            | NSWindowCollectionBehaviorFullScreenAuxiliary
            | NSWindowCollectionBehaviorStationary
            | NSWindowCollectionBehaviorIgnoresCycle
        )
        self.view = InkView.alloc().initWithFrame_(
            NSMakeRect(0, 0, screen.size.width, screen.size.height)
        )
        self.view.setWantsLayer_(True)
        self.view.layer().setOpaque_(False)
        self.view.layer().setBackgroundColor_(Quartz.CGColorCreateGenericRGB(0, 0, 0, 0))
        self.window.setContentView_(self.view)
        self.window.orderFrontRegardless()

    def _point(self, nx, ny):
        bounds = self.view.bounds()
        x = min(1.0, max(0.0, float(nx))) * float(bounds.size.width)
        y = min(1.0, max(0.0, float(ny))) * float(bounds.size.height)
        if self._smooth is None:
            self._smooth = [x, y]
        else:
            self._smooth[0] += (x - self._smooth[0]) * 0.5
            self._smooth[1] += (y - self._smooth[1]) * 0.5
        return (self._smooth[0], self._smooth[1])

    def pen_move(self, nx, ny):
        point = self._point(nx, ny)
        if self.current and _far(self.current[-1], point) < 1.6:
            return
        self.current.append(point)
        self.laser = None

    def pen_up(self):
        if not self.current:
            return
        if len(self.current) >= 2:
            self.strokes.append(self.current)
            if len(self.strokes) > 40:
                del self.strokes[:-40]
        self.current = []
        self._smooth = None

    def set_laser(self, nx, ny):
        self.laser = self._point(nx, ny)

    def hide_laser(self):
        self.laser = None

    def undo(self):
        if self.current:
            self.current = []
            self._smooth = None
        elif self.strokes:
            self.strokes.pop()

    def clear(self):
        self.strokes = []
        self.current = []
        self.laser = None
        self._smooth = None

    def flush(self):
        if self.view is None:
            return
        self.view.setNeedsDisplay_(True)
        self.view.display()

    def close(self):
        if self in _INK:
            _INK.remove(self)
        if self.window is not None:
            self.window.orderOut_(None)
            self.window.close()
            self.window = None
        self.view = None

    def paint(self, bounds):
        height = float(bounds.size.height)
        pen = NSColor.colorWithCalibratedRed_green_blue_alpha_(0.95, 0.08, 0.08, 0.96)
        pen.set()
        strokes = self.strokes
        if len(self.current) >= 2:
            strokes = strokes + [self.current]
        for stroke in strokes:
            path = NSBezierPath.bezierPath()
            path.setLineWidth_(7.0)
            path.setLineCapStyle_(1)
            path.setLineJoinStyle_(1)
            x, y = stroke[0]
            path.moveToPoint_((x, height - y))
            for x, y in stroke[1:]:
                path.lineToPoint_((x, height - y))
            path.stroke()
        if not self.laser:
            return
        x, y = self.laser
        cy = height - y
        NSColor.colorWithCalibratedRed_green_blue_alpha_(1.0, 0.12, 0.08, 0.30).set()
        NSBezierPath.bezierPathWithOvalInRect_(((x - 26, cy - 26), (52, 52))).fill()
        NSColor.colorWithCalibratedRed_green_blue_alpha_(1.0, 0.18, 0.12, 1.0).set()
        NSBezierPath.bezierPathWithOvalInRect_(((x - 8, cy - 8), (16, 16))).fill()


def _far(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5
