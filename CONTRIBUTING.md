# Contributing to Obsidian Countdown Timer

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (included with Node.js)
- An [Obsidian](https://obsidian.md) vault for testing

### Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/obsidian-countdown.git
   cd obsidian-countdown
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development mode:
   ```bash
   npm run dev
   ```

4. To build and install the plugin in your vault for testing:
   ```bash
   ./scripts/install.sh /path/to/your/vault        # macOS / Linux
   .\scripts\install.ps1 C:\path\to\your\vault     # Windows (PowerShell)
   ```

   To remove it again (deletes the plugin folder and its `community-plugins.json` entry):
   ```bash
   ./scripts/uninstall.sh /path/to/your/vault      # macOS / Linux
   .\scripts\uninstall.ps1 C:\path\to\your\vault   # Windows (PowerShell)
   ```

## Development Workflow

### Test-Driven Development (TDD)

All changes must follow test-driven development:

1. **Write failing tests first** before implementing new functionality
2. **Run tests** to confirm they fail for the expected reason
3. **Implement the minimum code** to make tests pass
4. **Refactor** while keeping tests green

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development with esbuild watch mode |
| `npm run build` | Production build (type-check + bundle) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

To run a single test file:
```bash
npx jest tests/parsers/duration-parser.spec.ts
```

## Project Structure

```
src/
├── main.ts                 # Plugin entry point
├── types.ts                # TypeScript type definitions
├── parsers/
│   ├── config-parser.ts    # YAML configuration parser
│   ├── duration-parser.ts  # Duration string parser (1h30m)
│   └── datetime-parser.ts  # Date/time parser (ISO, natural language)
├── formatters/
│   └── timer-formatter.ts  # Time display formatter
└── components/
    └── timer-renderer.ts   # UI renderer for countdown display

tests/                      # Test files (mirrors src/ structure)
```

### Architecture Overview

1. **Parsing Pipeline**: User input flows through `config-parser.ts`, which delegates to specialized parsers (`duration-parser.ts`, `datetime-parser.ts`)

2. **Type-Safe Error Handling**: All parsers return discriminated unions with `valid: true/false` pattern

3. **Formatting**: `timer-formatter.ts` converts milliseconds to display strings using strftime-style format codes

4. **Rendering**: `timer-renderer.ts` creates the DOM elements and manages the update interval

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-notification-sound`
- `fix/duration-parsing-edge-case`
- `docs/update-readme`

### Commit Messages

Write clear, concise commit messages:
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Fix bug" not "Fixes bug")
- Keep the first line under 72 characters

### Pull Requests

1. Create a new branch from `master`
2. Make your changes following TDD
3. Ensure all tests pass: `npm run test`
4. Ensure no lint errors: `npm run lint`
5. Ensure type checking passes: `npm run build`
6. Submit a pull request with a clear description of the changes

All pull requests must pass CI checks before merging.

## Releasing

Releases are cut from `master` by CI:

1. On a branch, run `npm run release -- <major|minor|patch>`. This bumps `package.json`, `package-lock.json`, `manifest.json` and `versions.json` together and commits them as `chore: update version to X.Y.Z`.
2. Open a pull request and merge it once CI is green.
3. The `Release` workflow runs on any push to `master` that changes `manifest.json`. It builds the plugin and publishes a GitHub release named after the `manifest.json` version (skipped if that release already exists), attaching `main.js`, `manifest.json` and `styles.css`.

## Security

See [docs/security/threat-model.md](docs/security/threat-model.md). Every pull request description should include one line: `Threat model: no impact` or `Threat model: updated (IDs)`.

## Code Style

- Follow the existing code style
- Use TypeScript strict mode
- Prefer explicit types over inference for function signatures
- Use descriptive variable and function names

## Reporting Issues

When reporting issues, please include:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Obsidian version
- Plugin version

## Questions?

Feel free to open an issue for questions or discussions about potential contributions.