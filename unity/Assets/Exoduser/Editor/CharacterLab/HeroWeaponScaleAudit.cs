using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEngine;

// RULES-BEGIN
// Unity와 분리된 판정: 1=배율, 2=파지, 4=칼끝, 8=LOCK 비율, 16=측정 불능.
public static class HeroWeaponAuditRules
{
    public static int Assess(float x, float y, float z, float grip, float tip, float sole,
        float length, float height, float ratioMin, float ratioMax)
    {
        foreach (float v in new[] { x, y, z, grip, tip, sole, length, height })
            if (float.IsNaN(v) || float.IsInfinity(v)) return 16;
        if (height <= 0 || length <= 0 || grip < 0) return 16;
        int flags = 0;
        // 부호 반전도 FAIL. 세 축을 곱한 부피 배율로 상쇄하지 않는다.
        if (x < .5f || x > 2 || y < .5f || y > 2 || z < .5f || z > 2) flags |= 1;
        if (grip > .05f + .000001f) flags |= 2;
        if (tip < sole - .2f - .000001f) flags |= 4;
        if (ratioMin > 0 && (length / height < ratioMin * .85f || length / height > ratioMax * 1.15f)) flags |= 8;
        return flags;
    }
}
// RULES-END

namespace Exoduser.Editor.CharacterLab
{
    /// <summary>읽기 전용 rest 포즈 검사. 프리팹/임포터/Animator/Core를 저장하거나 실행하지 않는다.</summary>
    public static class HeroWeaponScaleAudit
    {
        const string Folder = "Assets/Exoduser/Resources/Characters";
        const string Output = "I:/EXODUSER-Storage/codex-takeover/char-socket-audit";
        const string Doc = "docs/engine/UNITY_HERO_WEAPON_SCALE_AUDIT_20261104.md";
        static readonly CultureInfo Inv = CultureInfo.InvariantCulture;

        [Serializable] public sealed class Audit
        {
            public string generatedUtc, unityVersion, sourceSha, method;
            public string pose = "저장된 rest 포즈, 루트 위치/회전 원점, 프리팹 배율 유지, 애니메이션 미샘플링";
            public float fieldScale = .87f;
            public int pass, warn, fail;
            public List<Hero> prefabs = new List<Hero>();
        }
        [Serializable] public sealed class Hero
        {
            public string prefab, status, error;
            public float rigHeightM, soleWorldY, topWorldY, fieldHeightM;
            public List<Weapon> weapons = new List<Weapon>();
            public List<Import> imports = new List<Import>();
        }
        [Serializable] public sealed class Weapon
        {
            public string root, socket, socketBone, status, gripSource, tipSource, lengthSource, lockSource;
            public Vector3 gripWorld, socketWorld, socketBoneWorld, tipWorld, boundsMin, boundsMax;
            public float gripSocketDistanceM, gripBoneDistanceM, lengthM, ratio, ratioMin, ratioMax;
            public int ruleFlags;
            public bool estimatedGrip;
            public List<string> findings = new List<string>();
            public List<Node> children = new List<Node>();
        }
        [Serializable] public sealed class Node
        {
            public string path, meshAsset;
            public Vector3 localPosition, localScale, worldScale, boundsMin, boundsMax;
            public bool hasMesh;
            public float importUnitScale, diagnosticSourceUnitProduct;
        }
        [Serializable] public sealed class Import
        {
            public string path;
            public float globalScale, fileScale;
            public bool useFileScale;
        }
        sealed class Geometry
        {
            public readonly List<Vector3> points = new List<Vector3>();
            public Bounds bounds;
        }

