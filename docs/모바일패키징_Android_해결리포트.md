# Android 모바일 패키징 해결 리포트

작성일: 2026-05-16  
프로젝트: 디로이 (DIROI) — `G:\pentafall`

---

## 사용 스택

- **Capacitor v8** — 웹앱 → Android APK 래퍼
- **Firebase Authentication (Web JS SDK)** — 구글 로그인
- **@capacitor-firebase/authentication v8** — 네이티브 구글 로그인
- **@capacitor/haptics** — 햅틱 진동

---

## 문제 1: 구글 로그인 팝업 불가 (WebView)

### 증상
- `signInWithPopup` → 계정 선택 후 화이트스크린 또는 멈춤
- `signInWithRedirect` → "사이트에 연결할 수 없음"
- COOP 에러: `Cross-Origin-Opener-Policy policy would block the window.closed call`

### 원인
Android WebView는 Firebase OAuth 팝업의 `window.opener.postMessage` 통신을 차단.  
redirect 방식도 WebView에서 OAuth 콜백 복귀 불가.

### 해결
`@capacitor-firebase/authentication` 네이티브 플러그인 사용.

**설치**
```bash
npm install @capacitor-firebase/authentication
npx cap sync android
```

**android/app/build.gradle — 의존성 추가**
```gradle
implementation 'com.google.android.gms:play-services-auth:21.0.0'
```

**capacitor.config.json — providers 등록 필수**
```json
{
  "plugins": {
    "FirebaseAuthentication": {
      "skipNativeAuth": false,
      "providers": ["google.com"]
    }
  }
}
```
> ⚠️ `providers` 없으면 "sign-in provider is not enabled" 에러 발생

**Firebase Console 설정**
1. SHA-1 추출: `cd android && ./gradlew signingReport`
2. Firebase Console → 프로젝트 설정 → Android 앱 → 디지털 지문 추가
3. `google-services.json` 재다운로드 → `android/app/` 덮어쓰기

**auth.js**
```js
function isCapacitor() {
  return typeof window !== 'undefined' && typeof window.Capacitor !== 'undefined';
}

async function signInWithGoogleCapacitor() {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
  const idToken = result.credential?.idToken;
  if (!idToken) throw new Error('Google Sign-In: idToken 없음');
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export function signInWithGoogle() {
  if (isNWJS()) return signInWithGoogleNWJS();
  if (isCapacitor()) return signInWithGoogleCapacitor();
  return signInWithPopup(auth, provider);
}
```

---

## 문제 2: 전체화면 전환 불가 (WebView)

### 증상
`document.documentElement.requestFullscreen()` Android WebView에서 동작 안 함

### 해결
`MainActivity.java`에서 몰입형 모드 설정:

```java
private void hideSystemUI() {
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
    WindowInsetsController ctrl = getWindow().getInsetsController();
    if (ctrl != null) {
      ctrl.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
      ctrl.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
  } else {
    getWindow().getDecorView().setSystemUiVisibility(
      View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | ...
    );
  }
}
```

`styles.xml`에도 추가:
```xml
<item name="android:windowFullscreen">true</item>
<item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
```

---

## 문제 3: 햅틱 진동 불가 (WebView)

### 증상
`navigator.vibrate()` Capacitor WebView에서 차단

### 해결
`@capacitor/haptics` 플러그인으로 교체:

```bash
npm install @capacitor/haptics
npx cap sync android
```

```js
// settings.js
export function vibrate(pattern) {
  if (!settings.vibe) return;
  if (window.Capacitor) {
    import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
      const ms = Array.isArray(pattern) ? pattern[0] : pattern;
      if (ms <= 30) Haptics.impact({ style: ImpactStyle.Light });
      else if (ms <= 80) Haptics.impact({ style: ImpactStyle.Medium });
      else Haptics.impact({ style: ImpactStyle.Heavy });
    }).catch(() => {});
  } else if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
```

---

## 서버 방식: Vercel URL

번들 방식 (로컬 dist/) 대신 Vercel 프로덕션 URL로 서빙.  
Google 로그인 등 모든 웹 기능 그대로 작동.

```json
// capacitor.config.json
{
  "server": {
    "url": "https://diroi.vercel.app"
  }
}
```

> 단점: 인터넷 필수. 배포 시 자동 최신화.

---

## 업데이트 워크플로우

```bash
# 코드 변경 후
npm run build
npx cap sync android
# Android Studio에서 ▶ Run
```

Vercel 배포 변경 시 Android Studio 재빌드 불필요 (앱이 Vercel에서 로드하므로).
