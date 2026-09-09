# GitHub authentication

Use the GitHub CLI's supported authentication flow:

```sh
gh auth login
gh auth status
```

Authenticate with the intended account and repository permissions. Use
organization SSO authorization where required. Prefer short-lived credentials
and least-privilege access; store automation credentials in the CI secret store.

Do not paste credentials into source files, issue bodies, logs, or chat. Do not
change another project's stored credentials to resolve an authentication error.
An authorization error is not permission to bypass repository policies.

Reference: https://cli.github.com/manual/gh_auth_login
