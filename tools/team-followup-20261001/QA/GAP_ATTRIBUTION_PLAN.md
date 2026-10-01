# 109.8ms 간격 귀속 후속 진단 계획

기존 run2 raw의109.8ms draw 시작 간격은147453.3→147563.1ms, 첫 입력+235.7→345.5ms다. 첫 처치 관측152490.3ms보다 최소4927.2ms 앞서며, 첫 canvas 공격147713.2ms보다도 앞선다. 이전draw0.5ms/다음draw0.4ms, 중간109.3ms는 이 자료만으로 update/flush/외부 task/GPU/OS를 분리할 수 없다. 전체draw88.6ms는154833.5ms(첫 처치+2343.2ms)에 따로 있다.

다음 추가진단1회만 정상Lv1·새저장원점·3340에서 수행한다. loop/update/draw wrapper3개, 독립rAF/상태/입력, longtask/long-animation-frame 상세scripts와 외부CDP CPU샘플 요청1000us를 같은 timeOrigin으로 수집한다. 기존 경량 run2는 profiler-off/단일draw wrapper이고 새런은 profiler-on/3wrapper인 별도 귀속자료다. 오버헤드 미측정이며 FPS/시간개선 비교 금지. GPU계측/API래퍼/강제상태/인위적처치/품질저하 없음. 25초 입력 또는 자연사/전경이탈/설치120초 종료. profiler는 결과회수시 중지하며 자동 종료된 관측 뒤 tail을 구분한다.

실제 소스/HTTP SHA와 원격 복구 지점을 확인하고 실행한다. 다른 게임·실제소켓테스트·패키지·빌드·인코딩과 병행 금지. 새프로필이 아닌 기존 연결프로필의 새origin 격리 제한은 그대로다. 원인을 재현하지 못하면 미재현으로 남기며 임의생산수정이나 반복측정을 하지 않는다. CPU sampling은 JS stack 표본이며 긴 네이티브/GPU/스케줄링 대기의 정확한 CPU시간을 보장하지 않는다.

기존 생명주기4검사와 trusted/foreground1검사를 새 진단도구에 수행한다. 게임생산코드 변경0. BUILD failure-entry19/19 root 재검사 완료, 실제NW.js 공유상태/진입차단은 미검수다.
