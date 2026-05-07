# Common Agent Prompt Rules

> 모든 role 의 dispatch prompt 에 inject 되는 공통 규칙. `/agent-all` 이 자동 prepend.

## Apply to MAIN repo
- Main repo path: `C:\Users\kinso\Documents\molcube\work-manager` (worktree 작업 중이면 worktree path)
- DO NOT write to other agent's worktree path
- DO NOT write outside the cwd

## Scope
- Owns: `<OWNED_FILES>`
- DO NOT touch: `<FORBIDDEN_FILES>` (다른 parallel agent 의 owned)

## Constraints
- Keep existing public APIs stable
- Add tests alongside implementation (`make test`)
- Single commit: `<TYPE>(<SCOPE>): <imperative summary> (Task <N> <ROLE>-W<WAVE>)`
- DO NOT use `--no-verify`, `--amend`, force push (사용자 명시 요청 없이)

## Reporting
- 완료 시 200 단어 이내 보고: 변경 file:line + test 결과 + 의문점
- Trust-but-verify 대비: agent 가 "done" 이라 해도 caller 가 git log + test rerun 으로 검증