        public static void Run()
        {
            var audit = new Audit {
                generatedUtc = DateTime.UtcNow.ToString("o"), unityVersion = Application.unityVersion,
                sourceSha = Argument("--hero-audit-sha", "미지정"),
                method = "Exoduser.Editor.CharacterLab.HeroWeaponScaleAudit.Run"
            };
            var paths = AssetDatabase.FindAssets("t:Prefab", new[] { Folder })
                .Select(AssetDatabase.GUIDToAssetPath).OrderBy(p => p, StringComparer.Ordinal).ToArray();
            if (paths.Length == 0) throw new InvalidOperationException("영웅 프리팹이 없어 점검 불가");
            foreach (string path in paths)
            {
                var hero = new Hero { prefab = path };
                audit.prefabs.Add(hero);
                GameObject instance = null;
                try
                {
                    instance = PrefabUtility.LoadPrefabContents(path);
                    instance.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
                    Inspect(instance.transform, hero);
                }
                catch (Exception e) { hero.status = "FAIL"; hero.error = e.ToString(); }
                finally { if (instance != null) PrefabUtility.UnloadPrefabContents(instance); }
                if (hero.status == "FAIL") audit.fail++;
                else if (hero.status == "WARN") audit.warn++;
                else audit.pass++;
            }
            Directory.CreateDirectory(Output);
            string json = JsonUtility.ToJson(audit, true);
            string md = Markdown(audit);
            File.WriteAllText(Path.Combine(Output, "audit.json"), json + "\n", new UTF8Encoding(false));
            File.WriteAllText(Path.Combine(Output, "audit.md"), md, new UTF8Encoding(false));
            string projectRoot = Directory.GetParent(Application.dataPath).Parent.FullName;
            File.WriteAllText(Path.Combine(projectRoot, Doc), md, new UTF8Encoding(false));
            // 검사 실행 성공과 자산 판정 FAIL은 구분한다. 자산 FAIL도 결과표를 정상 출력한다.
            Debug.Log("HERO_WEAPON_SCALE_AUDIT_WRITTEN prefabs=" + paths.Length + " PASS=" + audit.pass
                + " WARN=" + audit.warn + " FAIL=" + audit.fail + " output=" + Output);
        }

        static void Inspect(Transform heroRoot, Hero hero)
        {
            var all = heroRoot.GetComponentsInChildren<Transform>(true);
            var bones = new HashSet<Transform>(heroRoot.GetComponentsInChildren<SkinnedMeshRenderer>(true)
                .SelectMany(s => s.bones).Where(t => t != null));
            var roots = new HashSet<Transform>();
            foreach (Transform t in all.Where(IsSocket))
                foreach (Transform child in t)
                    if (HasMesh(child)) roots.Add(child);
            foreach (Transform t in all.Where(t => t != heroRoot && !IsSocket(t) && IsWeaponName(t.name) && HasMesh(t)))
                if (!t.GetComponentsInParent<Transform>(true).Skip(1).Any(p => roots.Contains(p)
                    || (p != heroRoot && !IsSocket(p) && IsWeaponName(p.name)))) roots.Add(t);
            var weaponRoots = roots.Where(t => !roots.Any(p => p != t && t.IsChildOf(p))).ToArray();
            var body = new List<Vector3>();
            foreach (Transform t in all)
            {
                var geo = ReadGeometry(t);
                if (geo == null) continue;
                AddImport(hero.imports, MeshPath(t));
                if (!weaponRoots.Any(w => t == w || t.IsChildOf(w))) body.AddRange(geo.points);
            }
            if (body.Count == 0) throw new InvalidOperationException("무기 제외 본체 메시 누락");
            hero.soleWorldY = body.Min(v => v.y); hero.topWorldY = body.Max(v => v.y);
            hero.rigHeightM = hero.topWorldY - hero.soleWorldY;
            hero.fieldHeightM = hero.rigHeightM * .87f;
            foreach (Transform weapon in weaponRoots.OrderBy(t => PathOf(t, heroRoot), StringComparer.Ordinal))
                hero.weapons.Add(InspectWeapon(weapon, heroRoot, hero, bones));
            if (hero.weapons.Count == 0) { hero.status = "FAIL"; hero.error = "무기/소켓을 식별하지 못함(누락을 PASS 처리하지 않음)"; }
            else hero.status = hero.weapons.Any(w => w.status == "FAIL") ? "FAIL"
                : hero.weapons.Any(w => w.status == "WARN") ? "WARN" : "PASS";
        }

