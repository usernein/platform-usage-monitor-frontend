# Contribution Guide

## Purpose

Build a clear, professional frontend for an education platform that monitors application usage goals. Prioritize a functional user experience, readable code, explicit API contracts, and an implementation that is easy to explain in a technical interview.

## Scope

This repository contains the frontend only. Do not add backend services, database configuration, Docker infrastructure, server-side migrations, or API implementation here. Treat the backend as an external REST API and keep its base URL configurable through environment variables.

## Principles

- Preserve the existing React, Vite, TypeScript, and Mantine stack when it meets the need.
- Use strict TypeScript; do not introduce `any`.
- Prefer small files, explicit names, and incremental changes over premature abstractions.
- Keep API communication and caching separate from presentational components.
- Validate and normalize user-provided filter values before sending requests.
- Handle loading, error, and empty states explicitly for every data-driven screen.
- Do not expose implementation details that are irrelevant to product users.

## Suggested Frontend Structure

Keep the structure simple and evolve it only as needed:

```text
src/
  api/          API client and response contracts
  components/   Reusable presentational components
  features/     Dashboard and user-usage feature modules
  hooks/        Query and UI hooks
  pages/        Route-level components
  types/        Shared TypeScript types
```

Use TanStack Query for server-state fetching, caching, and request states when it is introduced. Use React Router only when navigation between the dashboard and a user detail page requires it.

## Domain Presentation

- Usage plans apply to an institution, application, user profile, and frequency.
- A user meets a goal when their access count is at least the configured minimum in the selected period.
- The dashboard must make filters, eligibility, goal status, access counts, and adherence percentage easy to understand.
- Dates should be displayed consistently in the user locale while API requests use the documented ISO date format.

## Verification

After each relevant change, run the checks available for the affected scope: lint, typecheck, tests, and production build. Fix failures before proceeding. Prioritize meaningful tests for dashboard states, filters, API request behavior, and user navigation over superficial coverage.

## Documentation

Keep the README accurate for frontend setup, environment variables, available scripts, API integration, UI decisions, known limitations, and future scaling considerations. The AI-usage section must contain factual, reviewable information supplied by the author; do not invent usage history.
