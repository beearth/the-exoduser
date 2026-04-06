"""
HELL: EXODUSER - Realtime Subtitle Generator
마이크 입력을 Whisper로 실시간 인식하여 자막 텍스트 파일 출력

사용법:
  python subtitle.py              # 기본 (base 모델, 한국어)
  python subtitle.py --model small --lang en   # 영어, small 모델
  python subtitle.py --list-devices            # 오디오 장치 목록

출력: G:\\hell\\subtitle_out.txt (OBS 텍스트 소스 등에서 읽기)
"""

import argparse
import sys
import threading
import time
from pathlib import Path

import numpy as np
import sounddevice as sd
import whisper

# ── 설정 ──
OUTPUT_FILE = Path(__file__).parent / "subtitle_out.txt"
SAMPLE_RATE = 16000
BLOCK_SEC = 3        # 녹음 블록 길이 (초)
SILENCE_THRESH = 0.01 # 무음 임계값 (RMS)
FADE_SEC = 5          # 자막 표시 유지 시간

def list_devices():
    print(sd.query_devices())
    sys.exit(0)

def main():
    parser = argparse.ArgumentParser(description="Realtime subtitle with Whisper")
    parser.add_argument("--model", default="base", help="Whisper 모델 (tiny/base/small/medium/large)")
    parser.add_argument("--lang", default="ko", help="언어 코드 (ko/en/ja 등)")
    parser.add_argument("--device", type=int, default=None, help="오디오 입력 장치 번호")
    parser.add_argument("--list-devices", action="store_true", help="오디오 장치 목록 출력")
    parser.add_argument("--block", type=float, default=BLOCK_SEC, help="녹음 블록 길이 (초)")
    parser.add_argument("--fade", type=float, default=FADE_SEC, help="자막 유지 시간 (초)")
    args = parser.parse_args()

    if args.list_devices:
        list_devices()

    print(f"[subtitle] 모델 로딩: {args.model} ...")
    model = whisper.load_model(args.model)
    print(f"[subtitle] 모델 로드 완료. 언어={args.lang}, 블록={args.block}s")
    print(f"[subtitle] 출력: {OUTPUT_FILE}")
    print(f"[subtitle] Ctrl+C로 종료\n")

    # 자막 상태
    last_text = ""
    last_time = 0.0
    lock = threading.Lock()

    # 자막 페이드 스레드
    def fade_worker():
        nonlocal last_text
        while True:
            time.sleep(1)
            with lock:
                if last_text and (time.time() - last_time > args.fade):
                    last_text = ""
                    OUTPUT_FILE.write_text("", encoding="utf-8")

    t = threading.Thread(target=fade_worker, daemon=True)
    t.start()

    try:
        while True:
            # 녹음
            frames = int(args.block * SAMPLE_RATE)
            audio = sd.rec(frames, samplerate=SAMPLE_RATE, channels=1,
                           dtype="float32", device=args.device)
            sd.wait()
            audio = audio.flatten()

            # 무음 스킵
            rms = np.sqrt(np.mean(audio ** 2))
            if rms < SILENCE_THRESH:
                continue

            # Whisper 인식
            result = model.transcribe(
                audio,
                language=args.lang,
                fp16=False,
                no_speech_threshold=0.6,
                condition_on_previous_text=False,
            )
            text = result["text"].strip()

            if not text or text in (".", "...", "Thank you.", "자막 제공"):
                continue

            with lock:
                last_text = text
                last_time = time.time()
                OUTPUT_FILE.write_text(text, encoding="utf-8")
                print(f"[{time.strftime('%H:%M:%S')}] {text}")

    except KeyboardInterrupt:
        print("\n[subtitle] 종료")
        OUTPUT_FILE.write_text("", encoding="utf-8")

if __name__ == "__main__":
    main()
