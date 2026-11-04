#!/usr/bin/env python3
"""Import the druid earth texture sheets (I:/EXODUSER-Storage/vfx-earth) into the Unity project.

  python tools/vfx/import_druid_earth.py [--check-only] [--no-table]

* copies the sheets listed in SHEETS to unity/Assets/Exoduser/Resources/Art/vfx/boss/earth/ (+ .meta, wrap Clamp, Bilinear, no mips, new stable GUID)
* writes Runtime/Vfx/DruidEarthSheetTable.cs: per-frame visible width / centre of earth_dust_burst (alpha >= 48 of 255 bounding box, fraction of the 256 px cell)
* --check-only: no writes, compares size + sha256 of every destination file against the source and the table file against a fresh measure; exit 1 on any difference.
Never read from stdin; run from a file with </dev/null.
"""
import hashlib, os, sys
from PIL import Image
import numpy as np

SRC = 'I:/EXODUSER-Storage/vfx-earth'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DST = os.path.join(ROOT, 'unity/Assets/Exoduser/Resources/Art/vfx/boss/earth')
TABLE = os.path.join(ROOT, 'unity/Assets/Exoduser/Runtime/Vfx/DruidEarthSheetTable.cs')
SHEETS = ['earth_dust_burst.png', 'debris_chunks.png',
          'ground_crack_radial.png', 'ground_crack_radial_v2.png', 'ground_crack_radial_v3.png', 'ground_crack_radial_v4.png',
          'ground_gouge_linear.png', 'ground_gouge_linear_v2.png', 'ground_gouge_linear_v3.png',
          'whip_smear.png', 'whip_smear_v2.png', 'whip_smear_v3.png']
ALPHA_EDGE = 48

META = """fileFormatVersion: 2
guid: {guid}
TextureImporter:
  internalIDToNameTable: []
  externalObjects: {{}}
  serializedVersion: 13
  mipmaps:
    mipMapMode: 0
    enableMipMap: 0
    sRGBTexture: 1
    linearTexture: 0
    fadeOut: 0
    borderMipMap: 0
    mipMapsPreserveCoverage: 0
    alphaTestReferenceValue: 0.5
    mipMapFadeDistanceStart: 1
    mipMapFadeDistanceEnd: 3
  bumpmap:
    convertToNormalMap: 0
    externalNormalMap: 0
    heightScale: 0.25
    normalMapFilter: 0
    flipGreenChannel: 0
  isReadable: 0
  streamingMipmaps: 0
  streamingMipmapsPriority: 0
  vTOnly: 0
  ignoreMipmapLimit: 0
  grayScaleToAlpha: 0
  generateCubemap: 6
  cubemapConvolution: 0
  seamlessCubemap: 0
  textureFormat: 1
  maxTextureSize: 8192
  textureSettings:
    serializedVersion: 2
    filterMode: 1
    aniso: 1
    mipBias: 0
    wrapU: 1
    wrapV: 1
    wrapW: 1
  nPOTScale: 0
  lightmap: 0
  compressionQuality: 50
  spriteMode: 0
  spriteExtrude: 1
  spriteMeshType: 1
  alignment: 0
  spritePivot: {{x: 0.5, y: 0.5}}
  spritePixelsToUnits: 100
  spriteBorder: {{x: 0, y: 0, z: 0, w: 0}}
  spriteGenerateFallbackPhysicsShape: 1
  alphaUsage: 1
  alphaIsTransparency: 1
  spriteTessellationMethod: 0
  spriteTessellationDetail: -1
  spriteGeometrySubdivision: -1
  textureType: 0
  textureShape: 1
  singleChannelComponent: 0
  flipbookRows: 1
  flipbookColumns: 1
  maxTextureSizeSet: 0
  compressionQualitySet: 0
  textureFormatSet: 0
  ignorePngGamma: 0
  applyGammaDecoding: 1
  swizzle: 50462976
  cookieLightType: 2
  platformSettings:
  - serializedVersion: 4
    buildTarget: DefaultTexturePlatform
    maxTextureSize: 8192
    resizeAlgorithm: 0
    textureFormat: -1
    textureCompression: 0
    compressionQuality: 50
    crunchedCompression: 0
    allowsAlphaSplitting: 0
    overridden: 0
    ignorePlatformSupport: 0
    androidETC2FallbackOverride: 0
    forceMaximumCompressionQuality_BC6H_BC7: 0
  - serializedVersion: 4
    buildTarget: Standalone
    maxTextureSize: 8192
    resizeAlgorithm: 0
    textureFormat: -1
    textureCompression: 0
    compressionQuality: 50
    crunchedCompression: 0
    allowsAlphaSplitting: 0
    overridden: 0
    ignorePlatformSupport: 0
    androidETC2FallbackOverride: 0
    forceMaximumCompressionQuality_BC6H_BC7: 0
  - serializedVersion: 4
    buildTarget: WebGL
    maxTextureSize: 8192
    resizeAlgorithm: 0
    textureFormat: -1
    textureCompression: 0
    compressionQuality: 50
    crunchedCompression: 0
    allowsAlphaSplitting: 0
    overridden: 0
    ignorePlatformSupport: 0
    androidETC2FallbackOverride: 0
    forceMaximumCompressionQuality_BC6H_BC7: 0
  spriteSheet:
    serializedVersion: 2
    sprites: []
    outline: []
    customData:
    physicsShape: []
    bones: []
    spriteID:
    internalID: 0
    vertices: []
    indices:
    edges: []
    weights: []
    secondaryTextures: []
    spriteCustomMetadata:
      entries: []
    nameFileIdTable: {{}}
  mipmapLimitGroupName:
  pSDRemoveMatte: 0
  userData:
  assetBundleName:
  assetBundleVariant:
"""
FOLDER_META = "fileFormatVersion: 2\nguid: {guid}\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {{}}\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n"


