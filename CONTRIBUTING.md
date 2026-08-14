# Contributing

Thanks for helping maintain Block Drop.

## Workflow

1. Open an issue describing the bug or feature before large changes.
2. Branch from `master`: `git checkout -b fix/short-name`
3. Keep commits focused; run `npm test` before opening a PR.
4. Open a pull request and request a review.
5. Maintainers merge after CI is green and review comments are addressed.

## Review checklist

- [ ] `npm test` passes
- [ ] Game still playable in a browser (`index.html`)
- [ ] HUD values stay numeric (no duplicated "Score:" labels)
- [ ] No duplicated script bodies or double event listeners
- [ ] README / docs updated when behavior changes

## Good first maintenance tasks

- Resolve open issues
- Review open PRs with concrete feedback
- Add regression tests for any bug you fix
