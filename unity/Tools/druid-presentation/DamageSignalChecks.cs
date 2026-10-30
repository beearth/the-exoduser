// 실제 public HurtEnemy → ApplyEnemyDamage 경로. Unity 실행/가짜 피해 함수 없음.
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using Exoduser.UnityPort.Core;

static class DamageSignalChecks
{
    static readonly JsonSerializerOptions Json = new JsonSerializerOptions { IncludeFields = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping };
    static readonly List<object> Checks = new List<object>(), Cases = new List<object>();
    static int failures;
    static void Check(bool ok, string name) { Checks.Add(new { 이름 = name, 통과 = ok }); if (!ok) failures++; }
    static void Set(object target, string field, object value) => target.GetType().GetField(field, BindingFlags.Instance | BindingFlags.NonPublic).SetValue(target, value);

    // Core 객체의 public/private 필드, 컬렉션의 논리 내용, 참조 관계를 정규화한다.
    // Feedback만 별도 비교하며 delegate는 메서드/캡처 객체를 기록한다. CLR 컬렉션의 내부 용량/해시 버킷은 게임 상태가 아니다.
    sealed class Snapshot
    {
        readonly Dictionary<object, int> seen = new Dictionary<object, int>(ReferenceEqualityComparer.Instance);
        public object Read(object value)
        {
            if (value == null) return null;
            Type type = value.GetType();
            if (type.IsPrimitive || value is string || value is decimal || type.IsEnum) return value;
            if (seen.TryGetValue(value, out int old)) return new { 참조 = old };
            int id = seen.Count + 1; seen.Add(value, id);
            var result = new SortedDictionary<string, object> { ["참조id"] = id, ["종류"] = type.FullName };
            if (value is Delegate callback)
            {
                result["호출목록"] = callback.GetInvocationList().Select(d => new { 메서드 = d.Method.DeclaringType.FullName + "." + d.Method.Name, 대상 = Read(d.Target) }).ToArray();
            }
            else if (value is IDictionary map)
            {
                var entries = new List<object>();
                foreach (DictionaryEntry pair in map) entries.Add(new { 키 = Read(pair.Key), 값 = Read(pair.Value) });
                result["항목"] = entries;
            }
            else if (value is IEnumerable sequence)
            {
                var entries = new List<object>(); foreach (object item in sequence) entries.Add(Read(item)); result["항목"] = entries;
            }
            else
            {
                var fields = new List<FieldInfo>();
                for (Type t = type; t != null; t = t.BaseType)
                    fields.AddRange(t.GetFields(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly));
                foreach (var field in fields.OrderBy(f => f.DeclaringType.FullName + "." + f.Name, StringComparer.Ordinal))
                {
                    if (value is Simulation && field.Name == "Feedback") continue;
                    result[field.DeclaringType.FullName + "." + field.Name] = Read(field.GetValue(value));
                }
            }
            return result;
        }
    }
    static string State(Simulation s) => JsonSerializer.Serialize(new Snapshot().Read(s), Json);