def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        h.update(f.read())
    return h.hexdigest()


def guid(name):
    return hashlib.md5(('exoduser-druid-earth/' + name).encode('utf-8')).hexdigest()


def measure():
    """earth_dust_burst: 6 cols x 4 rows x 256 px, row-major from the top. Returns [(width_fraction, centre_offset_fraction, top_fraction, bottom_fraction)] per frame."""
    im = np.array(Image.open(os.path.join(SRC, 'earth_dust_burst.png')).convert('RGBA'))
    out = []
    for i in range(24):
        r, c = divmod(i, 6)
        a = im[r * 256:(r + 1) * 256, c * 256:(c + 1) * 256, 3]
        ys, xs = np.nonzero(a >= ALPHA_EDGE)
        if len(xs) == 0:
            out.append((0.0, 0.0, 0.5, 0.5)); continue
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        out.append(((x1 - x0) / 256.0, ((x0 + x1) / 2.0 - 128) / 256.0, y0 / 256.0, y1 / 256.0))
    return out


def extent(name):
    im = np.array(Image.open(os.path.join(SRC, name)).convert('RGBA'))
    h, w = im.shape[:2]
    ys, xs = np.nonzero(im[:, :, 3] >= ALPHA_EDGE)
    return w, h, xs.min(), xs.max() + 1, ys.min(), ys.max() + 1, np.sqrt(((xs + .5 - w / 2.0) ** 2 + (ys + .5 - h / 2.0) ** 2)).max()


