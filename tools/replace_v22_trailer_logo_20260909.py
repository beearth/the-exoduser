"""Replace only the V22 end card; preserve the original audio packets."""
import hashlib
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageChops, ImageStat
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'captures/gameplay_trailer_20260909/EXODUSER_GAMEPLAY_TRAILER_V22_SKILL_MONTAGE_1080P60.mp4'
FINAL = SOURCE.with_name('EXODUSER_GAMEPLAY_TRAILER_V22_SKILL_MONTAGE_NEW_LOGO_1080P60.mp4')
LOGO = ROOT / 'output/imagegen/trailer/skill_title_crimson_rift_v3.png'
OUT = ROOT / 'tmp/trailer_v22_new_logo'

def run(args):
    p = subprocess.run(args, cwd=ROOT, capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
    if p.returncode:
        raise RuntimeError(p.stderr.decode('utf-8', errors='replace'))
    return p.stdout

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    filters = (
        '[0:v]trim=end=94,setpts=PTS-STARTPTS,setsar=1[game];'
        "[1:v]scale=2560:1440,zoompan=z='1+0.025*on/239':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps=60,"
        'trim=duration=4,setpts=PTS-STARTPTS,setsar=1,fade=t=in:d=0.2,fade=t=out:st=3.5:d=0.5,'
        'drawbox=x=0:y=0:w=iw:h=38:color=black:t=fill,drawbox=x=0:y=1042:w=iw:h=38:color=black:t=fill[logo];'
        '[game][logo]concat=n=2:v=1:a=0[v]'
    )
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(SOURCE),
         '-loop', '1', '-framerate', '60', '-i', str(LOGO), '-filter_complex', filters,
         '-map', '[v]', '-map', '0:a:0', '-t', '98', '-r', '60', '-c:v', 'libx264',
         '-threads', '8', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
         '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
         '-c:a', 'copy', '-movflags', '+faststart', str(FINAL)])
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == source_hash
    meta = json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(FINAL)]))
    v = next(s for s in meta['streams'] if s['codec_type'] == 'video')
    assert (v['width'], v['height'], v['r_frame_rate'], v['nb_frames']) == (1920, 1080, '60/1', '5880')
    assert abs(float(meta['format']['duration']) - 98) < 0.01
    run(['ffmpeg', '-v', 'error', '-i', str(FINAL), '-f', 'null', '-'])
    def audio_hash(path):
        return run(['ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:a:0', '-c', 'copy', '-f', 'hash', '-hash', 'sha256', '-']).decode().strip()
    original_audio = audio_hash(SOURCE)
    assert original_audio == audio_hash(FINAL)
    times = [1, 25, 60, 87, 91, 93.8, 94.4, 95.5, 97.8]
    sheet = Image.new('RGB', (1920, 1152), '#141414')
    diffs = []
    for i, seconds in enumerate(times):
        path = OUT / f'frame_{seconds}.jpg'
        run(['ffmpeg', '-v', 'error', '-y', '-ss', str(seconds), '-i', str(FINAL), '-frames:v', '1', '-vf', 'scale=640:360', str(path)])
        im = Image.open(path).convert('RGB')
        x, y = (i % 3) * 640, (i // 3) * 384
        sheet.paste(im, (x, y + 24))
        ImageDraw.Draw(sheet).text((x + 8, y + 5), f'{seconds}s', fill='white')
        if seconds < 94:
            ref = OUT / f'original_{seconds}.jpg'
            run(['ffmpeg', '-v', 'error', '-y', '-ss', str(seconds), '-i', str(SOURCE), '-frames:v', '1', '-vf', 'scale=640:360', str(ref)])
            delta = sum(ImageStat.Stat(ImageChops.difference(im, Image.open(ref).convert('RGB'))).mean) / 3
            assert delta < 3, (seconds, delta)
            diffs.append({'seconds': seconds, 'meanPixelDifference': round(delta, 4)})
    sheet.save(OUT / 'CONTACT.jpg')
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        page = browser.new_page()
        page.set_content('<video controls></video>')
        page.locator('video').evaluate('(v,url)=>{v.src=url;v.muted=true}', 'http://localhost:3333/' + FINAL.relative_to(ROOT).as_posix())
        page.wait_for_function('document.querySelector("video").readyState>=2')
        page.locator('video').evaluate('(v)=>{v.currentTime=94.5;return v.play()}')
        page.wait_for_timeout(1000)
        playback = page.locator('video').evaluate('(v)=>({time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.message||null})')
        assert playback['time'] > 94.5 and playback['error'] is None
        browser.close()
    result = {'file': str(FINAL), 'bytes': FINAL.stat().st_size, 'duration': 98, 'frames': 5880,
              'sourceSHA256': source_hash, 'sourcePreserved': True, 'audioPacketHash': original_audio,
              'audioUnchanged': True, 'decode': 'PASS', 'comparisons': diffs, 'browser': playback}
    (OUT / 'verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False), flush=True)

if __name__ == '__main__':
    main()
