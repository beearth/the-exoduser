import speech_recognition as sr
import sounddevice as sd
import numpy as np
import io, wave, json, urllib.request, urllib.parse

RATE = 16000
CHUNK_SEC = 3
SILENCE_THRESH = 0.01
MIC_DEVICE = 2  # Comica_VM30 RX

def translate_google(text, src="ko", dest="en"):
    url = "https://translate.googleapis.com/translate_a/single"
    params = urllib.parse.urlencode({
        "client": "gtx", "sl": src, "tl": dest, "dt": "t", "q": text
    })
    req = urllib.request.Request(f"{url}?{params}")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read())
    return "".join(seg[0] for seg in data[0] if seg[0])

r = sr.Recognizer()
print("자막 시작... (ko→en 번역 모드, Ctrl+C 종료)")

while True:
    try:
        audio = sd.rec(int(CHUNK_SEC * RATE), samplerate=RATE, channels=1, dtype="int16", device=MIC_DEVICE)
        sd.wait()
        rms = np.sqrt(np.mean(audio.astype(np.float32) ** 2))
        if rms < SILENCE_THRESH * 32768:
            continue

        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(RATE)
            wf.writeframes(audio.tobytes())
        buf.seek(0)

        audio_data = sr.AudioData(buf.read()[44:], RATE, 2)
        result = r.recognize_google(audio_data, language="ko-KR")
        text = translate_google(result)
        with open("G:/hell/subtitle_out.txt", "w", encoding="utf-8") as f:
            f.write(f"{result}\n{text}")
        print(f"[ko] {result}")
        print(f"[en] {text}")
    except sr.UnknownValueError:
        pass
    except sr.RequestError as e:
        print(f"[error] {e}")
    except Exception as e:
        print(f"[translate error] {e}")
    except KeyboardInterrupt:
        print("\n종료")
        break