def table_text():
    m = measure()
    crack = [extent(n) for n in SHEETS if n.startswith('ground_crack')]
    gouge = [extent(n) for n in SHEETS if n.startswith('ground_gouge')]
    smear = [extent(n) for n in SHEETS if n.startswith('whip_smear')]
    lines = ['// GENERATED by tools/vfx/import_druid_earth.py (do not edit). Visible alpha (>= %d/255) bounding box of each earth_dust_burst frame (6x4 cells of 256 px, row-major from the top),' % ALPHA_EDGE,
             '// as a fraction of the cell: width, horizontal centre offset from the cell centre (+ = right), top and bottom edge measured from the cell top. Pure data, no Unity types.',
             'namespace Exoduser.UnityPort.Vfx', '{', '    public static class DruidEarthSheetTable', '    {',
             '        public const int Cols = 6, Rows = 4, Frames = 24, Cell = 256;',
             '        public static readonly double[] Width = { ' + ', '.join('%.5f' % v[0] for v in m) + ' };',
             '        public static readonly double[] CenterX = { ' + ', '.join('%.5f' % v[1] for v in m) + ' };',
             '        public static readonly double[] Top = { ' + ', '.join('%.5f' % v[2] for v in m) + ' };',
             '        public static readonly double[] Bottom = { ' + ', '.join('%.5f' % v[3] for v in m) + ' };',
             '        // ground_crack_radial[, _v2.._v4] (1024 px squares): farthest visible pixel from the image centre, in px (the decal is scaled so this reaches the Core hit radius)',
             '        public static readonly double[] CrackMaxR = { ' + ', '.join('%.2f' % e[6] for e in crack) + ' };',
             '        public const int CrackSheetPx = 1024;',
             '        // ground_gouge_linear[, _v2, _v3] (1024 x 256): visible x range in px; whip_smear[, _v2, _v3] (1024 x 128): visible x range in px (dense head at the left end)',
             '        public static readonly double[] GougeX0 = { ' + ', '.join('%d' % e[2] for e in gouge) + ' };',
             '        public static readonly double[] GougeX1 = { ' + ', '.join('%d' % e[3] for e in gouge) + ' };',
             '        public const int GougeSheetW = 1024, GougeSheetH = 256;',
             '        public static readonly double[] SmearX0 = { ' + ', '.join('%d' % e[2] for e in smear) + ' };',
             '        public static readonly double[] SmearX1 = { ' + ', '.join('%d' % e[3] for e in smear) + ' };',
             '        public const int SmearSheetW = 1024, SmearSheetH = 128;',
             '    }', '}', '']
    return '\n'.join(lines)


def main():
    check = '--check-only' in sys.argv
    bad = 0
    if not check:
        os.makedirs(DST, exist_ok=True)
        fm = DST + '.meta'
        if not os.path.exists(fm):
            with open(fm, 'w', newline='\n') as f:
                f.write(FOLDER_META.format(guid=guid('folder')))
    for n in SHEETS:
        s, d = os.path.join(SRC, n), os.path.join(DST, n)
        if not os.path.exists(s):
            print('MISSING source', s); bad += 1; continue
        if check:
            ok = os.path.exists(d) and os.path.getsize(d) == os.path.getsize(s) and sha(d) == sha(s) and os.path.exists(d + '.meta')
            print(('OK   ' if ok else 'DIFF ') + n, os.path.getsize(s), sha(s)[:12]); bad += 0 if ok else 1
        else:
            with open(s, 'rb') as f, open(d, 'wb') as g:
                g.write(f.read())
            if not os.path.exists(d + '.meta'):
                with open(d + '.meta', 'w', newline='\n') as f:
                    f.write(META.format(guid=guid(n)))
            print('copied', n, os.path.getsize(s), sha(s)[:12])
    if '--no-table' not in sys.argv:
        text = table_text()
        if check:
            cur = open(TABLE, encoding='utf-8').read() if os.path.exists(TABLE) else ''
            ok = cur.replace('\r\n', '\n') == text
            print(('OK   ' if ok else 'DIFF ') + 'DruidEarthSheetTable.cs'); bad += 0 if ok else 1
        else:
            with open(TABLE, 'w', encoding='utf-8', newline='\n') as f:
                f.write(text)
            if not os.path.exists(TABLE + '.meta'):
                with open(TABLE + '.meta', 'w', newline='\n') as f:
                    f.write('fileFormatVersion: 2\nguid: %s\nMonoImporter:\n  externalObjects: {}\n  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: 0\n  icon: {instanceID: 0}\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n' % guid('table'))
            print('wrote table')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
