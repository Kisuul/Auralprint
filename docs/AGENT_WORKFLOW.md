# Agent Workflow Notes

This companion file is optional guidance for humans and agents.

## Recommended task pattern

1. Read:
   - `roadmap.md`
   - `AGENTS.md`
   - relevant contract docs
   - directly affected source files

2. Restate:
   - target build or milestone
   - non-goals
   - files likely to change

3. Change:
   - smallest coherent implementation
   - preserve public contracts unless task says otherwise

4. Verify:
   - run relevant checks
   - test changed flows manually when needed
   - confirm no offline/runtime regressions

5. Report:
   - files read
   - plan
   - files touched
   - verification
   - limitations/blockers

## Typical stop reasons

- conflicting roadmap scope
- missing canonical interface docs
- failing baseline unrelated tests
- repo structure mismatch
- required runtime behavior would violate offline policy
