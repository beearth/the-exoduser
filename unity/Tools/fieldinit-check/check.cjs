/*
 * C# field/constructor Unity API guard. Run: node unity/Tools/fieldinit-check/check.cjs
 * Tests: node --test unity/Tools/fieldinit-check/check.test.cjs
 * This is a lexical heuristic, not Roslyn: no symbol binding, preprocessor evaluation,
 * reflection, aliases, overload resolution, external assembly inheritance (except known URP
 * ScriptableObject bases) or a full call graph. Delegates/lambdas in initializers can over-report;
 * helper-returned ordinary objects and instance receiver types need manual call-site review.
 * Interpolated strings (including their expressions) are skipped as strings. Review those
 * expressions separately. Partial declarations and local inheritance are joined by type name;
 * helper calls are conservative name matches. Generic/ambiguous names require human review.
 * Runtime/Core is scanned, never written. Safe ordinary classes still appear in --audit.
 * Shader.PropertyToID is exempt: Unity's official Shader.bindings.cs marks it IsThreadSafe.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const nativeTypes = new Set(('MaterialPropertyBlock Material Texture2D Texture3D RenderTexture CustomRenderTexture Mesh GameObject GUIStyle Font AnimationClip AnimationCurve Gradient ComputeBuffer GraphicsBuffer CommandBuffer RectOffset ShaderTagId').split(' '));
const nativeCalls = new Set(['Shader.Find', 'Resources.Load', 'Resources.LoadAll', 'Resources.LoadAsync',
    'ScriptableObject.CreateInstance', 'Object.Instantiate', 'GameObject.CreatePrimitive', 'GameObject.Find',
    'GameObject.FindWithTag', 'GameObject.FindGameObjectsWithTag', 'Sprite.Create', 'Random.Range', 'Random.value']);
const nativeProperties = /^(?:Time\.(?:time|unscaledTime|deltaTime|frameCount|realtimeSinceStartup)|Camera\.main|GUI\.(?:skin|color)|GUIStyle\.none|Texture2D\.(?:whiteTexture|blackTexture|grayTexture|normalTexture)|Screen\.(?:width|height|currentResolution))$/;

function tokenize(text) {
    const out = [];
    let i = 0, line = 1;
    function skip(end) { for (; i < end; i++) if (text[i] === '\n') line++; }
    while (i < text.length) {
        const rest = text.slice(i);
        if (/\s/.test(text[i])) { skip(i + 1); continue; }
        if (rest.startsWith('//')) { const end = text.indexOf('\n', i); skip(end < 0 ? text.length : end); continue; }
        if (rest.startsWith('/*')) { const end = text.indexOf('*/', i + 2); skip(end < 0 ? text.length : end + 2); continue; }
        // Keep one opaque token so string-only arguments do not join adjacent tokens.
        const prefix = /^(?:\$*@?|@\$?)?("{3,}|"|')/.exec(rest);
        if (prefix) {
            const start = i, startLine = line, quote = prefix[1];
            let end = i + prefix[0].length;
            if (quote.length >= 3) {
                const close = text.indexOf(quote, end); end = close < 0 ? text.length : close + quote.length;
            } else {
                const verbatim = prefix[0].includes('@');
                while (end < text.length) {
                    if (!verbatim && text[end] === '\\') { end += 2; continue; }
                    if (text[end] === quote) {
                        if (verbatim && text[end + 1] === quote) { end += 2; continue; }
                        end++; break;
                    }
                    end++;
                }
            }
            skip(end); out.push({ v: '<literal>', pos: start, line: startLine }); continue;
        }
        const match = /^(?:[A-Za-z_][\w]*|=>|\?\?|\?\.|::|==|!=|<=|>=|.)/.exec(rest);
        out.push({ v: match[0], pos: i, line }); i += match[0].length;
    }
    const stack = [], pairs = new Map();
    for (let n = 0; n < out.length; n++) {
        if ('({['.includes(out[n].v)) stack.push(n);
        else if (')}]'.includes(out[n].v)) {
            const open = stack.pop();
            if (open !== undefined) { pairs.set(open, n); pairs.set(n, open); }
        }
    }
    return { tokens: out, pairs };
}

