import re
import unittest
from pathlib import Path


class ShotCountLv10Test(unittest.TestCase):
    def test_lv10_shot_count_for_grenade_family(self):
        text = Path("game.html").read_text(encoding="utf-8")
        self.assertIsNotNone(
            re.search(r"const _tsCnt=slv>=10\?5:3;", text),
            "thunder shot lv10 count rule missing",
        )
        self.assertIsNotNone(
            re.search(r"const _bsCnt=slv>=10\?5:3;", text),
            "blast shot lv10 count rule missing",
        )
        self.assertIsNotNone(
            re.search(r"const _gsCnt=slv>=10\?5:3;", text),
            "grenade shot lv10 count rule missing",
        )


if __name__ == "__main__":
    unittest.main()
