#!/usr/bin/env python3
"""Extract only S-02 review blobs into a NEW output directory, then native probes.
No merge, original overwrite, compressed encode, playback or full-track decode.
"""
import ctypes as C, hashlib, json, math, re, struct, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
REF='49851bd893c74b502259cf49f6a6457919767465'
PREFIX='audio_review/S-02/'
DEST=Path(sys.argv[1]).resolve()
ALLOWED=Path('/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/map020-variants-20261001/build-item-sound').resolve()
if ALLOWED not in DEST.parents: raise SystemExit('Destination outside owned output directory')
if DEST.exists(): raise SystemExit('Refusing existing extraction destination')

class ASBD(C.Structure):
    _fields_=[('rate',C.c_double),('format',C.c_uint32),('flags',C.c_uint32),('bytesPacket',C.c_uint32),('framesPacket',C.c_uint32),('bytesFrame',C.c_uint32),('channels',C.c_uint32),('bits',C.c_uint32),('reserved',C.c_uint32)]
class Buffer(C.Structure):
    _fields_=[('channels',C.c_uint32),('size',C.c_uint32),('data',C.c_void_p)]
class BufferList(C.Structure):
    _fields_=[('count',C.c_uint32),('buffer',Buffer)]
def four(x):return int.from_bytes(x.encode(),'big')
cf=C.CDLL('/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation')
at=C.CDLL('/System/Library/Frameworks/AudioToolbox.framework/AudioToolbox')
cf.CFURLCreateFromFileSystemRepresentation.argtypes=[C.c_void_p,C.c_char_p,C.c_long,C.c_bool];cf.CFURLCreateFromFileSystemRepresentation.restype=C.c_void_p
cf.CFRelease.argtypes=[C.c_void_p]
at.ExtAudioFileOpenURL.argtypes=[C.c_void_p,C.POINTER(C.c_void_p)]
at.ExtAudioFileGetProperty.argtypes=[C.c_void_p,C.c_uint32,C.POINTER(C.c_uint32),C.c_void_p]
at.ExtAudioFileSetProperty.argtypes=[C.c_void_p,C.c_uint32,C.c_uint32,C.c_void_p]
at.ExtAudioFileRead.argtypes=[C.c_void_p,C.POINTER(C.c_uint32),C.POINTER(BufferList)]
at.ExtAudioFileDispose.argtypes=[C.c_void_p]
def decode_prefix(path):
    raw=str(path).encode();url=cf.CFURLCreateFromFileSystemRepresentation(None,raw,len(raw),False);audio=C.c_void_p()
    status=at.ExtAudioFileOpenURL(url,C.byref(audio));cf.CFRelease(url)
    if status:return {'status':'UNSUPPORTED_OR_OPEN_ERROR','osstatus':status,'framesRead':0}
    try:
        src=ASBD();size=C.c_uint32(C.sizeof(src));status=at.ExtAudioFileGetProperty(audio,four('ffmt'),C.byref(size),C.byref(src))
        if status:return {'status':'FORMAT_ERROR','osstatus':status}
        client=ASBD(src.rate,four('lpcm'),9,4*src.channels,1,4*src.channels,src.channels,32,0)
        status=at.ExtAudioFileSetProperty(audio,four('cfmt'),C.sizeof(client),C.byref(client))
        if status:return {'status':'CLIENT_FORMAT_ERROR','osstatus':status}
        pcm=(C.c_float*(4096*src.channels))();bl=BufferList(1,Buffer(src.channels,C.sizeof(pcm),C.cast(pcm,C.c_void_p)))
        frames=C.c_uint32(4096);status=at.ExtAudioFileRead(audio,C.byref(frames),C.byref(bl))
        values=list(pcm)[:frames.value*src.channels]
        return {'status':'PASS' if not status and frames.value>0 and all(math.isfinite(x) for x in values) else 'DECODE_ERROR','osstatus':status,'framesRead':frames.value,'sampleRate':src.rate,'channels':src.channels,'prefixSeconds':frames.value/src.rate,'prefixPeak':max(map(abs,values),default=0),'scope':'first 4096 frames only, decoded in memory, never played'}
    finally:at.ExtAudioFileDispose(audio)

