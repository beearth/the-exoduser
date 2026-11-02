"""Synthetic pixel contracts for the title compositor (no media encode)."""
import importlib.util
from pathlib import Path
import unittest
import numpy as np

spec = importlib.util.spec_from_file_location('clarity', Path(__file__).parents[1] / 'tools/build-title-clarity.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class Contracts(unittest.TestCase):
    def test_static_pixels_are_original_and_motion_is_video(self):
        still = np.full((24, 32, 3), 91, np.uint8)
        video = np.full_like(still, 151)
        alpha = np.zeros((24, 32), np.float32)
        alpha[:, 16:] = 1
        out = module.composite(still, video, alpha)
        np.testing.assert_array_equal(out[:, :16], still[:, :16])
        np.testing.assert_array_equal(out[:, 16:], video[:, 16:])

    def test_motion_map_ignores_constant_detail_and_detects_temporal_changes(self):
        frames = np.full((5, 48, 64, 3), 90, np.uint8)
        for n in range(5):
            frames[n, 20:35, 30:46] += n * 15
        motion = module.motion_map(frames)
        self.assertGreater(float(motion[25:30, 34:40].mean()), 10)
        self.assertEqual(float(motion[:5, :5].max()), 0)

    def test_corrected_clouds_never_get_subtractive_black_spots(self):
        still = np.full((24, 32, 3), 40, np.uint8)
        current = np.zeros_like(still, dtype=np.float32)
        reference = np.full_like(current, 180)
        result = module.temporal_light(still, current, reference, np.ones((24,32),np.float32))
        self.assertGreaterEqual(int(result.min()), 32)
        unchanged = module.temporal_light(still, reference, reference, np.ones((24,32),np.float32))
        np.testing.assert_array_equal(unchanged, still)


if __name__ == '__main__':
    unittest.main()
