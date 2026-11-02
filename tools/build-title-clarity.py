"""Registered 4K still + automatically accumulated Kling motion, no paid generation.

Uses the approved close-final loop (already crossfaded), never crop32.
Static pixels remain the still. Clouds/mist use temporal luminance/color changes
over the corrected still, avoiding reintroducing the old straight sky seam.
Hair/cape/water use registered video pixels within a fixed feathered motion mask.
All work is single writer, bounded CPU, software encoding, and streamed to disk.
"""
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

cv2.setNumThreads(2)
if sys.platform == 'win32':
    import ctypes
    ctypes.windll.kernel32.SetPriorityClass(ctypes.windll.kernel32.GetCurrentProcess(), 0x4000)
FLAGS = {'creationflags': subprocess.CREATE_NO_WINDOW} if hasattr(subprocess, 'CREATE_NO_WINDOW') else {}


def read(path):
    image = cv2.imdecode(np.fromfile(str(path), np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f'Cannot read {path}')
    return image


def write(path, image):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imencode(path.suffix, image)[1].tofile(str(path))


def composite(still, video, alpha):
    return np.clip(np.rint(still.astype(np.float32) * (1-alpha[..., None]) +
                          video.astype(np.float32) * alpha[..., None]), 0, 255).astype(np.uint8)


def motion_map(frames):
    frames = np.asarray(frames, np.float32)
    return np.mean(np.abs(np.diff(frames, axis=0)), axis=(0, 3))


def temporal_light(still, current, reference, alpha):
    # Bounded multiplicative transfer preserves the corrected cloud structure and
    # dark tones even when old/new clouds have different shapes. No black clipping.
    ratio=np.clip((current+24)/(reference+24),.8,1.2)
    return np.clip(np.rint(still.astype(np.float32)*(1+(ratio-1)*alpha[...,None])),0,255).astype(np.uint8)


def polygon(shape, points, feather=0):
    h, w = shape
    out = np.zeros((h, w), np.float32)
    pts = np.rint(np.array(points) * [w, h]).astype(np.int32)
    cv2.fillPoly(out, [pts], 1)
    if feather:
        # Feather inward: protected geometry outside this shape remains original.
        out = np.minimum(cv2.distanceTransform((out > 0).astype(np.uint8), cv2.DIST_L2, 5) / feather, 1)
    return out


def register(still, frame):
    """RANSAC similarity on static foreground only, never clouds/hair/water."""
    a = cv2.resize(still, (1018, 509), interpolation=cv2.INTER_AREA)
    b = cv2.resize(frame, (1018, 509), interpolation=cv2.INTER_AREA)
    mask = np.zeros((509, 1018), np.uint8)
    mask[230:375, :540] = 255  # keep, bridges, left rock
    mask[390:, 590:] = 255    # footing and foreground cliff
    sift = cv2.SIFT_create(nfeatures=5000)
    ka, da = sift.detectAndCompute(cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), mask)
    kb, db = sift.detectAndCompute(cv2.cvtColor(b, cv2.COLOR_BGR2GRAY), mask)
    pairs = cv2.BFMatcher().knnMatch(db, da, k=2)
    good = [p for p, q in pairs if p.distance < .7*q.distance]
    src = np.float32([kb[p.queryIdx].pt for p in good])
    dst = np.float32([ka[p.trainIdx].pt for p in good])
    affine, inliers = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=1.3)
    if affine is None or int(inliers.sum()) < 30:
        raise RuntimeError('Insufficient static registration matches')
    err = np.linalg.norm(cv2.transform(src[None], affine)[0]-dst, axis=1)[inliers[:, 0] > 0]
    return affine, dict(matches=len(good), inliers=int(inliers.sum()),
                        medianError4K=float(np.median(err)*3840/1018),
                        scale=float(np.linalg.norm(affine[0, :2])), matrix1018=affine.tolist())


