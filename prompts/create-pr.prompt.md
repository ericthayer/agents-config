---
agent: agent
---

# Create PR from Last Commit

## Task
Analyze the last git commit and create a comprehensive PR description.

## Instructions

1. **Get the latest commit details:**
   - Use `mcp_github_get_commit` with:
     - owner: `ericthayer`
     - repo: `devlog`
     - sha: Get from `git log -1 --pretty=format:"%H"`
     - include_diff: `true`

2. **Analyze the commit data:**
   - Extract commit message (title and body)
   - Review files changed (additions, deletions, modifications)
   - Examine the diff to understand the scope of changes
   - Identify the type of change (feat, fix, refactor, docs, etc.)

3. **Build PR description following this structure:**
   
   ```markdown
   ## Summary
   [1-2 sentences describing the overall change]
   
   ## Changes
   - **Files Modified:** [List key files with brief descriptions]
   - **Key Changes:** [Bullet points of what was changed and why]
   
   ## Type of Change
   - [ ] Bug fix (non-breaking)
   - [ ] New feature (non-breaking)
   - [ ] Breaking change
   - [ ] Documentation update
   - [ ] Refactoring
   
   ## Testing
   [Describe testing approach or note if manual testing needed]
   
   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   ```

4. **Create the Pull Request:**
  
```bash
# Get current branch
BRANCH=$(git branch --show-current)

# Create PR with template
gh pr create \
  --title "$(git log -1 --pretty=format:'%s')" \
  --body "$(cat .github/pr-template-commits.md)" \
  --base main \
  --head $BRANCH
```

See `.github/GITHUB_AUTH_SETUP.md` for authentication setup.

## Context
- Repository: github.com/ericthayer/devlog
- Default base branch: `main`
- See `.github/pr-template-commits.md` for reusable PR description template
- See `.github/GITHUB_AUTH_SETUP.md` for GitHub authentication guide

## Success Criteria
✅ PR created with descriptive title
✅ Body contains summary, changes, and testing info
✅ All relevant files mentioned
✅ Clear description of what and why