        static Weapon InspectWeapon(Transform root, Transform heroRoot, Hero hero, HashSet<Transform> bones)
        {
            var w = new Weapon { root = PathOf(root, heroRoot) };
            Transform socket = root.GetComponentsInParent<Transform>(true).Skip(1).FirstOrDefault(IsSocket);
            Transform bone = (socket != null ? socket : root).GetComponentsInParent<Transform>(true).Skip(1)
                .FirstOrDefault(bones.Contains);
            w.socket = socket != null ? PathOf(socket, heroRoot) : "미식별";
            w.socketBone = bone != null ? PathOf(bone, heroRoot) : "미식별";
            if (socket != null) w.socketWorld = socket.position;
            if (bone != null) w.socketBoneWorld = bone.position;
            if (socket == null || bone == null) w.findings.Add("FAIL: 무기 소켓/부착 뼈 누락");
            var points = new List<Vector3>();
            bool scaleFail = false;
            foreach (Transform t in root.GetComponentsInChildren<Transform>(true))
            {
                var n = new Node { path = PathOf(t, heroRoot), localPosition = t.localPosition,
                    localScale = t.localScale, worldScale = t.lossyScale, meshAsset = MeshPath(t) };
                var geo = ReadGeometry(t);
                if (geo != null)
                {
                    n.hasMesh = true; n.boundsMin = geo.bounds.min; n.boundsMax = geo.bounds.max;
                    points.AddRange(geo.points);
                    var imp = AddImport(hero.imports, n.meshAsset);
                    if (imp != null)
                    {
                        n.importUnitScale = imp.globalScale * (imp.useFileScale ? imp.fileScale : 1);
                        n.diagnosticSourceUnitProduct = n.worldScale.x * n.importUnitScale;
                    }
                    if (BadScale(n.worldScale)) { scaleFail = true; w.findings.Add("FAIL: 메시 월드 배율 범위 밖 " + n.path + " " + V(n.worldScale)); }
                }
                w.children.Add(n);
            }
            if (points.Count == 0) throw new InvalidOperationException("무기 메시 정점 누락: " + w.root);
            Bounds bounds = BoundsOf(points); w.boundsMin = bounds.min; w.boundsMax = bounds.max;
            var local = points.Select(root.InverseTransformPoint).ToList();
            Bounds localBounds = BoundsOf(local);
            int axis = localBounds.size.x > localBounds.size.y ? (localBounds.size.x > localBounds.size.z ? 0 : 2)
                : (localBounds.size.y > localBounds.size.z ? 1 : 2);
            Vector3 low = localBounds.center, high = localBounds.center;
            low[axis] = localBounds.min[axis]; high[axis] = localBounds.max[axis];
            Vector3 worldLow = root.TransformPoint(low), worldHigh = root.TransformPoint(high);
            w.lengthM = Vector3.Distance(worldLow, worldHigh);
            w.lengthSource = "무기 루트 좌표계 최장축의 실제 정점 투영 전장(월드 AABB 대각선 아님)";
            w.ratio = w.lengthM / hero.rigHeightM;
            var transforms = root.GetComponentsInChildren<Transform>(true);
            Transform grip = transforms.FirstOrDefault(t => Named(t, "GripCenter", "HandleCenter", "Grip_R", "Grip"));
            bool warrior = hero.prefab.EndsWith("/Warrior.prefab", StringComparison.Ordinal)
                && root.name == "Warrior_Greatsword";
            if (grip != null) { w.gripWorld = grip.position; w.gripSource = PathOf(grip, heroRoot); }
            else if (warrior)
            {
                // WeaponImport: 루트는 pommel top. SSOT의 손잡이+폼멜 0.35m 절반을 사용한다.
                // 소켓에 맞춰 값을 역산하지 않는다. 메시 끝에서 손잡이 중앙을 독립 추정한다.
                Vector3 pommel = (worldLow - root.position).sqrMagnitude < (worldHigh - root.position).sqrMagnitude ? worldLow : worldHigh;
                Vector3 other = pommel == worldLow ? worldHigh : worldLow;
                w.gripWorld = pommel + (other - pommel).normalized * (.35f * w.lengthM / 1.60f * .5f);
                w.gripSource = "추정: WeaponImport 폼멜 상단 피벗 + UNITY_CHARACTER_BOARD 손잡이/폼멜 0.35m의 중앙(전장 1.6m 대비 비율 유지)";
                w.estimatedGrip = true;
            }
            else
            {
                w.gripWorld = root.position; w.gripSource = "미확인: 손잡이 중심 마커 없음, 루트 피벗 참고값";
                w.estimatedGrip = true; w.findings.Add("WARN: 손잡이 마커 없어 실제 파지 중심 미확인");
            }
            // 미측정은 -1. JSON에 비표준 NaN 수치를 쓰지 않는다.
            w.gripSocketDistanceM = socket != null ? Vector3.Distance(w.gripWorld, socket.position) : -1;
            w.gripBoneDistanceM = bone != null ? Vector3.Distance(w.gripWorld, bone.position) : -1;
            Transform tip = transforms.FirstOrDefault(t => Named(t, "BladeTip", "WeaponTip", "Tip"));
            if (tip != null) { w.tipWorld = tip.position; w.tipSource = PathOf(tip, heroRoot); }
            else
            {
                // 최장축 끝 중 손잡이에서 먼 쪽의 실제 정점. 휘어진 날은 마커가 있어야 정확하다.
                bool highTip = (worldHigh - w.gripWorld).sqrMagnitude > (worldLow - w.gripWorld).sqrMagnitude;
                int index = 0;
                for (int i = 1; i < local.Count; i++)
                    if (highTip ? local[i][axis] > local[index][axis] : local[i][axis] < local[index][axis]) index = i;
                w.tipWorld = points[index]; w.tipSource = "최장축 반대 끝 실제 정점(직선 날 기준)";
            }
            string name = (hero.prefab + "/" + root.name).ToLowerInvariant();
            string weaponName = root.name.ToLowerInvariant();
            if (warrior || name.Contains("greatsword") && name.Contains("warrior"))
            {
                w.ratioMin = .8f; w.ratioMax = 1;
                w.lockSource = "WARRIOR_DESIGN_LOCK 수치 없음 → 브리프의 키아트 대체비 0.8~1.0. SSOT 전장 1.60m 참고";
            }
            else if (name.Contains("silvertail") && (weaponName.Contains("rotary") || weaponName.Contains("blade")
                || weaponName.Contains("tail")) && !weaponName.Contains("dagger"))
            {
                w.ratioMin = w.ratioMax = 1.830f / hero.rigHeightM;
                w.lockSource = "SILVERTAIL_LOCKED_SPEC_v1_2 [A] 전장 1830mm / 실측 리그 키";
            }
            else w.lockSource = "해당 무기 수치 LOCK 없음 → 길이비 WARN 생략(단검 수치 문서 검색 포함)";
            Vector3 scale = w.children.First(n => n.hasMesh).worldScale;
            w.ruleFlags = HeroWeaponAuditRules.Assess(scale.x, scale.y, scale.z, w.gripSocketDistanceM,
                w.tipWorld.y, hero.soleWorldY, w.lengthM, hero.rigHeightM, w.ratioMin, w.ratioMax);
            if (scaleFail) w.ruleFlags |= 1;
            if ((w.ruleFlags & 2) != 0) w.findings.Add("FAIL: 손잡이 중심↔소켓 0.05m 초과");
            if ((w.ruleFlags & 4) != 0) w.findings.Add("FAIL: rest 칼끝이 발바닥보다 0.2m 초과 아래");
            if ((w.ruleFlags & 8) != 0) w.findings.Add("WARN: LOCK 길이비 ±15% 밖");
            if ((w.ruleFlags & 16) != 0) w.findings.Add("FAIL: 필수 측정값 누락/비정상");
            w.status = (w.ruleFlags & ~8) != 0 || socket == null || bone == null ? "FAIL"
                : (w.ruleFlags & 8) != 0 || w.estimatedGrip ? "WARN" : "PASS";
            return w;
        }

