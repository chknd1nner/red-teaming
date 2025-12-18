---
name: refresh-repos
description: Manage and sync research repositories. Use when user wants to pull/update repos, add new repos to track, disable or remove repos from the list, or check what repos are being tracked.
---

# Purpose

Automates management of external GitHub repositories used for red-teaming and AI security research. This skill keeps local copies of research repositories in sync with their remotes by cloning new repos and pulling updates for existing ones.

## Variables

```
REPO_LIST_PATH: docs/research/repos/repo-list.md (markdown file listing repos to track)
REPOS_DIR: docs/research/repos/ (directory where repos are cloned)
SKIP_STRIKETHROUGH: true (repos with markdown strikethrough are ignored)
```

## Instructions

1. **Using the refresh script**: Execute `scripts/refresh-repos.sh` to clone or pull all repositories listed in the repo list. The script parses the markdown file to extract GitHub URLs and handles both new and existing repos.

2. **Repo list file**: Read `docs/research/repos/repo-list.md` to see which repositories are being tracked. Repos marked with strikethrough (`~~url~~`) are ignored.

3. **Cloned repos**: All repositories are cloned directly into `docs/research/repos/` using their default directory names (last segment of the URL).

## Workflow

1. User requests repo refresh ("update repos", "pull latest", "refresh repositories", etc.)
2. Execute the refresh script: `bash .claude/skills/refresh-repos/scripts/refresh-repos.sh`
3. Review output to see which repos were updated, cloned, or had issues
4. Report results to user with summary of changes

## Cookbook

### Scenario 1: Refreshing All Repositories

- **IF**: User asks to "refresh repos", "pull latest", "update repositories", "sync repos", or similar
- **THEN**: Follow this approach:
  1. Execute `bash .claude/skills/refresh-repos/scripts/refresh-repos.sh`
  2. Wait for script completion
  3. Report results: how many repos updated, any new clones, any errors
  4. If errors occurred, provide details and suggest fixes
- **EXAMPLES**:
  - "User says: Refresh the research repos"
  - "User says: Pull the latest from the repos"
  - "User says: Update the repo list"
  - "User says: Sync all the research repositories"

### Scenario 2: Adding a New Repository

- **IF**: User wants to add a new repository to track
- **THEN**: Follow this approach:
  1. Read `docs/research/repos/repo-list.md`
  2. Add new line with format: `- https://github.com/owner/repo - Description`
  3. Save the updated file
  4. Run the refresh script to clone the new repo
  5. Confirm successful addition
- **EXAMPLES**:
  - "User says: Add this repo to tracking: https://github.com/example/jailbreaks"
  - "User says: Can you track this repository?"
  - "User says: Include this in the research repos"

### Scenario 3: Disabling a Repository

- **IF**: User wants to stop tracking a repository but keep the reference
- **THEN**: Follow this approach:
  1. Read `docs/research/repos/repo-list.md`
  2. Find the repository line
  3. Wrap the URL and description in strikethrough: `~~https://github.com/... - Description~~`
  4. Save the file
  5. The repo will be ignored on future refreshes (local copy remains)
- **EXAMPLES**:
  - "User says: Disable tracking for Jailbreaks repo"
  - "User says: Stop pulling from that repo"
  - "User says: Mark that repository as inactive"

### Scenario 4: Removing a Repository Completely

- **IF**: User wants to remove a repository entirely (from list AND disk)
- **THEN**: Follow this approach:
  1. Read `docs/research/repos/repo-list.md`
  2. Remove the repository line
  3. Save the file
  4. Delete the local clone: `rm -rf docs/research/repos/{repo-name}`
  5. Confirm removal
- **EXAMPLES**:
  - "User says: Remove the Jailbreaks repo completely"
  - "User says: Delete that repository"
  - "User says: Get rid of that repo"

### Scenario 5: Checking Repository Status

- **IF**: User asks what repos are being tracked or their status
- **THEN**: Follow this approach:
  1. Read `docs/research/repos/repo-list.md`
  2. List active repos (non-strikethrough) and disabled repos (strikethrough)
  3. For each active repo, optionally check if local clone exists
  4. Report status to user
- **EXAMPLES**:
  - "User says: What repos are we tracking?"
  - "User says: List the research repositories"
  - "User says: Show me the repo list"

### Scenario 6: Troubleshooting

- **IF**: Refresh fails, repos won't clone, or git errors occur
- **THEN**: Follow this approach:
  1. Check if git is installed and accessible
  2. Verify network connectivity to GitHub
  3. Check for authentication issues (private repos)
  4. Verify the repos directory exists and is writable
  5. Check for merge conflicts in existing repos
  6. Report specific error with suggested fix
- **EXAMPLES**:
  - "User says: The refresh isn't working"
  - "User says: I'm getting git errors"
  - "User says: Why won't this repo clone?"