function parse(source) {
    const { tokens: t, pairs } = tokenize(source.text), declarations = [], spaces = [];
    const values = (a, b) => t.slice(a, b).map(x => x.v);
    for (let i = 0; i < t.length; i++) {
        if (t[i].v === 'namespace') {
            let end = i + 1;
            while (end < t.length && !['{', ';'].includes(t[end].v)) end++;
            spaces.push({ name: values(i + 1, end).join(''), open: end, close: t[end]?.v === '{' ? pairs.get(end) : t.length });
        }
        if (!['class', 'struct', 'record'].includes(t[i].v) || !/^[A-Za-z_]\w*$/.test(t[i + 1]?.v || '')) continue;
        let open = i + 2;
        while (open < t.length && !['{', ';'].includes(t[open].v)) open++;
        if (t[open]?.v !== '{' || !pairs.has(open)) continue;
        const parent = declarations.filter(x => x.open < i && x.close > i).at(-1);
        const ns = spaces.filter(x => x.open < i && x.close > i).map(x => x.name).join('.');
        const name = t[i + 1].v, full = [parent?.full || ns, name].filter(Boolean).join('.');
        const header = values(i + 2, open), colon = header.indexOf(':');
        let attrStart = i - 1;
        while (attrStart >= 0 && ![';', '{', '}'].includes(t[attrStart].v)) attrStart--;
        const attrs = values(attrStart + 1, i);
        declarations.push({ name, full, open, close: pairs.get(open), at: i,
            bases: colon < 0 ? [] : header.slice(colon + 1).join('').split(','),
            serializable: attrs.includes('Serializable') || attrs.includes('SerializeReference'),
            members: [], source, t });
    }
    for (const d of declarations) {
        let start = d.open + 1;
        while (start < d.close) {
            if (t[start].v === ';' || t[start].v === '#') { start++; continue; }
            const nested = declarations.find(x => x !== d && x.at >= start && x.open < d.close &&
                !values(start, x.at).some(x => [';', '{', '}'].includes(x)));
            if (nested) { start = nested.close + 1; continue; }
            let n = start, equal = -1, arrow = false, paren = -1;
            for (; n < d.close; n++) {
                const v = t[n].v;
                if (v === '[') { n = pairs.get(n) ?? n; continue; }
                if (v === '(') { if (paren < 0 && equal < 0) paren = n; n = pairs.get(n) ?? n; continue; }
                if (v === '=' && equal < 0) equal = n;
                if (v === '=>') arrow = true;
                if (v === '{') {
                    const close = pairs.get(n);
                    if (close === undefined) break;
                    if (equal >= 0) { n = close; continue; }
                    const head = values(start, n), isFunction = paren >= 0;
                    const name = isFunction ? t[paren - 1]?.v : head.at(-1);
                    // Auto-property initializer executes during construction too.
                    if (!isFunction && t[close + 1]?.v === '=') { equal = close + 1; n = equal; continue; }
                    d.members.push({ kind: isFunction ? (name === d.name ? 'constructor' : 'method') : 'property',
                        name, static: head.includes('static'), start, begin: n + 1, end: close, inferred: head[0] });
                    n = close; break;
                }
                if (v === ';') {
                    const head = values(start, equal < 0 ? n : equal);
                    if (equal >= 0 && !arrow) {
                        const mods = new Set(['public','private','protected','internal','static','readonly','volatile','new','const']);
                        const clean = head.filter(x => !mods.has(x));
                        d.members.push({ kind: 'field', name: head.at(-1), static: head.includes('static'),
                            start, begin: equal + 1, end: n, inferred: clean[0] });
                    } else if (arrow) {
                        const ai = values(start, n).indexOf('=>') + start;
                        d.members.push({ kind: paren >= 0 ? 'method' : 'property', name: paren >= 0 ? t[paren - 1]?.v : head.at(-1),
                            static: head.includes('static'), start, begin: ai + 1, end: n });
                    }
                    break;
                }
            }
            start = n + 1;
        }
    }
    return declarations;
}

