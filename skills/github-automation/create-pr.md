---
agent: agent
---

# Create PR from Last Commit

## Task
Analyze the last git commit and create a comprehensive PR description.

## Instructions

1. **Get the latest commit details:**
   - Get repository info from `git remote get-url origin`
   - Parse owner and repo from the URL
   - Get commit SHA from `git log -1 --pretty=format:"%H"`
   - Use the commit data to analyze changes

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

# Create unique temp file to avoid conflicts across projects
PR_BODY_FILE="/tmp/pr-body-$(date +%s).md"

# Create PR with generated description
gh pr create \
  --title "$(git log -1 --pretty=format:'%s')" \
  --body-file "$PR_BODY_FILE" \
  --base main \
  --head $BRANCH

# Clean up temp file
rm -f "$PR_BODY_FILE"
```

## Context
- Default base branch: `main` (or detect from `git remote show origin | grep 'HEAD branch'`)
- Repository info detected dynamically from git remote

## Success Criteria
✅ PR created with descriptive title
✅ Body contains summary, changes, and testing info
✅ All relevant files mentioned
✅ Clear description of what and why