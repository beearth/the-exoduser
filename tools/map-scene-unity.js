/* Read only the supported Unity single-sprite .meta fields; this is not a YAML loader.
 * Source images, texture processing, atlas packing, physics and scene placement stay external.
 */
(function (root) {
  'use strict';
  const LIMIT = 256000;
  const NUMERIC = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
  const ROOT_KEYS = new Set(['fileFormatVersion', 'guid', 'timeCreated', 'licenseType', 'TextureImporter']);
  const FIELDS = new Set(['textureType', 'spriteMode', 'spritePixelsToUnits', 'alignment', 'spritePivot', 'textureShape', 'spriteBorder']);
  // Unity enum order, expressed in the editor's downward-positive image coordinates.
  const PIVOTS = [[.5,.5],[0,0],[.5,0],[1,0],[0,.5],[1,.5],[0,1],[.5,1],[1,1]];
  function reject(message) { throw new Error('Unity 메타: ' + message); }
  function utf8Size(text) {
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c <= 0x7f) bytes++;
      else if (c <= 0x7ff) bytes += 2;
      else if (c >= 0xd800 && c <= 0xdbff && text.charCodeAt(i+1) >= 0xdc00 && text.charCodeAt(i+1) <= 0xdfff) { bytes += 4; i++; }
      else bytes += 3;
      if (bytes > LIMIT) reject('UTF-8 256000바이트 이하만 지원합니다');
    }
    return bytes;
  }
  function lineContent(line) {
    // A quote inside a YAML plain scalar is ordinary text. Only a scalar's
    // first token (or a token in an actual flow collection) starts quoting.
    const prefix = /^[ \t]*(?:-\s+)?[A-Za-z_][A-Za-z0-9_]*\s*:/.exec(line) || /^[ \t]*-\s+/.exec(line);
    const valueOffset = prefix ? prefix[0].length : -1;
    let quote = null, scalarStart = false, flowDepth = 0;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (i === valueOffset) scalarStart = true;
      if (quote) {
        if (quote === '"' && ch === '\\') { i++; continue; }
        if (ch === quote) {
          if (quote === "'" && line[i+1] === "'") { i++; continue; }
          quote = null;
        }
      } else {
        if (ch === '#' && (!i || /\s/.test(line[i-1]))) return line.slice(0,i).trimEnd();
        if ('&*!'.includes(ch) && (!i || /[\s:[{,]/.test(line[i-1]))) reject('YAML 앵커·별칭·태그는 지원하지 않습니다');
        if (valueOffset < 0 || i < valueOffset || /\s/.test(ch)) continue;
        if (scalarStart) {
          scalarStart = false;
          if (ch === '"' || ch === "'") quote = ch;
          else if (ch === '[' || ch === '{') { flowDepth++; scalarStart = true; }
        } else if (flowDepth) {
          if (ch === ':' || ch === ',') scalarStart = true;
          else if (ch === ']' || ch === '}') flowDepth--;
        }
      }
    }
    if (quote) reject('닫히지 않은 문자열은 지원하지 않습니다');
    return line.trimEnd();
  }
  function numeric(value, key, lo, hi, integer = false) {
    if (!NUMERIC.test(value)) reject(key + ' 숫자 형식이 올바르지 않습니다');
    const n = Number(value);
    if (!Number.isFinite(n) || n < lo || n > hi || integer && !Number.isInteger(n)) reject(key + ' 수치 범위가 올바르지 않습니다');
    return n === 0 ? 0 : n;
  }
  function vector(value, key, components) {
    if (!/^\{[^{}]*\}$/.test(value)) reject(key + '는 한 줄의 {좌표: 숫자} 형식이어야 합니다');
    const values = new Map();
    for (const pair of value.slice(1,-1).split(',')) {
      const match = /^\s*([xyzw])\s*:\s*(.*?)\s*$/.exec(pair);
      if (!match || !components.includes(match[1])) reject(key + ' 좌표 형식이 올바르지 않습니다');
      if (values.has(match[1])) reject(key + ' 좌표가 중복되었습니다');
      values.set(match[1], numeric(match[2], key + '.' + match[1], 0, 1));
    }
    if (values.size !== components.length) reject(key + ' 좌표가 누락되었습니다');
    return Object.fromEntries(values);
  }
  function parseMeta(text) {
    if (typeof text !== 'string') reject('텍스트만 입력할 수 있습니다');
    utf8Size(text);
    const input = text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\uFEFF]/.test(input)) reject('지원하지 않는 제어 문자가 있습니다');
    const roots = new Map(), fields = new Map(), directKeys = new Set();
    let importer = false;
    for (const rawLine of input.split('\n')) {
      const line = lineContent(rawLine);
      if (!line.trim()) continue;
      if (/^[ \t]*\t/.test(line)) reject('들여쓰기는 공백만 사용해야 합니다');
      const content = line.trimStart();
      if (/^(?:%|---(?:\s|$)|\.\.\.(?:\s|$)|<<\s*:)/.test(content)) reject('YAML 문서·병합·Prefab/패키지 형식은 지원하지 않습니다');
      const indent = line.length - content.length;
      const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/.exec(content);
      if (indent === 0) {
        if (!match || !ROOT_KEYS.has(match[1])) reject('단일 TextureImporter 메타 파일만 지원합니다');
        const [,key,value] = match;
        if (roots.has(key)) reject(key + ' 루트가 중복되었습니다');
        roots.set(key,value); importer = key === 'TextureImporter';
        if (importer && value !== '') reject('TextureImporter 루트는 일반 매핑이어야 합니다');
        continue;
      }
      // Never accept a lookalike field from spriteSheet, another importer or a YAML list.
      const fake = /^(?:-\s*)?([A-Za-z_][A-Za-z0-9_]*)\s*:/.exec(content);
      if (fake && (fake[1] === 'TextureImporter' || fake[1] === 'fileFormatVersion')) reject(fake[1] + '는 루트에 한 번만 있어야 합니다');
      if (fake && FIELDS.has(fake[1]) && (indent !== 2 || !importer || !match)) reject(fake[1] + '는 TextureImporter 바로 아래 2공백 필드여야 합니다');
      if (!importer) reject('TextureImporter 밖의 중첩 필드는 지원하지 않습니다');
      if (indent === 2 && match) {
        const [,key,value] = match;
        if (directKeys.has(key)) reject(key + ' 필드가 중복되었습니다');
        directKeys.add(key);
        if (FIELDS.has(key)) fields.set(key,value);
      }
    }
    if (!roots.has('fileFormatVersion') || numeric(roots.get('fileFormatVersion'), 'fileFormatVersion', 2, 2, true) !== 2) reject('fileFormatVersion 2가 필요합니다');
    if (!roots.has('TextureImporter')) reject('TextureImporter 루트가 필요합니다');
    for (const key of ['textureType','spriteMode','spritePixelsToUnits','alignment']) if (!fields.has(key)) reject(key + ' 필드가 누락되었습니다');
    numeric(fields.get('textureType'),'textureType',8,8,true);
    numeric(fields.get('spriteMode'),'spriteMode',1,1,true);
    const pixelsPerUnit = numeric(fields.get('spritePixelsToUnits'),'spritePixelsToUnits',.001,1000000);
    const alignment = numeric(fields.get('alignment'),'alignment',0,9,true);
    if (fields.has('textureShape')) numeric(fields.get('textureShape'),'textureShape',1,1,true);
    if (fields.has('spriteBorder')) {
      const border = vector(fields.get('spriteBorder'),'spriteBorder',['x','y','z','w']);
      if (Object.values(border).some(n => n !== 0)) reject('9-slice spriteBorder는 지원하지 않습니다');
    }
    const custom = fields.has('spritePivot') ? vector(fields.get('spritePivot'),'spritePivot',['x','y']) : null;
    if (alignment === 9 && !custom) reject('Custom alignment 9에는 spritePivot이 필요합니다');
    const [pivotX,pivotY] = alignment === 9 ? [custom.x,1-custom.y] : PIVOTS[alignment];
    return { pixelsPerUnit,pivotX,pivotY };
  }
  const api = Object.freeze({ parseMeta });
  root.MapSceneUnity = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
