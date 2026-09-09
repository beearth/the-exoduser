"""Preserve downloaded Higgsfield sources and validate complete decoding."""
import concurrent.futures, hashlib, json, os, shutil, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
DOWNLOADS = Path('C:/Users/심도진/Downloads')
EASY = ROOT / '대검전사_뉴버전_컷별영상'
BIN = Path(os.environ['LOCALAPPDATA']) / 'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin'
ROWS = [
('W09','e54f8275-46c5-41f3-b223-027157f8e61d',5,8,'w09','01_그날밤_복수후'),
('W10-A','b8dea426-283e-46dd-a392-e7de0f33b2dc',5,8,'w10a','02_검을쥔손'),
('W10-B','09103503-afa9-47df-8864-c5ba176a7858',5,8,'w10b','03_불꽃과장갑'),
('W10-C','d8fee797-05f2-435f-a07d-eeba1a773cb1',5,8,'w10c','04_주인공_분노'),
('W11-A','e3c1b248-322c-4e3a-ae58-7ff647ee0532',5,8,'w10c','05_기억하라'),
('W11-B','69c89d53-10c6-4e57-89db-a5c82d68ee22',5,8,'../batch/w07/cin_parents_cell','06_부모_회상'),
('W12','7e0b15c8-4b24-4530-bf2f-f016f8946b96',5,8,'w12','07_지옥_진입'),
('W13','37938eee-e630-484f-8a1c-8b43a1c9b34e',7,11,'w13','08_지옥_전경'),
('W14','a075b8d5-3c72-4d55-a3c2-7d1deed51bfa',6,9,'w14','09_영혼들의_도착'),
('W15-A','28cae38d-26cc-44e7-af0f-eaf698d6adcb',5,8,'w15a','10_영혼_분노'),
('W15-B','9cfe4bc7-0946-4c27-8d7f-0f664aa7a448',5,8,'w15b','11_영혼_억울함'),
('W15-C','62c5f6d6-528f-4a89-a796-fd950b3214fb',5,8,'w15c','12_영혼_상실'),
('W16-A','5b55eb8b-904c-47b8-ba7e-f0d74d0bd1e1',5,8,'w16','13_네메시아_질문'),
('W16-B','6608a45f-9eb5-40e1-8eb9-0c4592b61491',5,8,'w16b','14_전사의_침묵'),
('W16-C','e40dc39a-7a63-441c-b6d4-9dfd0233938a',5,8,'w16c','15_네메시아_명령'),
('W16-D','b8d3b1ff-7e56-414d-b3af-eb694636a712',5,8,'w16d','16_마지막_탈출길'),
]

def collect(row):
    shot, asset, seconds, cost, frame, label = row
    matches = list(DOWNLOADS.glob('*'+asset+'.mp4'))
    assert len(matches)==1, (shot, matches)
    target = OUT/(shot.lower().replace('-','')+'.mp4')
    shutil.copy2(matches[0], target)
    info = json.loads(subprocess.check_output([str(BIN/'ffprobe.exe'),'-v','error','-show_streams','-show_format','-of','json',str(target)]))
    video = next(x for x in info['streams'] if x['codec_type']=='video')
    assert abs(float(video['duration'])-seconds)<.15, (shot,video['duration'])
    assert (video['width'],video['height'])==(1916,1080), (shot,video['width'],video['height'])
    decoded = subprocess.run([str(BIN/'ffmpeg.exe'),'-v','error','-i',str(target),'-f','null','-'],capture_output=True)
    assert decoded.returncode==0 and not decoded.stderr, (shot,decoded.stderr)
    alias = EASY/(label+'.mp4')
    shutil.copy2(target,alias)
    return dict(id=shot,asset_id=asset,status='completed_downloaded',source_file=target.name,start_frame=frame+('.png' if frame.startswith('..') else '_start.png'),duration_s=float(video['duration']),width=video['width'],height=video['height'],fps=video['avg_frame_rate'],frames=int(video.get('nb_frames',0)),audio_streams=sum(x['codec_type']=='audio' for x in info['streams']),displayed_credit_cost=cost,bytes=target.stat().st_size,sha256=hashlib.sha256(target.read_bytes()).hexdigest(),decode='PASS',easy_file=str(alias.relative_to(ROOT)))

if __name__=='__main__':
    EASY.mkdir(exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        shots=list(pool.map(collect,ROWS))
    result=dict(version=7,status='all_16_generated_downloaded',model='Cinema Studio 2.5',project_url='https://higgsfield.ai/ko/generate/@byzantinecrab1644/project/folders/9880dbbf-555f-4b92-9991-09bab8be564e',count=len(shots),source_duration_s=sum(x['duration_s'] for x in shots),displayed_credit_cost_total=sum(x['displayed_credit_cost'] for x in shots),actual_balance_change_verified=False,visual_motion_review='pending',final_edit='pending',shots=shots)
    (OUT/'batch_manifest.json').write_bytes((json.dumps(result,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
    shutil.copy2(OUT/'ending_dialogue.mp3',EASY/'마지막대사_쉼수정.mp3')
    (EASY/'먼저읽기.txt').write_bytes(('대검전사 뉴버전 — 후반 영상 소스16개\n01부터16까지 이야기 순서입니다.\n각 영상은 대사 합성 전의 무음 소스입니다. 마지막 대사의 쉼은 별도 MP3로 확인할 수 있습니다.\n영상 생성·다운로드·전체 디코딩 확인 완료. 최종 편집·자막·음성 합성·움직임 상세 검수 전입니다.\n').encode('utf-8'))
    print(json.dumps({k:v for k,v in result.items() if k!='shots'},ensure_ascii=False))