        static bool Named(Transform t, params string[] names) { return names.Any(n => t.name.Equals(n, StringComparison.OrdinalIgnoreCase)); }
        static bool IsSocket(Transform t)
        {
            string n = t.name.ToLowerInvariant();
            return n.Contains("socket") && (n.Contains("weapon") || n.Contains("sword") || n.Contains("blade") || n.Contains("gun"))
                || n == "rotaryhub" || n == "rotary_hub";
        }
        static bool IsWeaponName(string name)
        {
            string n = name.ToLowerInvariant();
            return new[] { "weapon", "sword", "blade", "dagger", "gun", "rifle", "spear", "staff", "bow" }.Any(n.Contains);
        }
        static bool HasMesh(Transform t) { return t.GetComponentsInChildren<MeshFilter>(true).Any(m => m.sharedMesh != null)
            || t.GetComponentsInChildren<SkinnedMeshRenderer>(true).Any(m => m.sharedMesh != null); }
        static bool BadScale(Vector3 s) { return new[] { s.x, s.y, s.z }.Any(v => float.IsNaN(v) || float.IsInfinity(v) || v < .5f || v > 2); }
        static string PathOf(Transform t, Transform root) { return root.name + "/" + AnimationUtility.CalculateTransformPath(t, root); }
        static string MeshPath(Transform t)
        {
            var mf = t.GetComponent<MeshFilter>(); var skin = t.GetComponent<SkinnedMeshRenderer>();
            Mesh mesh = mf != null ? mf.sharedMesh : skin != null ? skin.sharedMesh : null;
            return mesh != null ? AssetDatabase.GetAssetPath(mesh) : "";
        }
        static Import AddImport(List<Import> list, string path)
        {
            if (string.IsNullOrEmpty(path)) return null;
            Import found = list.FirstOrDefault(i => i.path == path); if (found != null) return found;
            var importer = AssetImporter.GetAtPath(path) as ModelImporter; if (importer == null) return null;
            found = new Import { path = path, globalScale = importer.globalScale, useFileScale = importer.useFileScale,
                fileScale = importer.fileScale };
            list.Add(found); return found;
        }
        static Geometry ReadGeometry(Transform t)
        {
            var mf = t.GetComponent<MeshFilter>(); var skin = t.GetComponent<SkinnedMeshRenderer>();
            Mesh mesh = null; bool baked = false;
            if (skin != null && skin.sharedMesh != null) { mesh = new Mesh(); skin.BakeMesh(mesh, false); baked = true; }
            else if (mf != null) mesh = mf.sharedMesh;
            if (mesh == null) return null;
            try
            {
                var g = new Geometry();
                // Editor에서는 non-readable 임포트 메시도 정점 접근 가능. 임포터 isReadable을 바꾸지 않는다.
                foreach (Vector3 v in mesh.vertices) g.points.Add(t.localToWorldMatrix.MultiplyPoint3x4(v));
                if (g.points.Count == 0) return null;
                g.bounds = BoundsOf(g.points); return g;
            }
            finally { if (baked) UnityEngine.Object.DestroyImmediate(mesh); }
        }
        static Bounds BoundsOf(List<Vector3> points)
        {
            var bounds = new Bounds(points[0], Vector3.zero);
            for (int i = 1; i < points.Count; i++) bounds.Encapsulate(points[i]);
            return bounds;
        }
        static string Argument(string key, string fallback)
        {
            string[] args = Environment.GetCommandLineArgs(); int i = Array.IndexOf(args, key);
            return i >= 0 && i + 1 < args.Length ? args[i + 1] : fallback;
        }
        static string F(float f) { return float.IsNaN(f) || float.IsInfinity(f) ? "미측정" : f.ToString("0.######", Inv); }
        static string V(Vector3 v) { return "(" + F(v.x) + ", " + F(v.y) + ", " + F(v.z) + ")"; }

