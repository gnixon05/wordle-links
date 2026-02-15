# CLAUDE.md — AI Assistant Guide for wordle-links

## Project Overview

**wordle-links** is a golf-themed Wordle game. The project is in its initial stage — only a README and LICENSE (CC0 1.0 / public domain) exist. No source code, build tooling, or dependencies have been set up yet.

## Repository Structure

```
wordle-links/
├── CLAUDE.md        # This file — AI assistant guidance
├── LICENSE          # CC0 1.0 Universal (public domain)
└── README.md        # Project description
```

## Current State

The repository contains no application code, configuration, or tooling. Any work on this project will involve bootstrapping from scratch. When initializing the project, consider:

- **Game concept**: A Wordle-style word-guessing game with a golf theme (golf terminology as target words)
- **License**: CC0 1.0 — public domain, no restrictions on use

## Development Guidelines

### Getting Started

Since the project has no code yet, the first step for any implementation work is to:

1. Choose a frontend framework and initialize the project (e.g., `npm create vite@latest`)
2. Set up a `package.json` with appropriate scripts (`dev`, `build`, `test`, `lint`)
3. Configure TypeScript, linting (ESLint), and formatting (Prettier)
4. Add a `.gitignore` appropriate for the chosen tooling

### Conventions to Follow

- Keep the game client-side only (no backend needed for a Wordle clone)
- Use semantic, descriptive variable and function names
- Write tests for game logic (word validation, guess evaluation, win/loss conditions)
- Separate game logic from UI rendering so logic can be tested independently
- Use conventional commits for commit messages (e.g., `feat:`, `fix:`, `chore:`)

### Git Workflow

- Default branch: `master`
- Create feature branches for new work
- Write clear, descriptive commit messages

## Key Domain Concepts

- **Wordle mechanics**: Player guesses a 5-letter word; each guess reveals which letters are correct (right position), present (wrong position), or absent
- **Golf theme**: Target words and UI should incorporate golf terminology and aesthetics (e.g., words like BIRDY, EAGLE, DRIVE, GREEN, WEDGE, BOGEY, LINKS, PUTTS)
