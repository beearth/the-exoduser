"""Offline classifier controls; no new Unity/Player evidence is produced."""
import importlib.util
from pathlib import Path
import unittest
from PIL import Image

spec = importlib.util.spec_from_file_location('scroll_ink', Path(__file__).with_name('scroll-ink.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class InkControls(unittest.TestCase):
    def test_real_ink_and_legacy_boxes(self):
        result = module.run()
        self.assertTrue(result['calibrated'])
        self.assertIsNone(result['productionPassed'])
        self.assertEqual(len(result['rows']), 4)

    def contrast_image(self, mode, background, foreground):
        row = module.read_json(module.FIXTURES/'manifest.json')['rows'][1 if mode == 'gray' else 3]
        original = Image.open(module.FIXTURES/(row['stem']+'.png')).convert('RGB')
        points = module.ink(original, row)
        fixture = Image.new('RGB', original.size, background)
        for x, y in points:
            fixture.putpixel((int(x-row['roi'][0]),int(y-row['roi'][1])),foreground)
        return row, fixture, points

    def test_gray_background_above_old_threshold_is_not_ink(self):
        row, image, expected = self.contrast_image('gray',(100,100,100),(220,218,215))
        self.assertEqual(module.ink(image,row),expected)
        self.assertLess(len(expected),image.width*image.height*.7)

    def test_faint_green_below_old_g35_threshold_is_retained(self):
        row, image, expected = self.contrast_image('green',(18,18,18),(7,26,7))
        self.assertEqual(module.ink(image,row),expected)

    def test_blank_or_solid_panel_cannot_pass(self):
        for mode in ['gray','green']:
            row={'mode':mode,'roi':[0,0,30,20]}
            for color in [(100,100,100),(7,26,7),(0,0,0)]:
                self.assertEqual(module.ink(Image.new('RGB',(30,20),color),row),[])

if __name__ == '__main__':
    unittest.main()
