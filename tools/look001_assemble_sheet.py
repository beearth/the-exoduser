#!/usr/bin/env python3
"""Compose viewport captures without resampling; requires Pillow 10.4.0."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

CROPS = {'player-contact': (800, 440, 1120, 696),
         'living-tree': (160, 320, 544, 704),
         'skin-ground': (1120, 560, 1504, 816)}
LABELS = {'A': 'A  ORIGINAL', 'B': 'B  2D NORMAL / LIGHTS',
          'C': 'C  3D METAL FORWARD+', 'D': 'D  3D COMPATIBILITY'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path)
    args = parser.parse_args()
    directory = args.directory.resolve()
    sheet = Image.new('RGB', (3840, 2288), '#101214')
    draw = ImageDraw.Draw(sheet)
    font_path = str(Path(__file__).resolve().parents[1] / 'godot/assets/fonts/ofl/cinzel/Cinzel-VariableFont_wght.ttf')
    font = ImageFont.truetype(font_path, 27)
    metadata = {'schema': 'exoduser.look-001.sheet.v1', 'resampling': False,
                'crop_rects_xyxy': CROPS, 'files': []}
    for index, mode in enumerate('ABCD'):
        image_path = directory / (mode + '.png')
        source = Image.open(image_path).convert('RGB')
        if source.size != (1920, 1080):
            raise ValueError('viewport capture must be 1920x1080: ' + str(image_path))
        data = json.loads((directory / (mode + '.json')).read_text())
        fps = data['performance']
        x, y = (index % 2) * 1920, (index // 2) * 1144
        draw.text((x + 22, y + 17), LABELS[mode], font=font, fill='#e0d2ba')
        caption = 'AVG %.1f  MIN(1s) %.1f  CAP 120' % (fps['average_fps'], fps['minimum_one_second_fps'])
        draw.text((x + 1230, y + 17), caption, font=font, fill='#b5a07b')
        sheet.paste(source, (x, y + 64))
        for label, rectangle in CROPS.items():
            path = directory / (mode + '-crop-' + label + '.png')
            source.crop(rectangle).save(path)
            metadata['files'].append({'path': str(path), 'mode': mode, 'crop': label,
                                      'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    path = directory / 'LOOK-001-grid-2x2-1x.png'
    sheet.save(path)
    metadata['sheet'] = {'path': str(path), 'size': list(sheet.size),
                         'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
    (directory / 'sheet-manifest.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2))
    print(json.dumps(metadata['sheet']))

if __name__ == '__main__':
    main()
