"""Canonical G0 25 groups; latest brief's collapsed W labels are aliases only."""
GROUPS = {
 "W01": ("Head", [], "Head"), "W02": ("Hair", [], "Head"),
 "W03": ("Underbody", [9,28,43], "Hips"),
 "W04": ("Cuirass", [17,34,42,52,59,96,97,98], "Spine01"),
 "W05": ("Abdomen", [14,33,47], "Spine02"),
 "W06": ("Pauldron_Left", [8], "Modular_Pauldron_Left"),
 "W07": ("Pauldron_Right", [7], "Modular_Pauldron_Right"),
 "W08": ("UpperArm_Left", [44,71], "LeftArm"),
 "W09": ("UpperArm_Right", [40,76], "RightArm"),
 "W10": ("Elbow_Left", [36,57,60,84], "LeftForeArm"),
 "W11": ("Elbow_Right", [41,51], "RightForeArm"),
 "W12": ("Gauntlet_Left", [26,46,58,63,72,74,87,99,105], "LeftForeArm"),
 "W13": ("Gauntlet_Right", [23,45,77,80,83,86,88,92,94,104,106], "RightForeArm"),
 "W14": ("Belt", [22,25,35,39,49,56,64,68,91,102], "Hips"),
 "W15": ("Tassets", [13,18,50,53,55], "Hips"),
 "W16": ("Apron", [29,31,100], "Hips"),
 "W17": ("Thigh_Left", [10], "LeftUpLeg"), "W18": ("Thigh_Right", [11], "RightUpLeg"),
 "W19": ("KneeGreave_Left", [4,20,21,66,81,93], "LeftLeg"),
 "W20": ("KneeGreave_Right", [6,12,16,67,75], "RightLeg"),
 "W21": ("Boot_Left", [15,19,73,103], "LeftFoot"),
 "W22": ("Boot_Right", [30,37,65], "RightFoot"),
 "W23": ("Scarf", [24,38,54,62,69,70,79,85,89,90,95,101], "neck"),
 "W24": ("Cape", [0,1,2,5,32,48,61,78,82], "Spine"),
 "W25": ("Greatsword", [], "hand_r_weapon"),
}
LATEST_ALIASES = {"W12 belt":"W14", "W13 tassets":"W15", "W14 apron":"W16",
 "W15 thighs":"W17/W18", "W16 knees/W17 shins":"W19/W20", "W18 boots":"W21/W22",
 "W19 scarf":"W23", "W20 cape":"W24"}
HAND_IDS = {45,46,63,72,74,80,83,86,87,94,104,106}
TASSETS = {18:"fl",50:"fr",13:"sl",53:"sr",55:"b"}
SOFT_GROUPS = {"W02","W03","W16","W23","W24"}

def validate():
    values = [i for _, ids, _ in GROUPS.values() for i in ids]
    assert len(GROUPS) == 25
    assert len(values) == len(set(values)) == 105
    assert set(values) == set(range(107))-{3,27}, "Every A piece must be mapped or explicitly replaced by B"

validate()
