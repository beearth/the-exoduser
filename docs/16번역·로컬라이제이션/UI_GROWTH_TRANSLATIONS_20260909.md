# 성장 화면 번역 보완 — 2026-09-09

현재 `stat-panel-ui.js`의 계획·적용·취소 흐름과 6개 경로·26개 패시브에 맞춰 번역을 보완했다. 기존576+66키에 신규137키를 더해 등록 키는779개다. 신규137키는27개 비KO/EN 언어마다 작성해3,699개이며, EN137개는 원본 레지스트리에서 생성한다. 전체 UI 보완 파일의 작성 수는 MAIN13,300 + EXTRA1,782 + 성장3,699 = 18,781개다. 기존 기본 카탈로그와 캐릭터 자막은 이 수에 포함하지 않는다.

| 항목 | 계약 |
|---|---|
| 원본 | `localization/ui-growth-source.json` |
| 언어별 원본 | `localization/ui-growth/<code>.json`, 27파일×137키 |
| 수집 | `t(ko,en)`, `row(ko,en,...)`, `{ko,en}`, 설명 배열 `[ko,en]`, 필터 배열 `[id,ko,en]` |
| 계획 안내 | 변경은 적용 버튼을 눌러야 저장됨. 닫기는 미적용 계획 취소. 탐색·계획은 실제 포인트를 쓰지 않음 |
| 경계 조건 | 적 HP≥70%, 적 HP≤30%, 자신 HP≤30%를 서로 구별 |
| 효과 안내 | 피해 가산 묶음, 흡수율의 DOT 절반 적용, 관통95% 상한, MP비용 감소60% 상한을 원문대로 보존 |
| UI 방향 | 아랍어 RTL, 숫자·조작 그룹 LTR. 긴 상세 이름 `overflow-wrap:anywhere` |
| 투자 안내 배치 | 인체형 트리에5능력치와26패시브를 통합. 별도 상단 배분판은 표시하지 않으며 선택한 능력치의 상세에서 SP 투자/환불한다. 상단 도구 모음은 전투 능력치 버튼·×1/×10·확대/축소/100%복귀. [현행 UI 계약](../3.1%20ui%20hud%20디자인/능력치_패시브_개편_20260909.md) |
| 인체형 UI 조작 검증 | `tools/verify-localized-growth.py --width 1280 --height 720`: 29언어×55상태=1,595상태 PASS. 실제 SP/AP 계획·적용·환불·닫기 취소·잔고 부족·상한·필터 검사. 제목/안내 및 경로 제목/전체 버튼 겹침, 번역 누락, 가로 넘침, 페이지 오류0. 결과 `tmp/localization_qa/growth-interactions-final-1280.json`. 슬롯 API 대체·저장 stub으로 사용자 저장 데이터 격리. |
| 패시브 검색 | 5능력치와26패시브를 함께 검색하며 기본 결과 수는31/31. 현재 언어의 이름·설명·전체 효과 라벨과 한국어·영문 이름/설명/효과 및 내부 ID를 검색한다. 패시브 설명은 `t(d.desc,d.descEn)`, 능력치 설명은 `t(def.desc,def.descEn)`, 효과는 `t(r.ko,r.en)`을 검색 대상에 포함하며 앞뒤 공백과 대소문자는 무시한다. 선택한 경로와 전체/습득/변경 중 필터를 함께 적용한다. |
| 검색 회귀 | `test/localizedGrowthSearch.test.js`: 실제 패널 DOM·렌더러와 독일어 카탈로그로 효과 `MP-Kostensenkung`, 설명 `Zaubertempo`, 한국어/영문 이름·ID, 경로 필터·검색 없음·검색 해제를 확인한다. 게임과 저장 API는 실행하지 않는다. 기본 Playwright Chromium 또는 `GROWTH_TEST_BROWSER_CHANNEL=chrome`으로 실행한다. 신규 검색 4건과 기존 `test/growthRemaster.test.js` 8건, 총 12건 통과. |
| 자동 검증 | 29언어×43상태=1,247, 한국어 잔류0·가로 넘침0·페이지 오류0. 접근성용1px 숨김 레이블은 넘침 제외 |
| 검토 수준 | 통합 담당의 원문·토큰·수치 대조. 독립 검토·출시용 원어민 감수 완료로 표기하지 않음 |
| 후속 검수 도구 | `tools/verify-localized-growth.py`: `server.cjs:3333` 사용. `--width` 기본1280, `--height` 기본720. 언어별 적용·환불·닫기취소·잔고부족·레벨상한·경로/습득/변경 중 필터·검색 없음·문구/넘침/겹침 검사. 슬롯 API를 대체하고 저장 함수를 stub 처리한다. 결과 `tmp/localization_qa/growth-interactions-final-<width>.json`, ms/el/ar 화면 `growth-reviewed-<code>-<width>.png` |
| 이전 카드 UI 검증 이력 | 인체형 전환 전에 검색/성장12건과 번역13건 PASS,1280×720/1920×1080에서29언어×55상태씩 검사했다. 현재 인체형 UI의 재검증은 위1,595상태 행과 `captures/passive_body_tree_20260909/report.json`의7개 화면 조합을 따른다. 같은 이름의1280결과파일은 최신 인체형 검사로 갱신됐다. 종료 전 `growth-interactions-final.json` 및 기존43상태 검사는 과거 증거다. |