    static void Run(string name, double chance = 100, bool dot = false, bool lethal = false, string targetKind = "등록본체", bool arena = true, int stage = 0, bool zero = false, bool shieldOnly = false, int hits = 1, bool ticks = false, bool cooldown = false, bool seedOnly = false, bool immune = false)
    {
        var config = SourceStarterFixture.CreateBasicWeapon(); config.EnemyAiEnabled = false; config.StageIndex = stage;
        config.PlayerCriticalChance = chance; config.PlayerCriticalMultiplier = zero ? 0 : 1.5;
        var sim = new Simulation(config, 0x20261031); sim.NowMs = () => 1793372400000d;
        uint stream = 0x12345678; var draws = new List<double>();
        if (!seedOnly) sim.Random01 = () => { stream = unchecked(stream * 1664525u + 1013904223u); double n = stream / 4294967296.0; draws.Add(n); return n; };
        sim.AttachDruidBoss(); sim.Stage.InArena = arena;
        EnemyState registered = sim.Stage.BossSpawners[stage](sim, 80, 100), enemy = registered;
        if (targetKind == "일반적" || targetKind == "등록외보스")
        {
            enemy = sim.SpawnNormalEnemy(180, 100); enemy.IsBoss = targetKind == "등록외보스";
        }
        if (targetKind == "Druid없음") sim.Druid = null;
        if (targetKind == "보스아님") enemy.IsBoss = false;
        enemy.Hp = enemy.MaxHp = lethal ? 10 : 1000000; enemy.Shield = enemy.MaxShield = shieldOnly ? 10000 : 0;
        enemy.ReviveIframes = immune ? 5 : 0; enemy.RevPts = enemy.MaxRevPts = 0; enemy.Web._revPts = enemy.Web._maxRevPts = 0;
        if (cooldown) { Set(sim, "critSfxCd", 7d); Set(sim, "hitSfxCd", 5); }
        sim.Feedback.Clear();
        var frames = new List<object>();
        bool allowed = chance == 100 && !dot && !zero && !immune && stage == 0 && arena && (targetKind == "등록본체");
        for (int i = 0; i < hits; i++)
        {
            if (ticks) sim.Tick(0, 0, 80, 100, false, false);
            var priorFeedback = sim.Feedback.ToArray(); sim.Feedback.Clear();
            string before = State(sim); int drawStart = draws.Count; bool alive = enemy.Alive && enemy.Hp > 0;
            float x = enemy.X, y = enemy.Y, radius = enemy.Radius; int etype = enemy.Etype;
            sim.HurtEnemy(enemy, 100, .25f, dot);
            var feedback = sim.Feedback.ToArray();
            var crit = feedback.Where(f => f.Kind == FeedbackKind.EnemyCrit).ToArray();
            int expected = allowed && alive ? 1 : 0;
            Check(crit.Length == expected, name + "/피해호출" + i + " 실제 치명 관찰신호 " + expected + "개");
            foreach (var e in crit)
                Check(e.Tick == sim.TickCount && e.IsBoss && e.Etype == etype && e.X == x && e.Y == y && e.Size == radius && e.SampleKey == "crit_heavy" && Math.Abs(e.Volume - .45f) < 1e-7 && e.Rate == 1 && e.QueuedRate == 1,
                    name + "/현재틱·본체좌표·반경·고정음량·고정rate");
            if (zero && !immune) Check(sim.LastHitDamage == 0, name + "/실제 총피해0 (최소피해 처리 뒤 치명배율0)");
            if (shieldOnly) Check(enemy.Hp == enemy.MaxHp && sim.LastHitDamage > 0, name + "/HP직접손실0·쉴드흡수피해양성");
            if (lethal && i == 0) Check(enemy.Hp <= 0, name + "/실제 마지막 피해가 사망 경로 진입");
            if (cooldown) Check((double)typeof(Simulation).GetField("critSfxCd", BindingFlags.Instance | BindingFlags.NonPublic).GetValue(sim) == 7
                && (int)typeof(Simulation).GetField("hitSfxCd", BindingFlags.Instance | BindingFlags.NonPublic).GetValue(sim) == 5, name + "/기존 crit7·hit5 쿨다운 불변");
            frames.Add(new { 호출 = i, 기대신호수 = expected, 전상태 = before, 후상태 = State(sim), 이전틱피드백 = priorFeedback, 피드백 = feedback,
                호출난수 = draws.Skip(drawStart).ToArray(), 전체난수 = draws.ToArray(), sim.LastHitDamage, enemy.Hp, enemy.Shield, enemy.Alive });
            sim.Feedback.Clear(); // 실제 consumer처럼 이번 호출의 모든 사건을 한 번 배출한 뒤 다음 입력 진행
        }
        Cases.Add(new { 이름 = name, 프레임 = frames });
    }
    static int Main(string[] args)
    {
        Console.OutputEncoding = new System.Text.UTF8Encoding(false);
        Run("치명확률100"); Run("치명확률0", chance: 0); Run("DOT", dot: true); Run("총피해0", zero: true);
        Run("일반적", targetKind: "일반적"); Run("stage3드루이드", stage: 3); Run("등록외보스", targetKind: "등록외보스");
        Run("아레나밖", arena: false); Run("등록Druid없음", targetKind: "Druid없음"); Run("등록객체지만보스아님", targetKind: "보스아님");
        Run("마지막치명타", lethal: true, hits: 2); Run("마지막일반타", chance: 0, lethal: true, hits: 2);
        Run("쉴드만피해", shieldOnly: true); Run("무적조기반환", immune: true);
        Run("같은틱연속치명", hits: 2); Run("연속틱치명", hits: 3, ticks: true);
        Run("기존쿨다운유지", cooldown: true, hits: 2); Run("내부seedRNG치명", seedOnly: true, hits: 3, ticks: true);
        File.WriteAllText(args[0], JsonSerializer.Serialize(new { 범위 = "실제Core public 피해경로·관찰신호·반사전체상태. Unity 미실행", 검사수 = Checks.Count, 실패수 = failures, 검사 = Checks, 사례 = Cases }, Json));
        Console.WriteLine("실제피해경로 " + Checks.Count + "검사 / " + failures + "실패");
        foreach (var row in Checks) Console.WriteLine(JsonSerializer.Serialize(row));
        return failures == 0 ? 0 : 2;
    }
}
