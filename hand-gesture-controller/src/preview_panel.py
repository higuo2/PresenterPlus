"""Camera preview pinned to a browser or slideshow window.

OpenCV's own window stays on the normal desktop space, so it vanishes as soon
as Chrome or Safari goes fullscreen. This panel is borderless, above normal
windows, and allowed onto fullscreen spaces.
"""

import Quartz
from AppKit import (
    NSApplication,
    NSApplicationActivationPolicyAccessory,
    NSBackingStoreBuffered,
    NSColor,
    NSData,
    NSImage,
    NSImageScaleAxesIndependently,
    NSImageView,
    NSMakeRect,
    NSPanel,
    NSScreen,
    NSWindowCollectionBehaviorCanJoinAllSpaces,
    NSWindowCollectionBehaviorFullScreenAuxiliary,
    NSWindowCollectionBehaviorIgnoresCycle,
    NSWindowCollectionBehaviorStationary,
    NSWindowStyleMaskBorderless,
    NSWindowStyleMaskNonactivatingPanel,
)

_BEHAVIOR = (
    NSWindowCollectionBehaviorCanJoinAllSpaces
    | NSWindowCollectionBehaviorFullScreenAuxiliary
    | NSWindowCollectionBehaviorStationary
    | NSWindowCollectionBehaviorIgnoresCycle
)


class PreviewPanel:
    def __init__(self, width, height):
        self.width = int(width)
        self.height = int(height)
        app = NSApplication.sharedApplication()
        app.setActivationPolicy_(NSApplicationActivationPolicyAccessory)

        style = NSWindowStyleMaskBorderless | NSWindowStyleMaskNonactivatingPanel
        self.panel = NSPanel.alloc().initWithContentRect_styleMask_backing_defer_(
            NSMakeRect(0, 0, self.width, self.height),
            style,
            NSBackingStoreBuffered,
            False,
        )
        self.panel.setOpaque_(True)
        self.panel.setHasShadow_(False)
        self.panel.setBackgroundColor_(NSColor.blackColor())
        self.panel.setHidesOnDeactivate_(False)
        self.panel.setFloatingPanel_(True)
        self.panel.setBecomesKeyOnlyIfNeeded_(True)
        self.panel.setIgnoresMouseEvents_(True)
        self.panel.setLevel_(Quartz.CGWindowLevelForKey(Quartz.kCGMaximumWindowLevelKey))
        self.panel.setCollectionBehavior_(_BEHAVIOR)

        self.view = NSImageView.alloc().initWithFrame_(
            NSMakeRect(0, 0, self.width, self.height)
        )
        self.view.setImageScaling_(NSImageScaleAxesIndependently)
        self.panel.setContentView_(self.view)

    def show(self, bgr):
        import cv2

        ok, encoded = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 72])
        if not ok:
            return
        raw = encoded.tobytes()
        image = NSImage.alloc().initWithData_(NSData.dataWithBytes_length_(raw, len(raw)))
        if image is None:
            return
        self.view.setImage_(image)
        self.view.setNeedsDisplay_(True)
        self.view.display()

    def place(self, area):
        margin = 18
        if area is None:
            visible = NSScreen.mainScreen().visibleFrame()
            area_x = float(visible.origin.x)
            area_y = float(visible.origin.y)
            area_w = float(visible.size.width)
            area_h = float(visible.size.height)
        else:
            area_x, area_y, area_w, area_h = area
        origin_x = area_x + area_w - self.width - margin
        origin_y = area_y + margin
        origin_x = min(max(area_x, origin_x), area_x + max(0, area_w - self.width))
        origin_y = min(max(area_y, origin_y), area_y + max(0, area_h - self.height))
        self.panel.setFrameOrigin_((origin_x, origin_y))
        self.panel.setLevel_(Quartz.CGWindowLevelForKey(Quartz.kCGMaximumWindowLevelKey))
        self.panel.setCollectionBehavior_(_BEHAVIOR)
        self.panel.orderFrontRegardless()

    def close(self):
        self.panel.orderOut_(None)
        self.panel.close()
