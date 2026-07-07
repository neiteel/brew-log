---
name: feature
description: Manage the feature/fix lifecycle backed by plans/ files - load a spec, start building, review, test, explain, complete. Use whenever the user wants to build a new feature or fix, describes something to add or change in the app, asks what to build next, resumes interrupted work after a context clear, says a feature is done, or wants to wrap up / merge / ship - even if they phrase it conversationally and never say "feature" or type the command.
argument-hint: load|start|review|test|explain|complete
---

# Feature Workflow

Manages the full lifecycle of a feature from spec to merge.

## Working Files

@plans/current-feature.md

- `plans/current-feature.md` - the ONE feature being built right now (imported above)
- `plans/build-plan.md` - checkbox roadmap; `- [x]` done, `- [ ]` upcoming, in build order
- `plans/history/NN-name.md` - archived record of each completed feature (one file per feature)

### File Structure

current-feature.md has these sections:

- `# Current Feature` - H1 heading with feature name when active
- `## Status` - Not Started | In Progress | Complete
- `## Goals` - Bullet points of what success looks like
- `## Build Steps` - Small implementation steps as checkboxes, each with a "done when" (observable acceptance condition). Progress lives here, not in the conversation: check off each step as it's completed so a fresh session can resume from the first unchecked step
- `## Notes` - Additional context, constraints, or details from spec

## Task

Execute the requested action: $ARGUMENTS

| Action     | Description                               |
| ---------- | ----------------------------------------- |
| `load`     | Load a feature spec or inline description |
| `start`    | Begin implementation, create branch       |
| `review`   | Check goals met, code quality             |
| `test`     | Add/run unit tests for the feature        |
| `explain`  | Document what changed and why             |
| `complete` | Commit, push, merge, reset                |

See [actions/](actions/) for detailed instructions.

If no action provided, explain the available options.
