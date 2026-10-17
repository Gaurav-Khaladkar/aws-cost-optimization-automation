# Git Commit Standards

When committing changes in any project, always structure commit messages with a clear change type:

1. **Conventional Commit Prefixes**:
   - `fix:` for fixing bugs, runtime errors, or linter / compatibility warnings (e.g., `fix(css): add standard background-clip and appearance properties`).
   - `feat:` for new user-facing features, API endpoints, or UI additions.
   - `style:` for styling, CSS enhancements, visual polish, spacing, or formatting with no logic changes.
   - `docs:` for README updates, architecture diagrams, comments, or documentation files.
   - `refactor:` for restructuring or cleaning code without changing functionality or fixing bugs.
   - `perf:` for code changes that improve performance or reduce resource consumption.
   - `test:` for adding missing unit/integration tests or updating existing test suites.
   - `chore:` for repo maintenance, package dependencies, environment configs, or scripts.

2. **Commit Message Format**:
   - `<type>(<scope>): <concise, active-voice summary of changes>`
   - Scope is recommended whenever changes target a specific subsystem or file (e.g., `css`, `api`, `docs`, `config`).
   - Clearly describe what was modified and why.
