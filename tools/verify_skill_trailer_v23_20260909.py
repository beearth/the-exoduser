"""Verify the V2 derivative's duration, unchanged source, captions and ending."""
import hashlib
import json
from PIL import Image, ImageChops, ImageStat, ImageDraw
from playwright.sync_api import sync_playwright
from build_skill_trailer_v23_20260909 import ROOT, SOURCE, FINAL, OUT, run

def main():
    build = json.loads((OUT / 'build.json').read_text(encoding='utf-8'))
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == build['sourceSHA256']
    meta = json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(FINAL)]))
    video = next(s for s in meta['streams'] if s['codec_type'] == 'video')
    audio = next(s for s in meta['streams'] if s['codec_type'] == 'audio')
    assert (video['width'], video['height'], video['r_frame_rate'], video['nb_frames']) == (1920, 1080, '60/1', '3480')
    assert abs(float(meta['format']['duration']) - 58) < 0.01
    assert audio['codec_name'] == 'aac' and audio['sample_rate'] == '48000'
    run(['ffmpeg', '-v', 'error', '-i', str(FINAL), '-f', 'null', '-'])
    times = [13, 23, 33, 36, 42, 49, 53.8, 54.4, 55.5, 57, 57.8]
    sheet = Image.new('RGB', (1920, 1536), '#151515')
    diffs = []
    for i, seconds in enumerate(times):
        frame = OUT / f'frame_{seconds}.jpg'
        run(['ffmpeg', '-v', 'error', '-y', '-ss', str(seconds), '-i', str(FINAL), '-frames:v', '1', '-vf', 'scale=640:360', str(frame)])
        current = Image.open(frame).convert('RGB')
        x, y = (i % 3) * 640, (i // 3) * 384
        sheet.paste(current, (x, y + 24))
        ImageDraw.Draw(sheet).text((x + 8, y + 5), f'{seconds}s', fill='white')
        if seconds < 54:
            reference = OUT / f'reference_{seconds}.jpg'
            run(['ffmpeg', '-v', 'error', '-y', '-ss', str(seconds), '-i', str(SOURCE), '-frames:v', '1', '-vf', 'scale=640:360', str(reference)])
            delta = sum(ImageStat.Stat(ImageChops.difference(current, Image.open(reference).convert('RGB'))).mean) / 3
            assert delta < 3, (seconds, delta)
            diffs.append({'seconds': seconds, 'meanPixelDifference': round(delta, 4)})
    sheet.save(OUT / 'CONTACT.jpg')
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        page = browser.new_page()
        url = 'http://localhost:3333/' + FINAL.relative_to(ROOT).as_posix()
        page.set_content('<video controls id="preview"></video>')
        page.locator('video').evaluate('(v,url)=>{v.src=url;v.muted=true}', url)
        page.wait_for_function('document.querySelector("video").readyState>=2')
        page.locator('video').evaluate('(v)=>{v.currentTime=54.5;return v.play()}')
        page.wait_for_timeout(1000)
        playback = page.locator('video').evaluate('(v)=>({time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.message||null})')
        assert playback['time'] > 54.5 and playback['error'] is None
        browser.close()
    report = {'file': str(FINAL), 'bytes': FINAL.stat().st_size, 'duration': 58, 'frames': 3480,
              'sourcePreserved': True, 'decode': 'PASS', 'first54SecondsComparison': diffs, 'browser': playback}
    (OUT / 'verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))

if __name__ == '__main__':
    main()