function analyze(sources) {
    const declarations = sources.flatMap(parse), types = new Map();
    for (const d of declarations) {
        if (!types.has(d.full)) types.set(d.full, { name: d.name, full: d.full, bases: [], members: [], serializable: false });
        const type = types.get(d.full);
        type.bases.push(...d.bases); type.serializable ||= d.serializable;
        type.members.push(...d.members.map(m => ({ ...m, declaration: d })));
    }
    function resolve(name, owner) {
        if (!name) return null;
        name = name.replace(/^(global::|UnityEngine\.)/, '');
        if (types.has(name)) return types.get(name);
        let prefix = owner.full;
        while (prefix) {
            if (types.has(prefix + '.' + name)) return types.get(prefix + '.' + name);
            prefix = prefix.split('.').slice(0, -1).join('.');
        }
        const matches = [...types.values()].filter(x => x.name === name);
        return matches.length === 1 ? matches[0] : null;
    }
    const roots = new Map();
    for (const type of types.values()) {
        if (type.bases.some(x => /(?:^|\.)(MonoBehaviour|ScriptableObject|ScriptableRendererFeature|FullScreenPassRendererFeature|ScreenSpaceAmbientOcclusion)$/.test(x))) roots.set(type.full, 'Unity component');
        if (type.serializable) roots.set(type.full, 'serialized type');
    }
    // Local inheritance and recursively field-created helper construction.
    let changed = true;
    while (changed) {
        changed = false;
        for (const type of types.values()) {
            if (!roots.has(type.full) && type.bases.some(x => roots.has(resolve(x, type)?.full))) {
                roots.set(type.full, 'inherited Unity/serialized construction'); changed = true;
            }
            if (roots.has(type.full)) for (const base of type.bases) {
                const parent = resolve(base, type);
                if (parent && !roots.has(parent.full)) { roots.set(parent.full, 'base constructor of ' + type.full); changed = true; }
            }
            for (const member of type.members) {
                if (!['field','constructor'].includes(member.kind) || (!member.static && !roots.has(type.full))) continue;
                const tokens = member.declaration.t;
                for (let i = member.begin; i < member.end; i++) if (tokens[i].v === 'new') {
                    let name = tokens[i + 1]?.v;
                    if (name === '(') name = member.inferred;
                    else { let j = i + 2; while (tokens[j]?.v === '.') { name += '.' + tokens[j + 1]?.v; j += 2; } }
                    const target = resolve(name, type);
                    if (target && !roots.has(target.full)) { roots.set(target.full, 'field/constructor-created by ' + type.full); changed = true; }
                }
            }
        }
    }
    function operations(type, member, visited = new Set()) {
        if (visited.has(member)) return [];
        visited = new Set(visited).add(member);
        const t = member.declaration.t, hits = [];
        for (let i = member.begin; i < member.end; i++) {
            const v = t[i].v;
            if (v === 'new') {
                let j = i + 1, name = t[j]?.v;
                if (['(', '{'].includes(name)) name = member.inferred;
                else { j++; while (t[j]?.v === '.') { name = t[j + 1]?.v; j += 2; } }
                if (nativeTypes.has(name) && t[j]?.v !== '[') hits.push({ api: 'new ' + name, token: t[i] });
                // A helper constructed inside a field/factory can hide engine calls in its constructor.
                const target = resolve(name, type);
                if (target) for (const ctor of target.members.filter(x => x.kind === 'constructor')) {
                    for (const h of operations(target, ctor, visited)) hits.push({ ...h, via: target.full + ' constructor' });
                }
            }
            if (t[i + 1]?.v === '.') {
                const api = v + '.' + t[i + 2]?.v;
                if ((nativeCalls.has(api) && ['(', '<'].includes(t[i + 3]?.v)) || nativeProperties.test(api) || api === 'Random.value') hits.push({ api, token: t[i] });
            }
            if (t[i + 1]?.v === '(' && t[i - 1]?.v !== 'new') {
                let owner = type;
                if (t[i - 1]?.v === '.') owner = resolve(t[i - 2]?.v, type);
                if (owner) for (const helper of owner.members.filter(x => x.kind === 'method' && x.name === v)) {
                    for (const h of operations(owner, helper, visited)) hits.push({ ...h, via: owner.full + '.' + v });
                }
            }
            let propertyOwner = type;
            if (t[i - 1]?.v === '.') propertyOwner = resolve(t[i - 2]?.v, type);
            if (propertyOwner) for (const property of propertyOwner.members.filter(x => x.kind === 'property' && x.name === v)) {
                for (const h of operations(propertyOwner, property, visited)) hits.push({ ...h, via: propertyOwner.full + '.' + v });
            }
        }
        return hits;
    }
    const audit = [];
    for (const type of types.values()) for (const member of type.members) {
        if (!['field', 'constructor'].includes(member.kind)) continue;
        const unsafe = member.static || roots.has(type.full);
        for (const hit of operations(type, member)) {
            const d = member.declaration;
            audit.push({ file: d.source.file, line: d.t[member.begin]?.line || 1,
                type: type.full, member: member.name, api: hit.api, kind: member.kind,
                unsafe: !!unsafe, reason: member.static ? 'static construction' : roots.get(type.full) || 'ordinary class: review creation call sites',
                via: hit.via || null });
        }
    }
    // Multiple helper paths may reach the same native operation.
    const unique = [...new Map(audit.map(x => [[x.file,x.line,x.type,x.api,x.via].join(':'), x])).values()];
    return { findings: unique.filter(x => x.unsafe), audit: unique, types: [...types.values()].map(x => ({ name: x.full, reason: roots.get(x.full) || null })) };
}

function readSources(root) {
    const result = [];
    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.isSymbolicLink()) continue;
            const file = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(file);
            else if (entry.name.endsWith('.cs')) result.push({ file: path.relative(root, file).replaceAll('\\', '/'), text: fs.readFileSync(file, 'utf8') });
        }
    }
    walk(root); return result;
}
if (require.main === module) {
    const root = path.resolve(__dirname, '../../Assets/Exoduser/Runtime');
    const sources = readSources(root), result = analyze(sources);
    if (process.argv.includes('--audit')) console.log(JSON.stringify({ files: sources.length, ...result }, null, 2));
    else {
        for (const x of result.findings) console.error(`${x.file}:${x.line} ${x.type}.${x.member}: ${x.api} (${x.reason}${x.via ? '; via ' + x.via : ''})`);
        console.log(`fieldinit-check: ${sources.length} C# files, ${result.types.length} types, ${result.findings.length} unsafe Unity construction calls`);
    }
    process.exitCode = result.findings.length ? 1 : 0;
}
module.exports = { analyze, tokenize, readSources, parse };
