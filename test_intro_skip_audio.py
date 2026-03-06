import re
import unittest
from pathlib import Path


class IntroSkipAudioTest(unittest.TestCase):
    def test_intro_skip_has_video_stop_helper_and_usage(self):
        text = Path("index.html").read_text(encoding="utf-8")
        self.assertIsNotNone(re.search(r"function\s+stopMediaVideo\s*\(", text))
        self.assertIsNotNone(re.search(r"stopMediaVideo\(\s*vid\s*\)", text))
        self.assertIsNotNone(re.search(r"stopMediaVideo\(\s*\$\('cinVideo'\)\s*\)", text))

    def test_chapter_gate_has_skip_handler(self):
        text = Path("index.html").read_text(encoding="utf-8")
        self.assertIsNotNone(re.search(r"function\s+skipGate\s*\(", text))
        self.assertIsNotNone(re.search(r"gate\.addEventListener\('click',\s*skipGate\)", text))


if __name__ == "__main__":
    unittest.main()