def masks(still, motion):
    h, w = motion.shape
    # Authored semantic envelopes only constrain the automatic motion map.
    # Every moving pixel must also have measured temporal change.
    sky = polygon((h,w), [(0,0),(1,0),(1,.54),(.91,.52),(.85,.55),(.75,.54),
                          (.65,.51),(.60,.48),(.56,.44),(.54,.41),(.52,.43),
                          (.50,.42),(.46,.38),(.44,.36),(.42,.29),(.40,.33),
                          (.38,.28),(.36,.21),(.34,.25),(.32,.19),(.30,.22),
                          (.28,.17),(.26,.21),(.245,.10),(.23,.17),(.21,.18),
                          (.19,.12),(.17,.19),(.14,.23),(.11,.20),(0,.29)], 12)
    river = polygon((h,w), [(0,.845),(.15,.774),(.27,.745),(.39,.637),(.49,.594),
                            (.56,.598),(.60,.631),(.583,.690),(.58,.81),(.51,1),(0,1)], 10)
    near = polygon((h,w), [(.424,.326),(.437,.327),(.449,.599),(.429,.599)], 3)
    far = polygon((h,w), [(.512,.384),(.522,.385),(.529,.599),(.513,.599)], 3)
    hair = polygon((h,w), [(.689,.251),(.709,.251),(.731,.306),(.795,.329),
                           (.882,.358),(.884,.472),(.798,.481),(.741,.433),(.712,.369)], 8)
    cape = polygon((h,w), [(.697,.474),(.735,.464),(.807,.505),(.894,.556),
                           (.900,.690),(.837,.729),(.765,.697),(.724,.624)], 8)
    mist = np.zeros((h,w),np.float32)
    # Soft fog bands, temporal residual only, retain sharp masonry underneath.
    for x,y,rx,ry in [(.17,.69,.20,.07),(.37,.735,.15,.045),(.79,.70,.14,.06)]:
        yy,xx=np.mgrid[:h,:w];d=((xx/w-x)/rx)**2+((yy/h-y)/ry)**2
        mist=np.maximum(mist,np.exp(-d*3).astype(np.float32)*.75)
    smoothed = cv2.GaussianBlur(motion, (0,0), 2)
    measured = np.clip((smoothed-.12)/.55,0,1)
    measured = cv2.GaussianBlur(measured,(0,0),2)
    direct = np.maximum.reduce([river,near,far,hair,cape])*measured
    residual = np.maximum(sky,mist)*measured*(1-direct)
    # Face, torso, armor, legs, sword, rock and tree trunks are never video.
    body = polygon((h,w),[(.678,.270),(.693,.272),(.702,.325),(.710,.352),
                           (.715,.402),(.717,.467),(.726,.524),(.732,.583),
                           (.742,.680),(.750,.740),(.700,.750),(.687,.702),
                           (.683,.751),(.644,.750),(.644,.718),(.665,.680),
                           (.669,.590),(.655,.535),(.648,.497),(.652,.446),
                           (.662,.385),(.663,.325)])
    sword = polygon((h,w),[(.701,.481),(.713,.473),(.787,.757),(.775,.766)])
    tree = np.zeros((h,w), np.float32)
    small=cv2.resize(still,(w,h),interpolation=cv2.INTER_AREA)
    dark=(np.max(small,axis=2)<43).astype(np.uint8)
    dark[:,:int(w*.90)]=0
    tree=cv2.dilate(dark, np.ones((5,5),np.uint8)).astype(np.float32)
    protect=np.maximum.reduce([body,sword,tree])
    protect=cv2.GaussianBlur(cv2.dilate(protect,np.ones((5,5),np.uint8)),(0,0),1)
    direct*=1-protect
    residual*=1-protect
    return np.clip(direct,0,1),np.clip(residual,0,1)


def sha(path):
    with Path(path).open('rb') as f:
        return hashlib.file_digest(f,'sha256').hexdigest()


