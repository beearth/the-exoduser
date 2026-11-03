"""Rest/socket permission regression tests, independent of production geometry."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).parent))
assert (Path(__file__).parent/"rest_contact_policy.py").is_file(),"rest/socket policy is not implemented"
from rest_contact_policy import decide,weapon_pair_required,SOCKETS
r={(1,2)}
m=decide("W06","W08",r,r,50,50,50)
assert m["status"]=="PASS_REST_SOCKET" and m["testedTrianglePairs"]==0,m
m=decide("W06","W08",r,r|{(3,4)},.4,3.8,3.8)
assert m["status"]=="FAIL" and abs(m["gateDepthMm"]-3.4)<1e-8,m
m=decide("W23","W01",r,r,27.7,27.7,27.7)
assert m["status"]=="FAIL" and not m["restExempt"],m
m=decide("W23","W01",r,set(),27.7,0,0)
assert m["status"]=="PASS_NO_CONTACT",m
m=decide("W24","W03",set(),{(0,1)},None,None,None)
assert m["status"]=="UNVERIFIED_OPEN_SURFACE" and m["gateDepthMm"] is None,m
assert not weapon_pair_required("W25","W12") and not weapon_pair_required("W25","W13")
assert weapon_pair_required("W25","W23") and weapon_pair_required("W25","W04")
assert not weapon_pair_required("W25","W01")
assert frozenset(("W23","W01")) not in SOCKETS
print("REST_CONTACT_POLICY_PASS: socket baseline/new depth/no scarf exemption/unknown not zero/sword scope")
