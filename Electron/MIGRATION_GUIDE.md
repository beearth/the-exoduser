# THE EXODUSER — Electron 마이그레이션 가이드

## 왜 Electron인가

| 비교 | Electron | Unity 전환 | Godot 전환 |
|------|----------|-----------|-----------|
| **코드 수정량** | 0줄 | 10,000줄 전부 재작성 | 10,000줄 전부 재작성 |
| **소요 시간** | 1시간 | 2~3개월 | 1~2개월 |
| **GPU 문제** | main.js에서 플래그로 해결 | 엔진이 해결 | 엔진이 해결 |
| **Steam 배포** | ✅ 검증됨 (30,000+ 판매 사례) | ✅ | ✅ |
| **itch.io 동시 배포** | ✅ game.html 그대로 | ❌ 별도 빌드 | ❌ 별도 빌드 |
| **기존 전투 시스템** | 100% 보존 | 0% (처음부터) | 0% (처음부터) |

## 핵심: GPU 문제가 Electron에서 해결되는 이유

Chrome 브라우저는 보안 때문에 GPU 블록리스트로 신규 GPU를 차단한다.
Electron은 **앱 코드에서 직접 GPU 플래그를 설정**할 수 있다:

```javascript
app.commandLine.appendSwitch('ignore-gpu-blocklist');  // RX 9070 XT 인식
app.commandLine.appendSwitch('enable-unsafe-webgpu');   // WebGPU 강제 활성화
app.commandLine.appendSwitch('use-angle', 'gl');        // WARP 폴백 방지
```

이건 유저가 chrome://flags 들어가서 수동으로 할 필요가 없다.
**앱이 알아서 최적 설정으로 실행된다.**

## 설치 & 실행 (5분)

### 1단계: Node.js 설치
https://nodejs.org/en/download 에서 LTS 버전 설치

### 2단계: 프로젝트 세팅
```bash
mkdir exoduser-electron
cd exoduser-electron

# package.json과 main.js를 이 폴더에 넣기
# game.html을 이 폴더에 복사
# img/ 폴더가 있으면 같이 복사

npm install
```

### 3단계: 테스트 실행
```bash
npm start
```

게임이 **전체화면 데스크톱 앱**으로 실행된다.
F11: 전체화면 토글
F12: 개발자도구

### 4단계: GPU 확인
F12 → Console에서:
```
[GPU] Renderer: WebGPU  ← 이게 나오면 성공
```

RX 9070 XT가 Electron에서 인식되면 WebGPU로 240fps+ 나와야 한다.

## Steam 배포

### 1단계: 빌드
```bash
npm run build:win    # Windows .exe 생성
npm run build:mac    # Mac .app 생성
npm run build:linux  # Linux AppImage 생성
```

`dist/` 폴더에 설치 파일 생성됨.

### 2단계: Steamworks 설정
1. Steamworks 파트너 계정 (https://partner.steamgames.com)
2. 앱 등록비 $100
3. 스토어 페이지 세팅 (스크린샷, 설명, 태그)
4. `dist/` 빌드를 Steam 디포에 업로드

### 3단계: Steam API 연동 (선택)
```bash
npm install steamworks.js
```

업적, 클라우드 세이브, 오버레이 등 Steam 기능 연동 가능.
게임 자체는 연동 없이도 Steam에서 판매 가능.

## itch.io 동시 배포

game.html 파일을 **그대로** itch.io에 업로드하면 된다.
브라우저 버전과 Steam 버전을 동시에 운영 가능.

전략:
- itch.io: 무료 데모 (첫 3스테이지)
- Steam: 풀 게임 (전체 7스테이지)

## 폴더 구조

```
exoduser-electron/
├── main.js          ← Electron 메인 (GPU 플래그 설정)
├── package.json     ← 빌드 설정
├── game.html        ← 네 게임 (수정 없이 그대로)
├── img/             ← 이미지 에셋 (있으면)
├── saves/           ← 로컬 세이브 (있으면)
├── icon.png         ← 게임 아이콘 (512x512 권장)
└── dist/            ← 빌드 결과물 (자동 생성)
```

## game.html 수정사항: 없음

game.html 파일은 **단 1줄도 수정할 필요 없다.**
Electron이 내장 Chromium으로 그대로 실행한다.

유일한 차이:
- 로컬 저장이 Electron 앱 데이터 폴더에 저장됨
- Supabase 연결은 그대로 작동 (인터넷 연결 시)
- Web Audio API 그대로 작동
- WebGL2/WebGPU 그대로 작동 (+ GPU 플래그로 강화)

## Electron 성능 vs 브라우저 비교 (예상)

| 환경 | 렌더러 | 예상 FPS |
|------|--------|---------|
| Chrome (현재) | WebGL2 + WARP(CPU) | 40fps |
| Firefox | WebGPU | 100fps |
| **Electron** | **WebGPU + GPU 플래그** | **200fps+** |

Electron은 Chrome 기반이지만 GPU 블록리스트를 우회하므로
RX 9070 XT를 **직접 사용**할 수 있다.

## 향후 Unity 전환은 언제?

Electron + game.html로 **먼저 출시**하고:
- 월 매출 500만원+ → Unity 리메이크 투자 가치 있음
- 유저 피드백으로 어떤 기능이 필요한지 확인 후 전환
- 예비창업패키지 일정에 맞춰 빠른 출시가 우선

## 다음 단계 (Claude Code 프롬프트)

### WebGPU 블링크 수정 (webgpu_blink_debug.md 참고)
→ Firefox/Electron에서 WebGPU 깜빡임 해결

### Electron 테스트
```
1. Node.js 설치
2. npm install
3. npm start
4. GPU 확인 → WebGPU 활성화 확인
5. fps 측정
```
