"""원본 금속 픽셀 위에 그리지 않고 흑철 backing/rim/shadow만 아래에 합성한다.

실행: python tools/build-logo-solid.py [검수 출력 폴더]
의존성: Pillow, numpy, scipy. 유료 API와 이미지 생성 모델을 사용하지 않는다.
"""
from pathlib import Path
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'img/logo_exoduser.png'
TARGET = ROOT / 'img/logo_exoduser_solid.png'


def composite():
    original = Image.open(SOURCE).convert('RGBA')
    pixels = np.array(original)
    alpha = pixels[:, :, 3]
    # Close subpixel breaks in engraved outlines, then fill enclosed counters.
    # Open negative spaces (E/U/S and spaces between letters) remain transparent.
    closed = ndi.binary_closing(alpha > 24, iterations=3)
    silhouette = ndi.binary_fill_holes(closed) | (alpha > 24)
    # A 3px black rim supplies an opaque dark matte for translucent metal edges.
    silhouette_image = Image.fromarray(silhouette.astype('uint8') * 255)
    # The open tooth row is inside the skull, not a gap between separate letters.
    ImageDraw.Draw(silhouette_image).polygon([(352, 326), (438, 326), (423, 409), (395, 503), (366, 408)], fill=255)
    # Smooth only the new matte's contour; the metal foreground is untouched.
    wide = np.array(silhouette_image.filter(ImageFilter.MaxFilter(7)), dtype=float) / 255
    smooth = ndi.gaussian_filter(wide, .85)
    antialiased = np.clip((smooth - .15) / .7, 0, 1)
    core = ndi.binary_dilation(np.array(silhouette_image) > 0, iterations=1)
    antialiased[core] = 1
    rim = Image.fromarray(np.round(antialiased * 255).astype('uint8'))
    y, x = np.indices(alpha.shape)
    relief = .65 * np.sin(x / 47 + y / 71) + .35 * np.sin(y / 19 - x / 123)
    iron = np.zeros_like(pixels)
    for channel, value in enumerate((12, 13, 15)):
        iron[:, :, channel] = np.round(value + relief).astype('uint8')
    iron[:, :, 3] = np.array(rim)
    backing = Image.fromarray(iron)
    # Shadow below the rim: dark, soft, no luminous edge or neon.
    shifted = Image.new('L', original.size)
    shifted.paste(rim, (0, 6))
    shadow_alpha = shifted.filter(ImageFilter.GaussianBlur(10)).point(lambda v: round(v * .72))
    shadow = Image.new('RGBA', original.size, (0, 0, 0, 0))
    shadow.putalpha(shadow_alpha)
    result = Image.alpha_composite(Image.alpha_composite(shadow, backing), original)
    assert result.size == original.size
    final = np.array(result)
    assert np.array_equal(final[alpha == 255], pixels[alpha == 255]), '원본 불투명 금속 보존 실패'
    assert np.all(final[np.array(rim) == 255, 3] == 255), 'backing 내부 반투명 구멍'
    result.save(TARGET, optimize=True)
    return original, result, rim


if __name__ == '__main__':
    original, result, rim = composite()
    print(TARGET)
    if len(sys.argv) > 1:
        out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
        rim.save(out / 'solid-backing-mask.png')
        for name, color in [('red', (160, 0, 20, 255)), ('white', (255, 255, 255, 255)), ('black', (0, 0, 0, 255))]:
            for label, logo in [('before', original), ('after', result)]:
                sample = Image.alpha_composite(Image.new('RGBA', logo.size, color), logo).convert('RGB')
                sample.save(out / f'{label}-{name}-1x.png')
                # Native pixel crop and nearest-neighbor 3x expose holes/edge stairs.
                crop = sample.crop((80, 190, 500, 460))
                crop.save(out / f'{label}-{name}-detail-1x.png')
                crop.resize((1260, 810), Image.Resampling.NEAREST).save(out / f'{label}-{name}-detail-3x.png')
