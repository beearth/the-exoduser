"""No key/network: guards for paid modular generation."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


class GuardTests(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location("meshy_part", Path(__file__).with_name("meshy_part.py"))
        self.api = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.api)

    def test_existing_foreign_lock_is_never_replaced_or_deleted(self):
        with tempfile.TemporaryDirectory() as folder:
            p = Path(folder) / "CALL.lock"
            p.write_text("foreign-owner", encoding="utf-8")
            with self.assertRaises(FileExistsError):
                with self.api.CallLock(p):
                    self.fail("foreign lock entered")
            self.assertEqual(p.read_text(encoding="utf-8"), "foreign-owner")

    def test_lock_releases_only_its_own_token(self):
        with tempfile.TemporaryDirectory() as folder:
            p = Path(folder) / "CALL.lock"
            with self.api.CallLock(p):
                p.write_text("replacement-owner", encoding="utf-8")
            self.assertEqual(p.read_text(encoding="utf-8"), "replacement-owner")

    def test_ambiguous_post_intent_prevents_second_submission(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "cuirass").mkdir()
            (root / "cuirass" / "state.json").write_text(json.dumps({"intent": True, "estimatedCredits": 30}), encoding="utf-8")
            with self.assertRaisesRegex(RuntimeError, "already"):
                self.api.preflight(root, "cuirass", 30)

    def test_failed_tasks_still_count_against_cap(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "old").mkdir()
            (root / "old" / "state.json").write_text(json.dumps({"status": "FAILED", "estimatedCredits": 480}), encoding="utf-8")
            with self.assertRaisesRegex(RuntimeError, "500"):
                self.api.preflight(root, "cuirass", 30)

    def test_body_is_static_part_with_requested_triangle_budget(self):
        with tempfile.TemporaryDirectory() as folder:
            paths = [Path(folder) / (name + ".png") for name in ("front", "side", "back")]
            for p in paths:
                p.write_bytes(b"example")
            body = self.api.build_body(paths, 2500, "black iron")
            self.assertEqual(body["target_polycount"], 2500)
            self.assertEqual(body["topology"], "triangle")
            self.assertNotIn("pose_mode", body)
            self.assertNotIn("input_task_id", body)
            self.assertEqual(len(body["image_urls"]), 3)
            self.assertEqual(body["target_formats"], ["glb", "fbx"])

    def test_review_revision_keeps_failed_charge_and_forbids_third_attempt(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            part = root / "pauldron"
            part.mkdir()
            state = {"taskId": "known-first", "status": "SUCCEEDED", "reviewStatus": "FAIL_SHAPE",
                     "estimatedCredits": 480, "actualCredits": 480, "downloaded": True}
            (part / "state.json").write_text(json.dumps(state), encoding="utf-8")
            self.api.retire_failed_review(root, "pauldron", "known-first")
            self.assertFalse((part / "state.json").exists())
            with self.assertRaisesRegex(RuntimeError, "500"):
                self.api.preflight(root, "pauldron", 30)
            (part / "state.json").write_text(json.dumps(state), encoding="utf-8")
            with self.assertRaisesRegex(RuntimeError, "two"):
                self.api.retire_failed_review(root, "pauldron", "known-first")


if __name__ == "__main__":
    unittest.main()