def prepare(args):
    out=args.work
    out.mkdir(parents=True,exist_ok=True)
    fixed=args.fixed
    still_path=fixed if fixed.exists() else args.still
    still=read(still_path)
    if still.shape[:2]!=(1920,3840):
        raise ValueError('Still must be 3840x1920')
    capture=cv2.VideoCapture(str(args.source),cv2.CAP_FFMPEG,[cv2.CAP_PROP_N_THREADS,2])
    fps=capture.get(cv2.CAP_PROP_FPS)
    ok,reference=capture.read()
    if not ok: raise ValueError('No video frames')
    affine,receipt=register(still,reference)
    frames=[]
    while ok:
        small=cv2.resize(reference,(1018,509),interpolation=cv2.INTER_AREA)
        frames.append(cv2.warpAffine(small,affine,(1018,509),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REFLECT))
        ok,reference=capture.read()
    capture.release()
    motion=motion_map(frames)
    direct,residual=masks(still,motion)
    for name,im in [('motion-map',np.minimum(motion*45,255).astype(np.uint8)),
                    ('direct-mask',np.rint(direct*255).astype(np.uint8)),
                    ('residual-mask',np.rint(residual*255).astype(np.uint8))]:
        write(out/(name+'.png'),im)
    np.savez_compressed(out/'prepared.npz',affine=affine,direct=direct,residual=residual)
    write(out/'selected-still.png',still)
    receipt.update(source=str(args.source),sourceSHA256=sha(args.source),still=str(still_path),
                   stillSHA256=sha(still_path),fixedUsed=still_path==fixed,fps=fps,frames=len(frames),
                   size=[3840,1920],audio=False,maskFrames=len(frames),
                   directCoverage=float((direct>.05).mean()),residualCoverage=float((residual>.05).mean()))
    (out/'prepare.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
    print(json.dumps(receipt),flush=True)


def render(args):
    out=args.work
    meta=json.loads((out/'prepare.json').read_text(encoding='utf-8'))
    # Another authorized run owns the fixed still. Recheck at the actual composite
    # boundary, not merely when this process prepared its first masks.
    if args.fixed.exists() and sha(args.fixed)!=meta['stillSHA256']:
        prepare(args)
        meta=json.loads((out/'prepare.json').read_text(encoding='utf-8'))
    prepared=np.load(out/'prepared.npz')
    still=read(out/'selected-still.png')
    affine=prepared['affine'].copy()
    affine[:,2]*=3840/1018
    direct=cv2.resize(prepared['direct'],(3840,1920),interpolation=cv2.INTER_LINEAR)
    residual=cv2.resize(prepared['residual'],(3840,1920),interpolation=cv2.INTER_LINEAR)
    cap=cv2.VideoCapture(str(args.source),cv2.CAP_FFMPEG,[cv2.CAP_PROP_N_THREADS,2])
    fps=meta['fps']
    args.output.parent.mkdir(parents=True,exist_ok=True)
    enc=subprocess.Popen([args.ffmpeg,'-hide_banner','-y','-v','warning','-f','rawvideo',
                          '-pix_fmt','bgr24','-s','3840x1920','-r',str(fps),'-i','-',
                          '-an','-c:v','libx264','-threads','2','-preset','medium','-crf','16',
                          '-maxrate','40M','-bufsize','80M','-pix_fmt','yuv420p','-g','48',
                          '-movflags','+faststart',str(args.output)],stdin=subprocess.PIPE,**FLAGS)
    base=None
    count=0
    try:
        while True:
            ok,frame=cap.read()
            if not ok: break
            frame=cv2.resize(frame,(3840,1920),interpolation=cv2.INTER_LANCZOS4)
            aligned=cv2.warpAffine(frame,affine,(3840,1920),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REFLECT)
            # Match video to still's slowly varying color field, avoiding visible seams.
            if base is None:
                base=cv2.GaussianBlur(aligned,(0,0),5).astype(np.float32)
                color=cv2.resize(cv2.GaussianBlur(cv2.resize(still,(480,240)),(0,0),5).astype(np.float32)-
                                 cv2.GaussianBlur(cv2.resize(aligned,(480,240)),(0,0),5).astype(np.float32),
                                 (3840,1920),interpolation=cv2.INTER_LINEAR)
            corrected=np.clip(aligned.astype(np.float32)+color,0,255).astype(np.uint8)
            result=composite(still,corrected,direct)
            # Sky seam cannot return: only temporal change, never old sky pixels.
            current=cv2.GaussianBlur(aligned,(0,0),5).astype(np.float32)
            result=temporal_light(result,current,base,residual)
            enc.stdin.write(result.tobytes())
            if count in [0,24,72,120,168,205]:
                write(out/f'composite-{count:03}.png',result)
                write(out/f'aligned-{count:03}.png',aligned)
            count+=1
            if count%24==0: print(f'render {count}/{meta["frames"]}',flush=True)
    finally:
        cap.release()
        enc.stdin.close()
        code=enc.wait()
    if code: raise RuntimeError(f'Encoder exit {code}')
    if count!=meta['frames']: raise RuntimeError('Incomplete render')
    meta.update(output=str(args.output),outputSHA256=sha(args.output),bytes=args.output.stat().st_size)
    (out/'render.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
    print(json.dumps(meta),flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode',choices=['prepare','render'])
    parser.add_argument('--source',type=Path,required=True)
    parser.add_argument('--still',type=Path)
    parser.add_argument('--fixed',type=Path)
    parser.add_argument('--work',type=Path,required=True)
    parser.add_argument('--output',type=Path)
    parser.add_argument('--ffmpeg')
    args=parser.parse_args()
    if args.mode=='prepare': prepare(args)
    else: render(args)
