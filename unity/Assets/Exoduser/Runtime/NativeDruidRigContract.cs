namespace Exoduser.UnityPort
{
    // Unity에서 읽은 리그 메타데이터의 실패 닫기 계약. 실제 스키닝/조형 검수는 별도다.
    public static class NativeDruidRigContract
    {
        public struct Skin
        {
            public int Vertices, Indices, BindPoses;
            public string[] BonePaths;
            public bool MatricesValid, Visible;
        }
        public static bool Validate(bool animator, bool avatarValid, bool avatarHuman, Skin[] skins, out string reason)
        {
            if (!animator) { reason = "활성 계층의 Animator 없음"; return false; }
            if (!avatarValid || avatarHuman) { reason = "유효 Generic Avatar 아님"; return false; }
            if (skins == null || skins.Length == 0) { reason = "스키닝 메시 없음"; return false; }
            bool visible = false;
            foreach (var skin in skins)
            {
                if (skin.Vertices <= 0 || skin.Indices <= 0) { reason = "그릴 면이 있는 스키닝 메시 없음"; return false; }
                if (skin.BindPoses <= 0 || skin.BonePaths == null || skin.BindPoses != skin.BonePaths.Length) { reason = "바인드행렬과 본 개수 불일치"; return false; }
                if (!skin.MatricesValid) { reason = "유한하고 가역적인 바인드행렬 아님"; return false; }
                foreach (string path in skin.BonePaths) if (path == null) { reason = "본 누락 또는 Animator 밖의 본"; return false; }
                visible |= skin.Visible;
            }
            reason = visible ? "" : "표시 가능한 스키닝 메시 없음";
            return visible;
        }
    }
}
