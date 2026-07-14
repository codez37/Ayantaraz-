---
name: code-quality-audit
description: Perform comprehensive code quality audits including linting, type checking, test coverage, and best practice compliance
license: MIT
compatibility: Vibe Work
user-invocable: true
allowed-tools:
  - read_file
  - write_file
  - search_replace
  - bash
  - run_typescript
  - github_app
---

# Code Quality Audit Skill

## Purpose
This skill performs comprehensive code quality audits to ensure code meets production standards.

## When to Use
- Before code reviews
- Before merging to main/develop branches
- When setting up new projects
- When troubleshooting quality issues

## Audit Checklist

### 1. Linting Analysis
- ESLint configuration exists and is properly configured
- ESLint rules cover all important aspects
- Prettier configuration exists for code formatting
- No linting errors in the codebase
- Consistent code style across all files

### 2. Type Checking Analysis
- TypeScript configuration exists
- Type checking passes without errors
- Proper type definitions for all functions and variables
- No any types used unnecessarily
- Type guards used for runtime validation

### 3. Test Coverage Analysis
- Test files exist for all major modules
- Unit tests cover core functionality
- Integration tests cover module interactions
- E2E tests cover user journeys
- Test coverage meets minimum threshold (80%+)
- All tests pass in CI/CD

### 4. Code Structure Analysis
- Proper separation of concerns
- SOLID principles followed
- DRY principle applied (no code duplication)
- Appropriate file and folder organization
- Consistent naming conventions
- Proper error handling

### 5. Dependency Analysis
- All dependencies are up to date
- No deprecated packages used
- Dependency vulnerabilities addressed
- Proper semantic versioning used
- No unused dependencies

## Output Format

### Summary Report
# Code Quality Audit Report - [Project Name]

## Overall Quality Score: [X/100]

### Linting Status: [Status]
- Errors: [X]
- Warnings: [Y]

### Type Checking Status: [Status]
- Errors: [X]

### Test Coverage: [X%]
- Unit Tests: [X%]
- Integration Tests: [Y%]
- E2E Tests: [Z%]

### Issues Found: [X]
- Critical: [A]
- High: [B]
- Medium: [C]
- Low: [D]