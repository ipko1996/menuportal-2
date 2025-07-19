# Commit Message Standards

## Conventional Commits Guidelines

- Follow the Conventional Commits specification
- Commit messages must use the format: type(scope): description
- Use one of the approved types:
  - feat for new features
  - fix for bug fixes
  - docs for documentation changes
  - style for formatting (no code changes)
  - refactor for code changes that don't add features or fix bugs
  - test for adding or updating tests
  - chore for maintenance tasks (build, dependencies, configs)
- The scope is optional but recommended; it should match the area of the codebase affected (e.g., auth, api, ui)
- The description must be short, imperative, and lowercase (e.g., "add login button", "fix validation error")
- Example commits:
  - feat(auth): add OAuth2 login support
  - fix(api): handle empty response errors
  - docs(readme): update setup instructions
  - style(button): adjust padding
  - chore(deps): update React to v18.2
