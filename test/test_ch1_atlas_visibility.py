"""All 40 monster bodies must exist in each of the eight runtime directions."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from repair_ch1_empty_atlas_cells import scan

class AtlasVisibility(unittest.TestCase):
    def test_no_transparent_monster_cells(self):
        self.assertEqual(scan(),[])

if __name__=='__main__':unittest.main()
