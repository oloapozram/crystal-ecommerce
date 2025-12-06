# Superpowers Skills for Claude Web

This directory contains all the superpowers skills that can be used in both Claude CLI and Claude web.

## How to Use in Claude Web

When using Claude web with this repository, you can invoke skills by referencing them in your prompts.

### Method 1: Direct Skill Reference
Tell Claude to use a specific skill:

```
Use the brainstorming skill to help me design the cart feature
```

```
Use the systematic-debugging skill to find why the cart isn't updating
```

```
Use the executing-plans skill to implement the shopping cart plan
```

### Method 2: Skill File Reference
Reference the skill file directly:

```
Read and follow .claude/skills/test-driven-development/SKILL.md to implement this feature
```

```
Apply the process in .claude/skills/systematic-debugging/SKILL.md to debug this issue
```

### Method 3: Project Settings
Add this to `.claude/settings.json` to enable automatic skill detection:

```json
{
  "superpowers": {
    "enabled": true,
    "required_skills": [
      "using-superpowers",
      "brainstorming",
      "writing-plans",
      "executing-plans",
      "subagent-driven-development",
      "test-driven-development",
      "systematic-debugging",
      "verification-before-completion",
      "requesting-code-review"
    ],
    "workflow_rules": [
      "Always use brainstorming skill before coding new features",
      "Use TDD for all business logic",
      "Use systematic-debugging for any bugs or test failures",
      "Request code review before merging major features"
    ]
  }
}
```

## Available Skills

### Core Workflow Skills
- **using-superpowers** - Start here! Establishes mandatory workflows
- **brainstorming** - Refine ideas into designs before coding
- **writing-plans** - Create detailed implementation plans
- **executing-plans** - Execute plans task-by-task with checkpoints
- **subagent-driven-development** - Execute plans with fresh subagents per task

### Development Skills
- **test-driven-development** - RED-GREEN-REFACTOR cycle
- **systematic-debugging** - Root cause investigation before fixes
- **verification-before-completion** - Evidence before claiming success
- **requesting-code-review** - Dispatch code reviewer subagent
- **receiving-code-review** - Handle review feedback properly

### Advanced Skills
- **root-cause-tracing** - Trace bugs backward through call stack
- **defense-in-depth** - Validate at multiple layers
- **condition-based-waiting** - Replace timeouts with condition polling
- **testing-anti-patterns** - Avoid common testing mistakes
- **using-git-worktrees** - Isolated development environments
- **finishing-a-development-branch** - Complete and merge work
- **dispatching-parallel-agents** - Handle independent failures concurrently

### Skill Development
- **writing-skills** - Create new skills with TDD
- **testing-skills-with-subagents** - Verify skills work under pressure
- **sharing-skills** - Contribute skills upstream via PR

## Workflow Example

```
# 1. Start every session
"I'm using the using-superpowers skill"

# 2. Design before coding
"I'm using the brainstorming skill to design the checkout flow"

# 3. Create implementation plan
"I'm using the writing-plans skill to create a detailed checkout implementation plan"

# 4. Execute the plan
"I'm using the executing-plans skill to implement the checkout plan task-by-task"

# 5. Verify before claiming done
"I'm using the verification-before-completion skill to verify all tests pass"

# 6. Request code review
"I'm using the requesting-code-review skill to review my checkout implementation"
```

## Key Principles

1. **Always announce which skill you're using** - "I'm using [skill name] to [what you're doing]"
2. **Skills with checklists require TodoWrite** - Create todos for each checklist item
3. **Follow mandatory workflows** - Brainstorming before coding, TDD, verification
4. **Don't skip skills** - If a skill exists for your task, you must use it

## Skill Priority Order

When starting work:

1. **using-superpowers** (always first)
2. **brainstorming** (before any new feature)
3. **writing-plans** (after design is clear)
4. **executing-plans** or **subagent-driven-development** (for implementation)
5. **verification-before-completion** (before claiming done)
6. **requesting-code-review** (for significant changes)

## Debugging Priority

When encountering bugs:

1. **systematic-debugging** (mandatory - no fixes without root cause)
2. **root-cause-tracing** (if error is deep in call stack)
3. **defense-in-depth** (after fix, add validation layers)

## Common Patterns

### New Feature Development
```
1. using-superpowers
2. brainstorming
3. writing-plans
4. subagent-driven-development (executes plan with code review per task)
5. verification-before-completion
6. finishing-a-development-branch
```

### Bug Fixing
```
1. using-superpowers
2. systematic-debugging (find root cause)
3. test-driven-development (write failing test)
4. verification-before-completion (confirm fix)
```

### Code Review
```
1. requesting-code-review (request review from subagent)
2. receiving-code-review (handle feedback properly)
```

## Tips for Claude Web

- Skills are just markdown files with instructions - Claude can read them
- Reference skills by name or file path
- Enable superpowers in `.claude/settings.json` for automatic detection
- Use TodoWrite for tracking checklist items from skills
- Skills work the same in CLI and web - just reference them differently

## Resources

- Full skill documentation: Each skill has a `SKILL.md` file
- Examples: Many skills have `examples/` directories
- Tests: Skills are tested in `test-*.md` files

---

**Last Updated:** 2025-12-06
