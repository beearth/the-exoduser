# AUTOLOOP INBOX

여기에 사람이 우선처리 지시를 넣는다. 형식:

```
[NEW] <한 줄 지시>
```

루프는 매 사이클 S0에서 이 파일을 읽고, `[NEW]` 항목을 QUEUE 맨 앞에 삽입해 우선 처리한다.
처리 완료 시 해당 줄을 `[DONE]` 으로 바꾼다. `[NEW]` 가 없으면 기존 CURSOR 항목을 진행한다.

## 지시 목록
<!-- 아래에 [NEW] 항목 추가 -->
[NEW] 모션 작업 중단. 맵 프레임 정리 우선
[DONE] STATUS.md 의 LAST UPDATE 를 오늘 날짜로 갱신하고 종료
[DONE] STATUS.md 의 CYCLE 값을 1 증가시키고 종료
