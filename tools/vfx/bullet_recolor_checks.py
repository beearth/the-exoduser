"""Numerical asset gates; these do not replace Unity/Player visual review."""
import unittest
import re
import numpy as np
from recolor_bullet_sheets import PALETTES, ART, ROOT, ORB_SOURCE_ROWS, load, frame_metrics, recolor_frame, clean_orb_alpha, clean_detached_alpha
from scipy import ndimage as ndi


class OneBAssetsTests(unittest.TestCase):
    def test_every_comet_and_orb_cell_has_one_body_even_at_3x(self):
        for name, rows, cols in [('proj_bolt_comet_el', 8, 8), ('proj_elem_orb_el', 6, 6)]:
            a = load('field/' + name + '.png')
            ch, cw = a.shape[0] // rows, a.shape[1] // cols
            counts = []
            for r in range(rows):
                for c in range(cols):
                    alpha = a[r*ch:(r+1)*ch, c*cw:(c+1)*cw, 3]
                    enlarged = np.repeat(np.repeat(alpha, 3, axis=0), 3, axis=1)
                    counts.append(ndi.label(enlarged > 255*.05, np.ones((3, 3)))[1] - 1)
            self.assertEqual(counts, [0] * (rows * cols), name + ': detached components')

    def test_poison_uses_original_integer_cells_and_palette(self):
        target = ART / 'boss/druid_poison_orb.png'
        self.assertTrue(target.exists(), 'poison sheet missing')
        src, dst = load('boss/proj_firedevil_orb.png'), load('boss/druid_poison_orb.png')
        self.assertEqual(dst.shape, src.shape)
        np.testing.assert_array_equal(src[..., 3], dst[..., 3])
        h, w = src.shape[:2]
        cw, ch = w//4, h//4
        for f in range(16):
            x, y = f%4*cw, h-((3-f//4)*ch)-ch
            np.testing.assert_array_equal(dst[y:y+ch,x:x+cw], recolor_frame(src[y:y+ch,x:x+cw], PALETTES[7]))
        np.testing.assert_array_equal(dst[:h-4*ch], src[:h-4*ch])
        np.testing.assert_array_equal(dst[:,4*cw:], src[:,4*cw:])


class RecolorTests(unittest.TestCase):
    def test_palette_replaces_rgb_without_changing_alpha_or_geometry(self):
        src = np.zeros((16, 256, 4), np.uint8)
        src[..., :3] = np.arange(256, dtype=np.uint8)[None, :, None]
        src[..., 3] = 255
        src[0, :, 3] = 0
        weights = np.array([.299, .587, .114])
        for palette in PALETTES:
            with self.subTest(element=palette[0]):
                out = recolor_frame(src, palette)
                np.testing.assert_array_equal(out[..., 3], src[..., 3])
                self.assertEqual(out.shape, src.shape)
                expected_shadow = tuple(bytes.fromhex(palette[1][1:]))
                self.assertEqual(tuple(out[1, 0, :3]), expected_shadow)
                self.assertEqual(tuple(out[1, -1, :3]), tuple(bytes.fromhex(palette[4][1:])))
                bright = (out[..., :3] @ weights >= 240) & (out[..., 3] > 20)
                self.assertGreater(int(bright.sum()), 0)
                self.assertLessEqual(int(bright.sum()), int((src[..., 3] > 20).sum() * .03))

    def test_opening_removes_detached_speck_but_preserves_connected_filament(self):
        alpha = np.zeros((32, 32), np.uint8)
        alpha[8:24, 8:24] = 193
        alpha[14, 2:9] = 71
        alpha[2:4, 27:29] = 255
        out = clean_orb_alpha(alpha)
        np.testing.assert_array_equal(out[8:24, 8:24], alpha[8:24, 8:24])
        np.testing.assert_array_equal(out[14, 2:9], alpha[14, 2:9])
        self.assertEqual(int(out[2:4, 27:29].sum()), 0)
        self.assertTrue(np.all(out <= alpha))

    def test_empty_frame_stays_transparent(self):
        src = np.zeros((8, 8, 4), np.uint8)
        self.assertEqual(int(recolor_frame(src, PALETTES[7])[..., 3].sum()), 0)

    def test_bright_budget_does_not_round_up_for_odd_population(self):
        src = np.zeros((1, 10636, 4), np.uint8)
        # Dense RGB combinations reproduce a non-integral percentile index.
        n = np.arange(10636)
        src[0, :, 0] = n % 256
        src[0, :, 1] = n // 256
        src[..., 3] = 255
        for palette in PALETTES:
            out = recolor_frame(src, palette)
            count = int((out[..., :3] @ np.array([.299, .587, .114]) >= 240).sum())
            self.assertLessEqual(count, int(10636 * .03))


class GeneratedAssetsTests(unittest.TestCase):
    def test_generated_comet_cells_keep_alpha_and_bright_budget(self):
        src, dst = load('field/proj_bolt_comet.png'), load('field/proj_bolt_comet_el.png')
        self.assertEqual(dst.shape, (1096, 2032, 4))
        for row in range(8):
            for f in range(8):
                a = src[:, f*254:(f+1)*254]
                b = dst[row*137:(row+1)*137, f*254:(f+1)*254]
                baseline = recolor_frame(a, PALETTES[row])
                self.check_preserved_body(baseline, b)

    def test_generated_orb_rows_only_remove_source_alpha(self):
        src, dst = load('field/proj_elem_orb.png'), load('field/proj_elem_orb_el.png')
        self.assertEqual(dst.shape, (1536, 3072, 4))
        for row, old in enumerate(ORB_SOURCE_ROWS):
            for f in range(6):
                a = src[old*256:(old+1)*256, f*512:(f+1)*512]
                b = dst[row*256:(row+1)*256, f*512:(f+1)*512]
                self.assertTrue(np.all(b[..., 3] <= a[..., 3]))
                baseline = a.copy()
                baseline[...,3] = clean_orb_alpha(a[...,3])
                baseline = recolor_frame(baseline, PALETTES[row+1])
                self.check_preserved_body(baseline, b)

    def check_preserved_body(self, baseline, out):
        labels, _ = ndi.label(baseline[...,3] > 255*.05, np.ones((3,3)))
        sizes = np.bincount(labels.ravel()); sizes[0] = 0
        body = labels == sizes.argmax()
        np.testing.assert_array_equal(out[...,3][body], baseline[...,3][body])
        np.testing.assert_array_equal(out[...,:3], baseline[...,:3])
        self.assertTrue(np.all(out[...,3] <= baseline[...,3]))
        hot = ((out[...,:3] @ np.array([.299,.587,.114]) >= 240) & (out[...,3] > 20)).sum()
        self.assertLessEqual(hot, int((baseline[...,3] > 20).sum()*.03))

    def test_importers_only_change_unique_guid(self):
        guids = set()
        for old_path,new_path in [('field/proj_bolt_comet','field/proj_bolt_comet_el'),('field/proj_elem_orb','field/proj_elem_orb_el'),('boss/proj_firedevil_orb','boss/druid_poison_orb')]:
            old = (ART / (old_path + '.png.meta')).read_text(encoding='utf-8')
            new = (ART / (new_path + '.png.meta')).read_text(encoding='utf-8')
            old_guid = re.search(r'^guid: ([0-9a-f]{32})$', old, re.M).group(1)
            new_guid = re.search(r'^guid: ([0-9a-f]{32})$', new, re.M).group(1)
            self.assertNotEqual(old_guid, new_guid)
            self.assertNotIn(new_guid, guids)
            guids.add(new_guid)
            self.assertEqual(old.replace(old_guid, ''), new.replace(new_guid, ''))


if __name__ == '__main__':
    unittest.main()
