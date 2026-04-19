# Contributing to LeapIQ

Thank you for your interest in contributing to LeapIQ. This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch from `main`
4. Set up your development environment (see [Development Guide](docs/development.md))

## Development Workflow

### Branch Naming

Use descriptive branch names with a prefix:

- `feature/` -- New features (e.g., `feature/classroom-mode`)
- `fix/` -- Bug fixes (e.g., `fix/sr-box-reset`)
- `refactor/` -- Code refactoring (e.g., `refactor/adaptive-engine`)
- `docs/` -- Documentation updates (e.g., `docs/api-examples`)

### Commit Messages

Write clear, concise commit messages:

- Use the present tense ("Add feature" not "Added feature")
- First line under 72 characters
- Reference issue numbers when applicable

### Pull Requests

1. Update documentation if your changes affect the API or user-facing behavior
2. Ensure `npm run lint` passes with no errors
3. Ensure `npm run build` completes successfully
4. Test with at least two different grade levels to verify age-appropriate behavior
5. Describe what changed and why in the PR description
6. Request review from at least one team member

## Code Standards

- **TypeScript** -- No `any` types without justification
- **Server Components by default** -- Only use `"use client"` when necessary
- **API routes must have try-catch** -- With descriptive, safe error messages
- **Never expose API keys** -- In error responses or client-side code
- **Age-appropriate content** -- All AI-generated content must be suitable for the target grade level
- **Growth-mindset language** -- Encourage effort and learning, not just correctness

## Content Guidelines

LeapIQ serves students from Pre-K through College. All content and AI prompts must:

- Use vocabulary appropriate for the target grade level
- Align to state educational standards
- Include Bloom's Taxonomy level tagging
- Be encouraging and supportive
- Avoid jargon unless grade-appropriate

## Reporting Issues

When reporting bugs, include:

- Steps to reproduce
- Expected vs. actual behavior
- Grade level and subject being tested
- Browser and OS information
- Console errors or screenshots if applicable

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

JMCB Technology Group
