# SOUND-ITEM-EQUIP-PICKUP-REGRESSION

기존 SOUND 완료 세션 다음 한 건. test/itemEquipSound.test.js와 itemPickupSound.test.js 및 현재 game/easy pickupItem/playItemPickupSfx/playEquipSfx와 관련 SOUND SSOT를 먼저 읽으세요. root가 HEAD696bda0c 원본 복사본과 현재 둘 모두에서 같은2개 테스트실패를 확인했습니다. 원로그 tools/team-followup-20261001/root-review/item-economy-preexisting-sound-failures.txt. root의 ITEM 이름/BALANCE 환수6줄 수정과 무관한 기존실패입니다.

자동장착구간에서 INV.equipped=...;item.slot=...;playItemPickupSfx(item);playEquipSfx(item); 같은문장인접regex가실패했습니다. 실제 음향회귀인지단순리팩터링뒤낡은테스트인지 원식과SSOT로판정하세요. 낡은가정이면실제자동장착/가방획득의 성공·거부/가방공간부족에서 소리가의도한횟수로호출되는실행가능한 작은회귀수정후보를제출. 소리중복/누락이실제있으면근거와최소미적용생산후보를분리하고기존동작을테스트완화로숨기지마세요. 원테스트가검사하는에셋존재/희귀효과/기본층계약은유지.

소유 tools/team-followup-20261001/SOUND/item-sound* 및전용 SOUND-item-sound-result/receipt만. 읽기전용도구만있으면완성diff/test코드를답변으로제출, 실행성공주장금지. root가회수/실행/통합. 공유test/생산/Git/서버/브라우저/청취/새세션쓰기금지. RNG HOWL 이전과제반복0. 한국어수신·실제Read·완료/미실행구분. 동일과제이미받았다면중복하지마세요.