        static string Markdown(Audit a)
        {
            var b = new StringBuilder();
            b.AppendLine("# 영웅 무기 소켓·배율 전수 점검 — 2026-11-04");
            b.AppendLine();
            b.AppendLine("- 측정 기준 커밋: `" + a.sourceSha + "`, Unity `" + a.unityVersion + "`, UTC `" + a.generatedUtc + "`.");
            b.AppendLine("- Editor 배치 전용. Player 0회. 저장된 rest 포즈 실측이며 실게임/애니메이션/디자인 판정은 미검수.");
            b.AppendLine("- " + a.pose + ". 키·무기·거리 표는 화면 배율 적용 전 m. 1-1 표시 키는 리그 실측 ×0.87.");
            b.AppendLine("- PASS/WARN/FAIL은 브리프 정적 규칙이다. 정상 관찰 이력이 있는 legacy도 규칙을 완화해 PASS로 바꾸지 않는다.");
            b.AppendLine();
            b.AppendLine("| 프리팹 | 판정 | 리그 키 m | 1-1 키 u | 발바닥 Y m | 무기 수 |");
            b.AppendLine("|---|---|---:|---:|---:|---:|");
            foreach (Hero h in a.prefabs) b.AppendLine("| " + h.prefab + " | " + h.status + " | " + F(h.rigHeightM) + " | " + F(h.fieldHeightM) + " | " + F(h.soleWorldY) + " | " + h.weapons.Count + " |");
            foreach (Hero h in a.prefabs)
            {
                b.AppendLine(); b.AppendLine("## " + Path.GetFileName(h.prefab)); b.AppendLine();
                if (!string.IsNullOrEmpty(h.error)) b.AppendLine("검사 오류: " + h.error);
                b.AppendLine("| 무기 루트 | 소켓 | 부착 뼈 | 판정 | 길이 m | 길이/키 | 칼끝 Y m | 칼끝−발바닥 m | 손잡이↔소켓 m |");
                b.AppendLine("|---|---|---|---|---:|---:|---:|---:|---:|");
                foreach (Weapon w in h.weapons)
                {
                    b.AppendLine("| " + w.root + " | " + w.socket + " | " + w.socketBone + " | " + w.status + " | " + F(w.lengthM) + " | " + F(w.ratio) + " | " + F(w.tipWorld.y) + " | " + F(w.tipWorld.y - h.soleWorldY) + " | " + (w.gripSocketDistanceM < 0 ? "미측정" : F(w.gripSocketDistanceM)) + " |");
                    b.AppendLine();
                    b.AppendLine("- 손잡이: " + w.gripSource + "; 월드 " + V(w.gripWorld) + ". 추정값은 실제 손가락 접촉 검증을 대신하지 않음.");
                    b.AppendLine("- 소켓 월드 " + V(w.socketWorld) + "; 부착 뼈 월드 " + V(w.socketBoneWorld)
                        + "; 손잡이↔부착 뼈 " + F(w.gripBoneDistanceM) + "m(판정 거리는 소켓 기준).");
                    b.AppendLine("- 칼끝: " + w.tipSource + "; 월드 " + V(w.tipWorld) + ".");
                    b.AppendLine("- 전장: " + w.lengthSource + ". LOCK: " + w.lockSource + ".");
                    b.AppendLine("- 무기 월드 bounds 최저/최고: " + V(w.boundsMin) + " / " + V(w.boundsMax) + ".");
                    foreach (string finding in w.findings) b.AppendLine("- " + finding);
                    b.AppendLine();
                    b.AppendLine("| 자식 경로(루트 포함) | 로컬 위치 | 로컬 배율 | 월드 배율(부모 곱) | 메시 bounds min | 메시 bounds max | FBX |");
                    b.AppendLine("|---|---|---|---|---|---|---|");
                    foreach (Node n in w.children) b.AppendLine("| " + n.path + " | " + V(n.localPosition) + " | " + V(n.localScale) + " | " + V(n.worldScale) + " | " + (n.hasMesh ? V(n.boundsMin) : "—") + " | " + (n.hasMesh ? V(n.boundsMax) : "—") + " | " + n.meshAsset + " |");
                }
                b.AppendLine(); b.AppendLine("| FBX | globalScale | useFileScale | fileScale |");
                b.AppendLine("|---|---:|---|---:|");
                foreach (Import i in h.imports) b.AppendLine("| " + i.path + " | " + F(i.globalScale) + " | " + i.useFileScale + " | " + F(i.fileScale) + " |");
            }
            b.AppendLine(); b.AppendLine("## 판정 규칙과 한계"); b.AppendLine();
            b.AppendLine("- 무기 메시 `lossyScale` 각 축이 0.5~2.0 밖이면 FAIL. 파지거리 >0.05m, 칼끝 <발바닥−0.2m이면 FAIL. 부동소수점 경계 오차 허용 0.000001m. 필수 데이터 누락도 FAIL.");
            b.AppendLine("- LOCK 허용범위는 [비 하한×0.85, 비 상한×1.15]. 전사 0.8~1.0은 WARRIOR_DESIGN_LOCK에 숫자가 없어 브리프가 지정한 대체값. 별도 SSOT에는 전장 1.60m/손잡이+폼멜 0.35m가 있음.");
            b.AppendLine("- 실버테일 Rotary Blade 1.830m는 SILVERTAIL_LOCKED_SPEC_v1_2 [A]. 단검은 docs 검색에서 수치 LOCK을 찾지 못해 길이비 WARN 생략. 임포트 코드의 제작값은 LOCK으로 승격하지 않음.");
            b.AppendLine("- legacy cm 메시의 로컬 배율100은 실제 100m 무기를 뜻하지 않는다. 임포트 단위가 정점에 반영된 상태이므로 월드 정점 전장/bounds를 함께 봐야 한다. 원시 배율 FAIL은 정상 관찰과 양립할 수 있으며, 이 규칙만으로 임포트 재수정을 권고하지 않는다.");
            b.AppendLine("- JSON의 diagnosticSourceUnitProduct=월드 X배율×globalScale×(useFileScale?fileScale:1)은 단위 보상 참고값이다. 이미 임포트된 정점에 다시 곱해 길이·bounds를 계산하지 않는다.");
            b.AppendLine("- JSON 거리 -1은 소켓/뼈 미식별로 인한 미측정이다. 소켓 미식별은 FAIL이며 원점으로 대신 판정하지 않는다.");
            b.AppendLine("- 손잡이 명시 마커가 없으면 WARN 이상(전사는 문서 기반 중앙 추정); 접힌/곡선 검은 tip 마커와 전개 상태 검증이 추가로 필요. 미식별/통합 본체 무기는 FAIL로 남기며 자동 PASS하지 않는다.");
            b.AppendLine("- 다음 관문: 캐릭터 총괄이 원시 배율 규칙의 legacy 오탐 여부를 검토하고, 손잡이 마커·애니메이션 파지·Mac 실게임 1x로 확인. 모듈 전사 브랜치와 런타임은 이 레인에서 수정하지 않음.");
            return b.ToString().Replace("\r\n", "\n");
        }
    }
}