def ogg_structure(data):
    pos=0;pages=0;first=None;last_granule=0;seqs={};eos=False
    while pos<len(data):
        if data[pos:pos+4]!=b'OggS' or pos+27>len(data):raise ValueError('Invalid/truncated Ogg page')
        if data[pos+4]!=0:raise ValueError('Unknown Ogg version')
        n=data[pos+26];head=27+n
        if pos+head>len(data):raise ValueError('Truncated Ogg lacing')
        length=sum(data[pos+27:pos+head]);end=pos+head+length
        if end>len(data):raise ValueError('Truncated Ogg payload')
        serial,seq=struct.unpack_from('<II',data,pos+14)
        if serial in seqs and seq!=seqs[serial]+1:raise ValueError('Ogg sequence discontinuity')
        seqs[serial]=seq
        if first is None:first=data[pos+head:end]
        granule=struct.unpack_from('<Q',data,pos+6)[0]
        if granule!=2**64-1:last_granule=granule
        eos=bool(data[pos+5]&4);pages+=1;pos=end
    if not eos:raise ValueError('Missing final Ogg EOS')
    if first.startswith(b'OpusHead'):
        channels=first[9];pre=struct.unpack_from('<H',first,10)[0];rate=48000;duration=(last_granule-pre)/rate;codec='opus'
    elif first.startswith(b'\x01vorbis'):
        channels=first[11];rate=struct.unpack_from('<I',first,12)[0];duration=last_granule/rate;codec='vorbis'
    else:raise ValueError('Unsupported Ogg identification packet')
    return {'status':'PASS','codec':codec,'pages':pages,'sampleRate':rate,'channels':channels,'durationSeconds':duration,'scope':'container page bounds/sequence/EOS; not codec decode or CRC validation'}

raw=subprocess.check_output(['git','ls-tree','-rz',REF,'--',PREFIX],cwd=ROOT)
entries=[]
for record in raw.split(b'\0'):
    if not record:continue
    meta,name=record.split(b'\t',1);mode,typ,oid=meta.decode().split();name=name.decode()
    rel=name.removeprefix(PREFIX)
    if mode!='100644' or typ!='blob' or name==rel or '/' in rel or rel in ('','.','..'):raise SystemExit('Unsafe/unexpected tree entry')
    entries.append((name,rel,oid))
if len(entries)!=13:raise SystemExit('Expected 9 candidates + 3 measurements + README')
DEST.mkdir(parents=True)
receipt=[]
for name,rel,oid in entries:
    data=subprocess.check_output(['git','cat-file','blob',oid],cwd=ROOT)
    if hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()!=oid:raise SystemExit('Git blob mismatch')
    target=DEST/rel
    with target.open('xb') as f:f.write(data)
    receipt.append({'gitPath':name,'path':str(target),'blob':oid,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})

rows=[]
for r in receipt:
    p=Path(r['path'])
    if p.suffix not in ('.mp3','.ogg','.opus'):continue
    probe=subprocess.run(['/usr/bin/afinfo',str(p)],text=True,capture_output=True,timeout=20)
    duration=re.search(r'estimated duration:\s*([\d.]+) sec',probe.stdout)
    row=dict(r,afinfo={'exitCode':probe.returncode,'durationSeconds':float(duration[1]) if duration else None,'output':probe.stdout.strip(),'stderr':probe.stderr.strip()},nativeDecode=decode_prefix(p))
    if p.suffix in ('.ogg','.opus'):
        try:row['container']=ogg_structure(p.read_bytes())
        except Exception as e:row['container']={'status':'FAIL','error':str(e)}
    rows.append(row)
originals=[]
for rel in ['bgm/1장_썩은숲/Ashes Under the Banner (Remastered).wav','bgm/3장_얼음굴/흰눈의 맹세 (Remastered).wav','bgm/공통/네메시아의 강림2 (Remastered).wav']:
    p=ROOT/rel;probe=subprocess.run(['/usr/bin/afinfo',str(p)],text=True,capture_output=True,timeout=20)
    duration=re.search(r'estimated duration:\s*([\d.]+) sec',probe.stdout)
    originals.append({'path':rel,'bytes':p.stat().st_size,'durationSeconds':float(duration[1]) if duration else None,'afinfoExit':probe.returncode,'nativeDecode':decode_prefix(p)})
result={'sourceRef':REF,'sourceHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'extractedDirectory':str(DEST),'receipt':receipt,'candidates':rows,'originals':originals,'counts':{'candidates':len(rows),'nativePrefixDecodePass':sum(r['nativeDecode']['status']=='PASS' for r in rows),'containerPass':sum(r.get('container',{}).get('status')=='PASS' for r in rows)},'limits':['No listening, waveform quality, full-track decode, loop seam measurement, browser playback, game/package integration.','No ffprobe/ffmpeg available; CoreAudio afinfo/ExtAudioFileRead used.','Unsupported native decoding is a local-tool limitation, not proof of corrupt candidates.','Source WAVs read in place; no re-encode or original deletion.']}
print(json.dumps(result,ensure_ascii=False,indent=2))
