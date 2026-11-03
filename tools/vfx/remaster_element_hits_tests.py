"""Focused regression tests; no Unity, asset writes or external directories."""
import importlib.util
import unittest

import numpy as np

SPEC = importlib.util.find_spec('remaster_element_hits')
if SPEC:
    import remaster_element_hits as hit


class ElementHitTests(unittest.TestCase):
    def test_tool_exists(self):
        self.assertIsNotNone(SPEC, 'deterministic element-hit remaster is missing')

    @unittest.skipUnless(SPEC, 'tool not implemented yet')
    def test_delayed_peak_and_empty_tail(self):
        frames = np.zeros((9, 40, 40, 4), dtype=np.uint8)
        for i, alpha in enumerate([25, 50, 110, 255, 100, 60, 20, 0, 0]):
            frames[i, 10:30, 10:30] = [180, 100, 70, alpha]
        mapping = hit.frame_map(frames, 1)
        self.assertEqual(mapping[1], 3)
        self.assertTrue(all(np.any(frames[i, ..., 3]) for i in mapping))
        self.assertEqual(len(mapping), 9)
        self.assertTrue(all(a <= b for a, b in zip(mapping, mapping[1:])))

    @unittest.skipUnless(SPEC, 'tool not implemented yet')
    def test_all_elements_contact_peak_hue_and_specks(self):
        for el in range(6):
            for boss in (False, True):
                count = 16 if boss else 9
                frames = np.zeros((count, 40, 40, 4), dtype=np.uint8)
                for i in range(count - 1):
                    alpha = max(10, 250 - abs(i - 5) * 35)
                    frames[i, 9:31, 9:31] = [255, 0, 255, alpha]
                    frames[i, 2, 2] = [0, 255, 0, 255]
                dst, mapping = hit.remaster(frames, el, boss)
                metrics = hit.frame_metrics(dst)
                self.assertLessEqual(int(np.argmax(metrics['energy'])), 2 if boss else 1)
                self.assertLessEqual(int(np.argmax(metrics['alpha_area'])), 2 if boss else 1)
                self.assertEqual(hit.hue_report(dst, el)['outside_hue_pixels'], 0)
                self.assertGreaterEqual(float(dst[0, 20, 20, :3] @ hit.WEIGHTS), 254)
                self.assertEqual(sum(hit.small_islands(f[..., 3], 0).sum() for f in dst), 0)
                self.assertEqual(len(mapping), count)

    @unittest.skipUnless(SPEC, 'tool not implemented yet')
    def test_meta_bytes_only_guid_changes(self):
        raw = b'fileFormatVersion: 2\r\nguid: ' + b'a' * 32 + b'\r\nTextureImporter:\r\n  alphaIsTransparency: 1\r\n'
        new = hit.copy_meta(raw, 'impact_el0_sheet_v2')
        self.assertEqual(new, hit.copy_meta(raw, 'impact_el0_sheet_v2'))
        self.assertEqual(new.replace(new.split(b'guid: ')[1][:32], b'a' * 32), raw)
        self.assertNotEqual(new, raw)

    @unittest.skipUnless(SPEC, 'tool not implemented yet')
    def test_inherited_faint_border_is_removed_without_cropping_body(self):
        frame = np.zeros((40, 40, 4), dtype=np.uint8)
        frame[8:32, 8:32] = [180, 100, 70, 255]
        frame[-1, 16:24] = [180, 100, 70, 4]
        result = hit.cleanup(frame.copy())
        self.assertFalse(result[-1, :, 3].any())
        np.testing.assert_array_equal(result[8:32, 8:32], frame[8:32, 8:32])
        frame[-1, 20, 3] = 80
        with self.assertRaises(ValueError):
            hit.cleanup(frame)

    @unittest.skipUnless(SPEC, 'tool not implemented yet')
    def test_hue_projection_does_not_darken_near_white_core_pixels(self):
        rgb = np.array([[[255, 254, 240], [255, 240, 255]]], dtype=np.uint8)
        result = hit.constrain_hue(rgb, 0)
        np.testing.assert_array_equal(result.max(axis=-1), rgb.max(axis=-1))
        self.assertLessEqual(int((rgb.min(axis=-1).astype(int) - result.min(axis=-1)).max()), 1)


if __name__ == '__main__':
    unittest.main()
