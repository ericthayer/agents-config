# GitHub Authentication Setup Guide

This guide helps you set up authentication for GitHub CLI and the mcp_github tools.

## Current Status ✅

Your system is already configured with:
- **GitHub CLI**: v2.52.0 installed
- **Primary Account**: `YOUR_USER_NAME` (Active & Authenticated)
- **Token Scopes**: gist, read:org, repo, workflow
- **Protocol**: HTTPS
- **Storage**: Keyring (secure credential storage)

## Option 1: Use GitHub CLI for PR Creation (Recommended)

### Create PR with `gh` CLI

Use your terminal to create the PR directly:

```bash
cd /Users/path-to-project-name

# Create PR using the pr-template-commits.md file
gh pr create \
  --title "perf: Restructure project, add AI guidance system, and testing infrastructure" \
  --body "$(cat .github/pr-template-commits.md)" \
  --base main \
  --head feat/update-logic
```

**Or interactively:**

```bash
gh pr create --base main --head feat/update-logic
```

The interactive mode will prompt you for:
- Title (auto-fill from commit suggested)
- Body (open editor)
- Additional options

### Verify PR Creation

```bash
# List your open PRs
gh pr list --state open

# View specific PR
gh pr view <pr-number>
```

## Option 2: Configure GitHub Token for mcp_github Tools

The mcp_github tools require a GitHub personal access token (PAT) via environment variable.

### Step 1: Generate a Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Fill in:
   - **Token name**: `devlog-mcp`
   - **Expiration**: 90 days (or your preference)
   - **Scopes**: Select these:
     - ✅ `repo` (full control of private repositories)
     - ✅ `workflow` (manage GitHub Actions workflows)
     - ✅ `read:org` (read access to organization)
     - ✅ `gist` (create and manage gists)

3. Click **Generate token**
4. Copy the token (starts with `ghp_` or `gho_`)

### Step 2: Configure Environment Variable

Add the token to your `.env` file:

```bash
# In /Users/thayere/Documents/_DEV/devlog/.env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Or set it in your shell:

```bash
# Bash/Zsh
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Add to ~/.zshrc for persistence
echo 'export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Verify Token

```bash
# Test with curl
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

Should return your GitHub user information.

## Option 3: Re-authenticate if Needed

If your token expires or you need to update:

```bash
# Re-authenticate with GitHub CLI
gh auth login -h github.com

# You'll be prompted to choose:
# - Protocol: HTTPS
# - Authentication: Paste your token
# - Set as default account: Yes

# Verify new authentication
gh auth status
```

## Troubleshooting

### "404 Not Found" Error
- **Cause**: Repository doesn't exist at specified owner/repo
- **Fix**: Verify you're using the correct owner (`YOUR_USER_NAME`) and repo (`devlog`)

### "403 Unauthorized" Error
- **Cause**: Token lacks required scopes or is invalid
- **Fix**: Generate new PAT with `repo`, `workflow`, `read:org` scopes

### Token Not Found
- **Cause**: `GITHUB_TOKEN` environment variable not set
- **Fix**: Add token to `.env` or shell profile

### Multiple Accounts
You have multiple accounts configured. To use specific account:

```bash
# Switch active account
gh auth select
# or
gh auth switch -u YOUR_USER_NAME
```

## Security Best Practices

1. **Never commit tokens** - `.env` is in `.gitignore`
2. **Use keyring storage** - GitHub CLI stores tokens securely
3. **Set expiration** - PATs should expire in 30-90 days
4. **Rotate regularly** - Delete old tokens from Settings
5. **Minimal scopes** - Only grant required permissions

## Files Created

- `.github/pr-template-commits.md` - PR description template (can be copied to GitHub)
- `.github/GITHUB_AUTH_SETUP.md` - This authentication guide

## Quick Reference

| Task | Command |
|------|---------|
| Check auth status | `gh auth status` |
| Create PR | `gh pr create --base main --head feat/update-logic` |
| List PRs | `gh pr list --state open` |
| View PR | `gh pr view <number>` |
| Re-auth | `gh auth login -h github.com` |
| Export token | `echo $GITHUB_TOKEN` |

## Next Steps

1. ✅ GitHub CLI already authenticated as `YOUR_USER_NAME`
2. 🔄 Option A: Create PR with `gh pr create` (easiest)
3. 🔄 Option B: Generate PAT and set `GITHUB_TOKEN` for mcp_github tools

Both options will work - choose based on your preference!
