"""Explicit 03:20 socket permissions. Scarf/head is never rest-exempt."""
SOCKET_ROWS=(
 ("W04","W05","흉갑/복부 겹판"),("W05","W14","복부/벨트 안쪽 접합"),
 ("W06","W08","왼 견갑/상완 소켓"),("W07","W09","오른 견갑/상완 소켓"),
 ("W08","W10","왼 상완/팔꿈치 컵"),("W09","W11","오른 상완/팔꿈치 컵"),
 ("W10","W12","왼 팔꿈치/아대"),("W11","W13","오른 팔꿈치/아대"),
 ("W12","W12","왼 아대/손등"),("W13","W13","오른 아대/손등"),
 ("W15","W17","태싯/왼 허벅지 겹판"),("W15","W18","태싯/오른 허벅지 겹판"),
 ("W17","W19","왼 허벅지/무릎 컵"),("W18","W20","오른 허벅지/무릎 컵"),
 ("W19","W21","왼 정강이/장화 접합"),("W20","W22","오른 정강이/장화 접합"))
SOCKETS={frozenset((a,b)) for a,b,_ in SOCKET_ROWS}

def weapon_pair_required(a,b):
    if "W25" not in (a,b):return True
    other=b if a=="W25" else a
    return other in {"W04","W05","W15","W23"}

def decide(a,b,rest_pairs,posed_pairs,rest_depth_mm,new_depth_mm,absolute_depth_mm):
    exempt=frozenset((a,b)) in SOCKETS
    fresh=set(posed_pairs)-set(rest_pairs)
    tested=fresh if exempt else set(posed_pairs)
    if not tested and (exempt or absolute_depth_mm in (0,None)):
        status="PASS_REST_SOCKET" if exempt and posed_pairs else "PASS_NO_CONTACT"
        depth=0.
    else:
        source=new_depth_mm if exempt else absolute_depth_mm
        if source is None:
            depth=None;status="UNVERIFIED_OPEN_SURFACE"
        else:
            depth=max(0,source-(rest_depth_mm or 0)) if exempt else source
            status="FAIL" if depth>3 else "PASS_MEASURED_DEPTH"
    return {"restExempt":exempt,"restTrianglePairs":len(rest_pairs),"posedTrianglePairs":len(posed_pairs),
            "newTrianglePairs":len(fresh),"testedTrianglePairs":len(tested),"gateDepthMm":depth,
            "status":status,"depthLimitMm":3}
