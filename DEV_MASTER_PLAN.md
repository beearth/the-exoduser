# 👹 HELL Project - Master Development Plan (Shared)

이 파일은 **Antigravity**와 **Claude Code**가 협업하여 게임 '지옥 (Hell)'을 **Unity URP**로 마이그레이션하고 개발하기 위한 마스터 가이드입니다.

## 1. 프로젝트 개요 (Project Overview)
- **장르**: 2D 로그라이트 액션 RPG (HD-2D 스타일)
- **컨셉**: 지옥에서 살아남는 처절한 액션. '악의'를 자원으로 사용하는 독특한 생존 시스템.
- **목표**: **스팀(Steam)** 출시 수준의 퀄리티 확보 (Unity) + **웹 브라우저 버전** 유지보수 및 업데이트 (Legacy JS). 
- **전략**: 두 버전을 병행 개발하여 웹에서의 피드백을 유니티 버전에 즉각 반영하는 'Dual-Track' 시스템 구축.
- **주요 캐릭터**: **Exoduser** (금발 수염, 흑철 갑옷, 불꽃 망토의 베테랑 전사)

## 2. 핵심 로직 규칙 (Core Logic Rules)
(중략 - 마이그레이션 시 동일하게 적용)

## 3. 기술 스택 (Tech Stack)
- **Track A (Legacy)**: Vanilla JS / HTML5 Canvas (`game.html`) - 라이브 업데이트 및 실험용
- **Track B (Unity)**: **Unity 2022.3+ (Universal Render Pipeline)** - 최종 스팀 출시용
- **특징**: 로직은 최대한 동기화하며, 비주얼과 성능은 유니티에서 극대화.

## 4. 협업 가이드 (Collaboration Guide)
- **Antigravity**: 핵심 설계, C# 로직 포팅, 마스터 플랜 관리 및 아티팩트 업데이트.
- **Claude Code**: 기능 구현 보조, 상세 에셋 설정, 유니티 에디터 내 작업 지원.
- **공유 파일**: `DEV_MASTER_PLAN.md`, `UnityProject/Assets/Scripts/CoreStats.cs`

## 5. 현재 작업 상태 (Current Tasks)
1. **[진행중]** Unity 핵심 스탯 및 시스템 기반 구축 (`CoreStats.cs`)
2. **[예정]** `PlayerController.cs` 이식 및 Exoduser 스프라이트 세팅
3. **[예정]** `DamageHandler.cs` (그로기/데미지 공식) 구현
4. **[예정]** 유니티 URP 환경 조명 및 포스트 프로세싱 설정

---
*이 플랜은 개발 진행 상황에 따라 수시로 업데이트됩니다.*
