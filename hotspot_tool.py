#!/usr/bin/env python3
"""
Hotspot picker tool for Elsie's Spark room background.
Draw a box on the image for each hotspot, then outputs CSS percentages.

Controls:
  - Click and drag to draw a box for the current hotspot
  - Press ENTER or SPACE to confirm and move to next hotspot
  - Press R to redo the current box
  - Press Q to quit early and print results so far
  - Close window when done
"""

import tkinter as tk
from PIL import Image, ImageTk
import sys
import json

IMAGE_PATH = "assets/home/home.png"

HOTSPOTS = [
    ("hotspot-gallery", "Gallery"),
    ("hotspot-easel", "Draw!"),
    ("hotspot-lightbulb", "Inspire"),
    ("hotspot-bell", "New"),
    ("hotspot-profile", "Profile"),
    ("hotspot-cat", "Help"),
]


class HotspotPicker:
    def __init__(self, root, img_path):
        self.root = root
        self.root.title("Hotspot Picker - Elsie's Spark")

        self.orig_img = Image.open(img_path)
        self.img_w, self.img_h = self.orig_img.size

        # Scale to fit screen
        screen_w = root.winfo_screenwidth() - 100
        screen_h = root.winfo_screenheight() - 150
        scale = min(screen_w / self.img_w, screen_h / self.img_h, 1.0)
        self.display_w = int(self.img_w * scale)
        self.display_h = int(self.img_h * scale)
        self.scale = scale

        display_img = self.orig_img.resize((self.display_w, self.display_h), Image.LANCZOS)
        self.tk_img = ImageTk.PhotoImage(display_img)

        # Label at top
        self.label = tk.Label(root, text="", font=("Arial", 16), pady=8)
        self.label.pack()

        self.canvas = tk.Canvas(root, width=self.display_w, height=self.display_h,
                                cursor="crosshair")
        self.canvas.pack()
        self.canvas.create_image(0, 0, anchor=tk.NW, image=self.tk_img)

        # Instructions
        instr = tk.Label(root,
                         text="Drag to draw box | ENTER/SPACE = confirm | R = redo | Q = quit",
                         font=("Arial", 11), pady=4)
        instr.pack()

        self.results = {}
        self.current_idx = 0
        self.rect_id = None
        self.start_x = 0
        self.start_y = 0
        self.end_x = 0
        self.end_y = 0
        self.drawing = False
        self.box_ready = False

        self.canvas.bind("<ButtonPress-1>", self.on_press)
        self.canvas.bind("<B1-Motion>", self.on_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_release)
        root.bind("<Return>", self.on_confirm)
        root.bind("<space>", self.on_confirm)
        root.bind("<r>", self.on_redo)
        root.bind("<R>", self.on_redo)
        root.bind("<q>", self.on_quit)
        root.bind("<Q>", self.on_quit)

        self.prompt_current()

    def prompt_current(self):
        if self.current_idx >= len(HOTSPOTS):
            self.finish()
            return
        hid, hlabel = HOTSPOTS[self.current_idx]
        self.label.config(
            text=f"[{self.current_idx+1}/{len(HOTSPOTS)}] Draw a box around: {hlabel} ({hid})",
            fg="blue"
        )
        self.box_ready = False

    def on_press(self, event):
        if self.current_idx >= len(HOTSPOTS):
            return
        self.start_x = event.x
        self.start_y = event.y
        self.drawing = True
        if self.rect_id:
            self.canvas.delete(self.rect_id)
            self.rect_id = None

    def on_drag(self, event):
        if not self.drawing:
            return
        self.end_x = event.x
        self.end_y = event.y
        if self.rect_id:
            self.canvas.delete(self.rect_id)
        self.rect_id = self.canvas.create_rectangle(
            self.start_x, self.start_y, self.end_x, self.end_y,
            outline="red", width=2, dash=(4, 4)
        )

    def on_release(self, event):
        if not self.drawing:
            return
        self.drawing = False
        self.end_x = event.x
        self.end_y = event.y
        self.box_ready = True
        _, hlabel = HOTSPOTS[self.current_idx]
        self.label.config(
            text=f"Box for {hlabel} ready. ENTER to confirm, R to redo.",
            fg="green"
        )

    def on_confirm(self, event=None):
        if not self.box_ready or self.current_idx >= len(HOTSPOTS):
            return
        # Convert display coords to percentage of image
        x1 = min(self.start_x, self.end_x)
        y1 = min(self.start_y, self.end_y)
        x2 = max(self.start_x, self.end_x)
        y2 = max(self.start_y, self.end_y)

        left_pct = (x1 / self.display_w) * 100
        top_pct = (y1 / self.display_h) * 100
        width_pct = ((x2 - x1) / self.display_w) * 100
        height_pct = ((y2 - y1) / self.display_h) * 100

        hid, hlabel = HOTSPOTS[self.current_idx]
        self.results[hid] = {
            "left": round(left_pct, 1),
            "top": round(top_pct, 1),
            "width": round(width_pct, 1),
            "height": round(height_pct, 1),
        }
        print(f"  {hid}: left={left_pct:.1f}% top={top_pct:.1f}% "
              f"width={width_pct:.1f}% height={height_pct:.1f}%")

        # Clear box and move to next
        if self.rect_id:
            self.canvas.delete(self.rect_id)
            self.rect_id = None
        self.current_idx += 1
        self.prompt_current()

    def on_redo(self, event=None):
        if self.rect_id:
            self.canvas.delete(self.rect_id)
            self.rect_id = None
        self.box_ready = False
        self.prompt_current()

    def on_quit(self, event=None):
        self.finish()

    def finish(self):
        self.print_results()
        self.root.destroy()

    def print_results(self):
        if not self.results:
            print("\nNo hotspots defined.")
            return

        print("\n" + "=" * 60)
        print("CSS OUTPUT (paste into styles.css):")
        print("=" * 60)
        for hid, vals in self.results.items():
            print(f"#{hid} {{")
            print(f"  left: {vals['left']}%;")
            print(f"  top: {vals['top']}%;")
            print(f"  width: {vals['width']}%;")
            print(f"  height: {vals['height']}%;")
            print(f"}}\n")

        print("=" * 60)
        print("JSON (for reference):")
        print("=" * 60)
        print(json.dumps(self.results, indent=2))


def main():
    root = tk.Tk()
    HotspotPicker(root, IMAGE_PATH)
    root.mainloop()


if __name__ == "__main__":
    main()
