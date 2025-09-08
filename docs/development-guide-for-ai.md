# Sister Hair Salon Reservation - CLI Development Guide

This document provides coding conventions, workflows, and rules for automation.

---

## Branch Strategy
- `main`: production branch
- `develop`: integration branch
- `feature/*`: new features
- `bugfix/*`: bug fixes
- `hotfix/*`: urgent fixes

---

## Commit Message Format
type(scope): subject

body

footer

---

**Types:**
- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting / style changes
- refactor: code refactoring
- test: test related changes
- chore: misc tasks

---

## Development Workflow
1. Select a high-priority task from `docs/todo/`
2. Read `Requirements`, `Dependencies`, `TODO` in the `.md` file
3. Create branch from `develop`
4. Implement according to coding conventions
5. Run Playwright checks:
    - UI rendering
    - Functionality
    - Responsive layout
    - Accessibility
    - Console errors
6. Fix all issues found
7. Move completed `.md` → `docs/completed/`
8. Update:
    - `docs/README.md`
    - `docs/FEATURE_SUMMARY.md`
9. Commit and push changes

---

## Code Review Checklist

**General**
- [ ] Meets requirements
- [ ] No performance issues
- [ ] No security issues
- [ ] Includes tests

**Client**
- [ ] TypeScript types accurate
- [ ] Reusable components
- [ ] Accessibility considered
- [ ] Responsive design applied

**Server**
- [ ] Proper error handling
- [ ] Consistent API responses
- [ ] Input validation included
- [ ] Logging configured

---

## Testing Guide

**Client**
- Test form validation
- Test component rendering
- Test event handling

**Server**
- Test API endpoints with valid/invalid data
- Ensure correct status codes
- Validate response format

---

## Deployment Checklist
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Error logging enabled
- [ ] Monitoring configured

---

## Optimization Rules

**Client**
- Use React.memo, useMemo, useCallback
- Optimize images
- Apply code splitting

**Server**
- Use compression middleware
- Apply caching strategy
- Optimize DB queries
- Reduce API payload size

---

**Last Updated:** 2025-09-06  
**Version:** 1.2.0
