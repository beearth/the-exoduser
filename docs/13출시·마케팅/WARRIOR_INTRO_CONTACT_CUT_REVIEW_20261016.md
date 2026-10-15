# 전사 인트로 접촉 컷 교정 V1 — 2026-10-16

상태: **REVIEW_ONLY · 공개 승인0**. 사용자가 지적한 「끝날쯤에 몬스터랑 머리 맞데는」 컷을 실제 기존 영상만으로 교정한 별도 편집안이다. AI 보조 시네마틱 제작 기록이며 새 게임 플레이·10월16일 게임 패치·Steam 데모 반영을 뜻하지 않는다.

| 항목 | 실제 결과 |
|---|---|
| 원본 | 기존10월8일 제작본96.4초, SHA256277fbe09c4f5c0b70a98aae6376a8d820a7377cbd6f96a3bc62365cf0a166b34. 원본 수정0. |
| 접촉 컷 | 원본81.000~84.000초, 경계별 디코드 프레임 차이와 실제 스틸로 확인. 새 출력에서 제외. |
| 대체 | 원본84.000~87.500초의 기존 대검 컷3.5초를 출력81.000~87.500초6.5초로 조정. 속도7/13≈0.5384615385, 프레임 보간/생성0. |
| 전후 연결 | 0~81초와87.5초~끝은 기존 시간 유지. 전체96.4초. 컷 사이에 불투명판/화면 복제/새 생성 영상 없음. |
| 실제 출력 | 1920×1080, 디코드5604프레임. 평균 nominal58.1279258728FPS/가변 시각 타임스탬프. 출력60FPS 고정이나 원 게임 모션 개선으로 주장하지 않음. |
| 원음 | 원본 전체 AAC 압축 payload4520패킷의 SHA256e8bec0638d2e7ebf213d0d4b13fdaa860ded28c68acd0cf23c68e1f2dad122dc가 출력과 정확 일치. 내레이션·음악 재합성/절단0. 주관적 청취UNHEARD. |
| 자막 | 가독성 V2의 KO/EN각21큐를 byte 그대로 복사. 59.50~62.43초2.93초 병합 유지, 언어별 시간 일치·겹침0, 번인0. |
| 기술 QA | 새 전체 영상 디코드 완료·PTS 단조 증가. 연결8표본의 의도한 소스 프레임 대비 PSNR최저42.9821dB. 이 수치는 올바른 소스 연결 확인이며 편집 품질 승인 아님. |
| 시각 QA | 새 출력 연결8정지 프레임을 직접 확인해 접촉 컷 제외와 다음 마법사 컷의87.5초 경계 보존 확인. 수정 구간 연속 재생·속도 판단·전편 시청 미완료. |
| 도구 | 로컬 Higgsedit CLI 없음. AVFoundation 비디오 재시간화→비디오 전용 렌더→원본 AAC passthrough mux. .m 소스3개 보존. CoreVideo 누락·검증 유틸 문법 오류2개는 로컬 교정 후 해당 범위만 실행. |
| 브라우저 | 이전 file 프로토콜 거부 이후 우회·재접속0. 새HTML은 파일로만 준비했고 브라우저 시각/조작 QA는 미수행. MP4 직접 미리보기로 인도. |
| 공개 | 새 YouTube/Steam/타 채널 업로드0·사용자 승인0·공개 준비 완료0. |

전체 MP4: `/Users/fordeargamers/the-exoduser/output/warrior-intro-contact-cut-20261016/REVIEW/EXODUSER_WARRIOR_INTRO_CONTACT_CUT_V1_20261016_REVIEW.mp4`
SHA256: `5c1af6f1daedba40ee891e1c5cf653d55cfa5fa84c6b5ead81377a60d466647a`
12초 수정 구간: `/Users/fordeargamers/the-exoduser/output/warrior-intro-contact-cut-20261016/REVIEW/EXODUSER_WARRIOR_INTRO_CONTACT_CUT_78-90s_20261016_REVIEW.mp4`
SHA256: `de0404db18684e2172db65f76a8f86e8837c2d296789e1c5ae50e19e6bb71c2e`
HTML 및 자막: `/Users/fordeargamers/the-exoduser/output/warrior-intro-contact-cut-20261016/REVIEW`.

비디오는 로컬 output에 인도하고, 대용량 MP4를 Git에 추가하지 않았다. Git에는 정확한 해시/경로, 원본 소비·리타이밍 재현 소스, VTT와 검수 receipt를 보존한다. 이를 원격 MP4 업로드로 주장하지 않는다.

## 이번에 확인한 개발 변경 한 건

migration checkout HEADc440e02c773d1578cd2ad53352af39793de560da. 관련 commit2ad26d93f63170360a33f9b01ca8d0442ab58fc7의 `docs/engine/FDG_PC_MAC_GIT_SYNC_20261016.md` 추가 절만 대조했다. 기존 VFX13계열(PNG13·JSON13)의 draw/비행/착지/사망/Q 시각 caller와 .mjs MIME/패키징 소스가 연결됐다. roots48/다른12계열24장은 **리소스 장수**이고 fps는 계열마다 다르다. 새 원화0·실제 빌드/Steam 배포0·자연 전투/PC 실행 미검증·보스 전체 완료 아님. 단일 서버 오류 처리·환불 계산 검사를 홍보 완료 소재로 세지 않는다.

다음 소재 한 건: 전사 인트로 접촉 컷 교정 V1의 수정 구간 연속 재생·전편 시청·실제 청취와 사용자 편집 검토 후 교체 판단. 악의구 시연은 후속 준비이며 새 사용자 플레이 녹화는 별도 대기.
