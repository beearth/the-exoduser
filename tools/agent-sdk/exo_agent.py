"""EXODUSER 개발용 대화창 — Console API 크레딧으로 Claude Code 엔진(Agent SDK)을 돌린다.

run.bat 으로 실행한다. 작업 폴더는 저장소 루트이고 CLAUDE.md 를 읽는다.
파일 수정은 자동 승인, 명령 실행(Bash)은 승인 없이 막힌다.
"""
import asyncio
import os
import sys
from pathlib import Path

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ClaudeSDKClient,
    ResultMessage,
    TextBlock,
)

ROOT = Path(__file__).resolve().parents[2]
MODEL = os.environ.get("EXO_MODEL", "claude-opus-5-5")
# 질문 하나당 예상 비용 상한(USD). 추정치라 조금 넘을 수 있다.
BUDGET_USD = float(os.environ.get("EXO_BUDGET_USD", "3"))
# 기존 claude.ai 로그인(Max 구독)을 못 보게 설정 폴더를 따로 둔다. 그래야 API 키(크레딧)로만 과금된다.
CONFIG_DIR = Path(__file__).resolve().parent / ".venv" / "claude-config"


async def main() -> None:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("ANTHROPIC_API_KEY 가 없습니다. run.bat 으로 실행하세요.")

    options = ClaudeAgentOptions(
        cwd=str(ROOT),
        model=MODEL,
        setting_sources=["project"],
        permission_mode="acceptEdits",
        max_budget_usd=BUDGET_USD,
        env={"CLAUDE_CONFIG_DIR": str(CONFIG_DIR)},
    )
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    total = 0.0
    print(f"작업 폴더: {ROOT}")
    print(f"모델: {MODEL} / 질문당 상한: ${BUDGET_USD}")
    print("요청을 입력하세요. 끝내려면 exit 또는 빈 줄에서 Ctrl+C.")

    async with ClaudeSDKClient(options=options) as client:
        while True:
            try:
                prompt = input("\n요청> ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not prompt:
                continue
            if prompt.lower() in ("exit", "quit", "종료"):
                break

            await client.query(prompt)
            async for message in client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            print(block.text)
                elif isinstance(message, ResultMessage):
                    cost = message.total_cost_usd or 0.0
                    total += cost
                    print(f"\n[{message.subtype}] 이번 ${cost:.3f} / 누적 ${total:.3f} (추정치)")

    print(f"\n종료. 이번 실행 누적 ${total:.3f} (추정치, 정확한 금액은 Console 확인)")


if __name__ == "__main__":
    asyncio.run(main())
