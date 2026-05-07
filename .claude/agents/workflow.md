# Agent Workflow & Gate Spec

## Gate Sequence
1. tester        → reject owner: dev (실패 test 영역별 frontend/backend 추론)
2. qa-{personaN} → reject owner: dev (페르소나별 finding 별)
3. designer      → reject owner: designer 또는 dev (designer 가 reject 사유에 명시)
4. reviewer      → reject owner: dev (file:line)
5. planner       → reject owner: ambiguity log → planner 재진입

## Reject Loop 종료 조건
- 모든 gate ✅: 종료
- 사용자 인터럽트: 종료 + resume cursor 저장 (`docs/tasks/{N}-*.md` §Progress Snapshot)
- 같은 finding ID (`F-{SCN}-{N}`) 3회 연속 reject (dev fix 후 같은 gate 가 같은 ID 재발생): ambiguity escalation (planner + 사용자)
- 외부 의존 장애 (CI/network): 사용자 결정 대기

## Ambiguity 패턴
- builder/gate 가 task doc/코드/규칙으로 해결 못 → STOP
- task doc §Ambiguity Log 에 항목 append:
  `- [{date}] {role}: {질문} | 옵션 A) ... B) ... | recommend: A | 근거: ...`
- planner 재진입 → 사용자에게 E-9 Decision Matrix 형식 질문
- 사용자 결정 → log 에 `RESOLVED: A (사용자 {date})` append → 해당 role 재dispatch

## File-Disjoint 규칙
- 같은 wave 안 builder 들은 파일 영역 분리
- 공유 파일 발생 시 sequential 강제 (한 owner 만 쓰기, 나머지 wait)
- dispatch 전 builder prompt grep 으로 owns/touches 중복 검출

## Trust-but-Verify
- gate runner 가 매 wave 후 `git log --oneline` 으로 실제 commit 검증
- agent 가 "commit 했다" / "tests pass" 보고해도 재실행으로 확인 (playbook §12.1)

## Designer Reject Schema (R9 mitigation)
designer 가 reject 시 반드시 다음 schema 로 finding 작성:
- `owner: designer | dev`        — 누가 fix 할지 명시
- `target_file: <path>`           — 영향 파일
- `change_type: spec | impl`      — design system spec 변경 vs 구현 미스
- `reason: <설명>`
