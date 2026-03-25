from PIL import Image
import os

Image.MAX_IMAGE_PIXELS = None

img_path = r"C:\Users\심도진\Pictures\Screenshots\d12c3726-717b-4b88-b771-dafdad64dcaf.png"
img = Image.open(img_path)
w, h = img.size

# 4분할
half_w = w // 2
half_h = h // 2

parts = {
    'top_left':     (0,      0,      half_w, half_h),
    'top_right':    (half_w, 0,      w,      half_h),
    'bottom_left':  (0,      half_h, half_w, h),
    'bottom_right': (half_w, half_h, w,      h),
}

out_dir = r"G:\hell\assets\maps\stage_0"
os.makedirs(out_dir, exist_ok=True)

for name, box in parts.items():
    cropped = img.crop(box)
    # 2배 확대
    new_w = cropped.width * 2
    new_h = cropped.height * 2
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)
    out_path = os.path.join(out_dir, f"stage_0_{name}.png")
    resized.save(out_path)
    print(f"저장: {out_path} ({new_w}x{new_h})")

print("완료")
