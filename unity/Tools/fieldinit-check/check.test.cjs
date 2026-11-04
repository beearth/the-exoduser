'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { analyze } = require('./check.cjs');

test('construction contexts, lexical exclusions, partials, inheritance and helpers', () => {
    const sources = [
        { file: 'Base.cs', text: 'namespace N { class Base : UnityEngine.MonoBehaviour {} partial class Hero : Base {} }' },
        { file: 'Hero.cs', text: `namespace N {
partial class Hero {
    MaterialPropertyBlock block = new UnityEngine.MaterialPropertyBlock();
    Helper helper = new Helper();
    Material made = MakeMaterial();
    static Material MakeMaterial() { return new Material(Shader.Find("x")); }
    void Awake() { var allowed = new Texture2D(2, 2); }
    string s = "new GameObject()";
    string verbatim = @"new Mesh() ""Shader.Find()""";
    string raw = """new GUIStyle()""";
    char quote = '\"';
    // new RenderTexture(1, 1, 0);
    /* static Material fake = new Material(null); */
    static readonly int Id = Shader.PropertyToID("x");
    MaterialPropertyBlock lazy;
    MaterialPropertyBlock Block => lazy ?? (lazy = new MaterialPropertyBlock());
}
class Helper { Nested nested = new Nested(); }
class Nested { MaterialPropertyBlock block = new(); }
class Settings : ScriptableObject { Texture2D tex = new Texture2D(1, 1); }
class Statics { static Material mat; static Statics() { mat = new Material(null); } }
class Ordinary { MaterialPropertyBlock block = new MaterialPropertyBlock(); }
class User : MonoBehaviour { Ordinary value; void Awake() { value = new Ordinary(); } }
class Arrays : MonoBehaviour { Material[] refs = new Material[4]; }
class Explicit : MonoBehaviour { Explicit() { var go = new GameObject(); } }
class Property : MonoBehaviour { Material Value { get; } = new Material(null); }
class Lookup { static object x = Resources.Load<Texture2D>("x"); }
class StaticField { static MaterialPropertyBlock x = new MaterialPropertyBlock(); }
class SerializeHost : MonoBehaviour { [System.Serializable] class Data { Mesh mesh = new Mesh { name = "x" }; } }
}` }
    ];
    const result = analyze(sources);
    const names = result.findings.map(x => x.type + ':' + x.api);
    for (const expected of ['N.Hero:new MaterialPropertyBlock', 'N.Hero:new Material',
        'N.Nested:new MaterialPropertyBlock', 'N.Settings:new Texture2D',
        'N.Statics:new Material', 'N.Explicit:new GameObject', 'N.Property:new Material',
        'N.Lookup:Resources.Load', 'N.StaticField:new MaterialPropertyBlock', 'N.SerializeHost.Data:new Mesh']) {
        assert.ok(names.includes(expected), expected + ' must be rejected; got ' + names.join(', '));
    }
    assert.ok(!names.some(x => /Ordinary|Arrays/.test(x)), 'Awake-only ordinary class and reference arrays are safe');
    assert.ok(!result.findings.some(x => /PropertyToID|GUIStyle|RenderTexture/.test(x.api)), 'comments/strings and exempt API are skipped');
    assert.equal(result.findings.filter(x => x.type === 'N.Hero' && x.api === 'new Texture2D').length, 0);
    assert.ok(result.findings.every(x => x.line > 0 && x.file));
    assert.ok(result.audit.some(x => x.type === 'N.Ordinary' && !x.unsafe));
});

test('all requested native APIs and lookup variants are guarded, including multiline and qualified names', () => {
    for (const name of ['MaterialPropertyBlock','Material','Texture2D','RenderTexture','Mesh','GameObject','GUIStyle','ShaderTagId']) {
        const result = analyze([{ file: name + '.cs', text: `class C : MonoBehaviour {
            UnityEngine.${name} x = new
                UnityEngine.${name}(); }` }]);
        assert.ok(result.findings.some(x => x.api === 'new ' + name), name);
        assert.equal(result.findings[0].line, 2);
    }
    for (const expr of ['Shader.Find("x")', 'Resources.Load<Texture2D>("x")',
        'Resources.LoadAll<Texture2D>("x")', 'Resources.LoadAsync<Texture2D>("x")',
        'GameObject.CreatePrimitive(0)', 'Sprite.Create(null)', 'ScriptableObject.CreateInstance<C>()',
        'Camera.main', 'GUI.skin', 'Texture2D.whiteTexture', 'Time.time', 'Random.Range(0, 1)']) {
        assert.ok(analyze([{ file: 'Api.cs', text: `class C { static object x = ${expr}; }` }]).findings.length, expr);
    }
});

test('helper constructors, inherited initializers, factories and lazy properties used in construction are traced', () => {
    const text = `namespace N {
        class Parent { MaterialPropertyBlock x = new MaterialPropertyBlock(); }
        class Child : Parent { }
        class Factory { public static Material Make() => new Material(null); }
        class Helper { public Helper() { var go = new GameObject(); } }
        class C : MonoBehaviour {
            Child child = new Child(); Helper helper = new Helper();
            Material material = Factory.Make(); Material cached = Factory2.Value;
        }
        class Factory2 { public static Material Value { get { return new Material(null); } } }
        class Feature : UnityEngine.Rendering.Universal.ScriptableRendererFeature { Mesh x = new Mesh(); }
    }`;
    const findings = analyze([{ file: 'Helpers.cs', text }]).findings;
    for (const [type, api] of [['Parent','new MaterialPropertyBlock'],['Helper','new GameObject'],
        ['C','new GameObject'],['C','new Material'],['Feature','new Mesh']]) {
        assert.ok(findings.some(x => x.type === 'N.' + type && x.api === api), type + ':' + api);
    }
    assert.ok(findings.some(x => x.via === 'N.Factory2.Value'));
});

test('opaque literal forms and first-use accessors do not create initializer findings', () => {
    const text = `class C : MonoBehaviour {
        string one = $"new Material() {ignored}";
        string two = $@"Resources.Load() ""new GUIStyle()""";
        string three = @"line1
            Shader.Find()";
        string four = """new GameObject()""";
        // Shader.Find("x")
        /* new Mesh { name = "x" }; */
        MaterialPropertyBlock value;
        MaterialPropertyBlock Block { get { return value ?? (value = new MaterialPropertyBlock()); } }
        static readonly int Id = Shader.PropertyToID("_Opacity");
        void OnEnable() { var style = new GUIStyle(); }
    }`;
    assert.deepEqual(analyze([{ file: 'Safe.cs', text }]).findings, []);
});

test('the Runtime tree has no unsafe Unity construction initializers', () => {
    const { readSources } = require('./check.cjs');
    const path = require('node:path');
    const sources = readSources(path.resolve(__dirname, '../../Assets/Exoduser/Runtime'));
    assert.ok(sources.length > 400, 'scan the complete Runtime, including Core');
    assert.deepEqual(analyze(sources).findings, []);
});