화면 검사는26패시브의 상세,5기본 속성,6경로,계획 추가/취소·전체환불·검색없음을 포함한다. `tmp/localization_qa/growth-final.json` 및 `growth_final_<code>.png`에 로컬 검사 산출물을 남겼다. 사용자 저장 API는 검사에서 대체하고 페이지 메모리만 사용했다.

## 등록 문구

| ID | 한국어 키 | 영어 기준 |
|---|---|---|
| growth-000 | 맹공과 반격 | Assault |
| growth-001 | 근접 압박 · 기동 · 패링 · 분노 | Melee pressure · mobility · parry · rage |
| growth-002 | 비전과 마력 | Arcana |
| growth-003 | 마법 연사 · 마나 유지 · 에너지 쉴드 | Spell casting · mana sustain · energy shield |
| growth-004 | 탄도와 약점 | Precision |
| growth-005 | 투사체 · 관통 · 치명타 · 연속 명중 | Projectiles · pierce · critical hits · sustained hits |
| growth-006 | 침식과 사냥 | Hunt |
| growth-007 | 지속 피해 · 선제 공격 · 마무리 | Damage over time · opening strikes · execution |
| growth-008 | 생존과 회복 | Survival |
| growth-009 | 피해 흡수 · 자원 순환 · 방어 | Damage absorption · resource recovery · defense |
| growth-010 | 인간과 악마 | Fate |
| growth-011 | 생존의 대가 · 부활 · 전리품 | Survival tradeoffs · revival · rewards |
| growth-012 | 공통 피해 기여 | Shared damage contribution |
| growth-013 | ST 비용 감소 | ST cost reduction |
| growth-014 | 사슬 사거리 | Chain range |
| growth-015 | 기동게이지 회복 | Mobility gauge recovery |
| growth-016 | 카운터 피해 | Counter damage |
| growth-017 | E 공격속도 | E attack speed |
| growth-018 | 무지개탄 피해 감소 | Rainbow damage reduction |
| growth-019 | 마법 피해 | Magic damage |
| growth-020 | MP 비용 감소 | MP cost reduction |
| growth-021 | 시전속도 배율 | Cast speed multiplier |
| growth-022 | 투사체 피해 | Projectile damage |
| growth-023 | 석궁 공격속도 | Crossbow attack speed |
| growth-024 | 석궁 사거리 | Crossbow range |
| growth-025 | 석궁 ST 비용 감소 | Crossbow ST cost reduction |
| growth-026 | 보호막 흡수율 | Shield absorption |
| growth-027 | HP / ST 재생 | HP / ST regeneration |
| growth-028 | 물약 쿨다운 감소 | Potion cooldown reduction |
| growth-029 | 패링 회복량 | Parry recovery |
| growth-030 | 치명타 확률 | Critical chance |
| growth-031 | 치명타 피해 | Critical damage |
| growth-032 | 아이템 드롭률 | Item drop rate |
| growth-033 | 기본 관통 확률 | Base pierce chance |
| growth-034 | 기본 관통 횟수 | Base pierce count |
| growth-035 | 관통 후 피해 유지 | Damage retained after piercing |
| growth-036 | MP / 쉴드 재생 | MP / shield regeneration |
| growth-037 | 쉴드 쿨다운 감소 | Shield cooldown reduction |
| growth-038 | 자동쇠뇌 피해 | Auto crossbow damage |
| growth-039 | 자동쇠뇌 공격속도 | Auto crossbow attack speed |
| growth-040 | 근접 피해 | Melee damage |
| growth-041 | 기본 HP 배율 기여 | Base HP contribution |
| growth-042 | 물리 ST 비용 감소 | Physical ST cost reduction |
| growth-043 | 약점노출 최대 중첩 | Maximum weakness stacks |
| growth-044 | 중첩당 받는 피해 증가 | Damage taken per stack |
| growth-045 | 적 HP 70% 이상 피해 | Damage vs enemies at 70%+ HP |
| growth-046 | 상시 회복력 | Unconditional recovery |
| growth-047 | 적 HP 30% 이하 피해 | Damage vs enemies at 30%- HP |
| growth-048 | 내 HP 30% 이하 회복 | Recovery at 30%- HP |
| growth-049 | 내 HP 30% 이하 이동속도 | Move speed at 30%- HP |
| growth-050 | 지속 피해 | Damage over time |
| growth-051 | 지속 시간 | Duration |
| growth-052 | 축적률 | Buildup |
| growth-053 | 최대 MP | Maximum MP |
| growth-054 | MP 재생 | MP regeneration |
| growth-055 | 최대 ST | Maximum ST |
| growth-056 | ST 재생 | ST regeneration |
| growth-057 | 악의 획득량 | Malice gained |
| growth-058 | 최대 HP | Maximum HP |
| growth-059 | 물리 방어 | Physical defense |
| growth-060 | 정예 / 보스 추가 피해 | Elite / boss bonus damage |
| growth-061 | 부활 확률 감소 | Revival chance reduction |
| growth-062 | 최대 HP / MP / ST 각각 | Maximum HP / MP / ST each |
| growth-063 | 부활 확률 | Revival chance |
| growth-064 | 기본 부활 쿨다운 | Base revival cooldown |
| growth-065 | 분노 최대치 | Maximum rage |
| growth-066 | 분노 피해 계수 | Rage damage scaling |
| growth-067 | 공통 합연산 피해 묶음에 더해집니다. 최종 피해 배율은 다른 패시브·장비와 함께 계산됩니다. | Added to the shared additive damage pool; final damage also depends on other passives and gear. |
| growth-068 | 무지개탄 감소는 Lv5에서 상한에 도달합니다. 무지개탄 패링은 Q만 가능합니다. | Rainbow damage reduction caps at rank 5. Only Q can parry rainbow shots. |
| growth-069 | 시전속도 기본 배율은 ×2입니다. MP 비용 감소는 장비를 포함해 최대 60%입니다. | Base cast speed is ×2. MP cost reduction caps at 60% including gear. |
| growth-070 | 지속 피해에는 흡수율의 절반이 적용됩니다. | Damage over time uses half the absorption rate. |
| growth-071 | 기본 투사체 기준입니다. 일부 스킬은 자체 관통 공식을 사용합니다. 장비 포함 기본 관통 확률 상한 95%. | Base projectile values. Some skills use their own pierce rules. Base chance caps at 95% including gear. |
| growth-072 | 직접 명중마다 중첩. 빔은 4틱마다 1중첩. 초당 20% 감소, 5초 미명중 시 초기화. DOT·장판 제외. | Stacks on direct hits; beams add one per four ticks. Decays 20% per second, resets after five seconds without hits. Excludes DoT and ground effects. |
| growth-073 | 추가 피해는 적의 HP 조건입니다. 회복력 증가는 항상 적용됩니다. | Damage bonus checks enemy HP. Recovery is always active. |
| growth-074 | 성장과 자원을 얻는 대신 부활 확률을 잃습니다. 악마성과 함께 투자하면 부활 효과가 상쇄될 수 있습니다. | Gain damage and resources at the cost of revival chance. Humanity can offset Demon investment. |
| growth-075 | 부활 성공 시 HP·MP·ST를 전부 회복합니다. 실제 확률은 레벨·장비·인간성을 함께 계산하며 0~100%입니다. 기본 쿨다운 최저 100초. | Successful revival restores all HP, MP and ST. Actual chance includes level, gear and Humanity, clamped to 0–100%. Base cooldown has a 100-second floor. |
| growth-076 | 물리 공격력 | Physical attack |
| growth-077 | 기본 최대 HP | Base maximum HP |
| growth-078 | HP 재생 | HP regeneration |
| growth-079 | 석궁 공격력 | Crossbow attack |
| growth-080 | 공격속도 | Attack speed |
| growth-081 | 마법 공격력 | Magic attack |
| growth-082 | 최대 에너지 쉴드 | Maximum energy shield |
| growth-083 | 물리 / 속성 방어 기여 | DEF / eDEF contribution |
| growth-084 | 초 | s |
| growth-085 | EXODUSER · 캐릭터 성장 | EXODUSER / CHARACTER |
| growth-086 | 성장의 각인 | Sigils of Ascension |
| growth-087 | 힘을 벼리고, 당신의 길을 새기세요. | Temper your strength. Inscribe your path. |
| growth-088 | 계획 후 SP | SP AFTER PLAN |
| growth-089 | 계획 후 AP | AP AFTER PLAN |
| growth-090 | 투자량 · 1포인트 = 1 SP | Allocated points · 1 point = 1 SP |
| growth-091 | 전투의 길 | COMBAT PATHS |
| growth-092 | 패시브 분석 | PASSIVE INSIGHT |
| growth-093 | {n}개 변경 대기 · 적용 전에는 저장되지 않습니다. | {n} pending changes · Not saved until applied. |
| growth-094 | 자유롭게 배분하고, 적용하세요. 창을 닫으면 미적용 계획은 취소됩니다. | Plan freely, then apply. Closing discards unapplied changes. |
| growth-095 | 전체 환불 계획 | Plan full refund |
| growth-096 | 닫기 [J] | Close [J] |
| growth-097 | 현재 전투 능력치 ↗ | Current combat stats ↗ |
| growth-098 | 닫기 | Close |
| growth-099 | 현재 전투 능력치 | Current combat stats |
| growth-100 | 변경 적용 | Apply changes |
| growth-101 | 계획 취소 | Discard plan |
| growth-102 | 현재 적용된 자원 | LIVE RESOURCES |
| growth-103 | 이름 · 효과 · 영문명 검색 | Search name or effect |
| growth-104 | HP / MP / ST 각각 +1 · 물리/속성 방어 +0.5 | HP / MP / ST +1 each · DEF / eDEF +0.5 |
| growth-105 | 계획에 추가 | Add to plan |
| growth-106 | 환불 계획 | Plan refund |
| growth-107 | 투자 상한 | Allocation cap |
| growth-108 | 무제한 | Uncapped |
| growth-109 | 전체 | All |
| growth-110 | 6개의 길 · 서로 조합 가능한 26개 패시브 | 6 paths · 26 freely combinable passives |
| growth-111 | 일치하는 패시브가 없습니다. 검색 또는 필터를 바꿔보세요. | No matching passives. Try another search or filter. |
| growth-112 | 투자 레벨 | ALLOCATED RANK |
| growth-113 | 패시브 기여 | PASSIVE CONTRIBUTION |
| growth-114 | 현재 | NOW |
| growth-115 | 계획 | PLAN |
| growth-116 | 다음 | NEXT |
| growth-117 | 다른 패시브와 함께 투자할 수 있습니다. 표는 이 패시브의 기여이며, 최종 전투 능력치는 장비·조건에 따라 달라집니다. | Combine with other passives. These are this passive’s contributions; final combat stats depend on gear and conditions. |
| growth-118 | 인간성과 악마성에 함께 투자 중입니다. 부활 확률을 확인하세요. | Humanity and Demon are both allocated. Check your revival chance. |
| growth-119 | 최대 레벨 | Maximum rank |
| growth-120 | 계획에 추가 · {n} AP | Add to plan · {n} AP |
| growth-121 | 1레벨 환불 계획 | Plan rank refund |
| growth-122 | 레벨 상한에 도달했습니다. | Rank cap reached. |
| growth-123 | AP {n} 부족 | Need {n} more AP |
| growth-124 | 추가 후 계획 잔여 AP {n} | {n} AP left after adding |
| growth-125 | 변경 {n}개 · 하단에서 적용 | {n} changes · Apply below |
| growth-126 | 탐색과 계획은 포인트를 소모하지 않습니다. | Browsing and planning do not spend points. |
| growth-127 | 능력치 분석 | ATTRIBUTE INSIGHT |
| growth-128 | 직접 투자량 | ALLOCATED POINTS |
| growth-129 | 투자분의 기본 기여 | BASE CONTRIBUTION |
| growth-130 | 직접 투자한 능력치의 기본 기여입니다. 레벨·장비·패시브 배율은 전투 능력치에 합산됩니다. 재생은 초당 기준이며, 근성 방어는 전체 근성을 합산한 뒤 내림합니다. | Base contribution from allocated points. Level, gear and passive multipliers are included in combat stats. Regeneration is per second; GRIT defense rounds down after total GRIT is summed. |
| growth-131 | 계획에 추가 · {n} SP | Add to plan · {n} SP |
| growth-132 | {n}포인트 환불 계획 | Plan {n}-point refund |
| growth-133 | SP 또는 투자 상한을 확인하세요. | Check SP and the allocation cap. |
| growth-134 | 추가 후 계획 잔여 SP {n} | {n} SP left after adding |
| growth-135 | 습득 | Learned |
| growth-136 | 변경 중 | Pending |
