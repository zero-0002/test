# Block Drop — Tetris (vanilla JS)

A small Tetris clone built with HTML5 Canvas and plain JavaScript. No framework, no build step — open `index.html` or serve the folder statically.

## Play

1. Open `index.html` in a browser, or run a static server:
   ```bash
   npx --yes serve .
   ```
2. Controls:
   - ← → move
   - ↓ soft drop
   - ↑ rotate (with wall kicks)
   - Space hard drop
   - Enter / Space after game over to restart
   - Restart button resets the run

## Features

- Next-piece preview
- Level speed-up every 10 lines
- Soft-drop / hard-drop scoring
- Wall-kick rotation near edges
- Unit-tested core logic (`rotate`, `collide`, `sweep`, scoring)

## Develop

```bash
npm test
```

CI runs the same suite on every push and pull request (see `.github/workflows/ci.yml`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Prefer small PRs with a clear purpose; open an issue first for larger gameplay changes.
