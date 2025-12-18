#!/bin/bash

# refresh-repos.sh
# Clones new repositories and pulls updates for existing ones
# Reads from docs/research/repos/repo-list.md
# Skips repos marked with strikethrough (~~url~~)

set -e

# Get the repository root (assumes script is in .claude/skills/refresh-repos/scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

REPO_LIST="$REPO_ROOT/docs/research/repos/repo-list.md"
REPOS_DIR="$REPO_ROOT/docs/research/repos"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CLONED=0
UPDATED=0
SKIPPED=0
ERRORS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Research Repository Refresh${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if repo list exists
if [[ ! -f "$REPO_LIST" ]]; then
    echo -e "${RED}Error: Repo list not found at $REPO_LIST${NC}"
    exit 1
fi

# Ensure repos directory exists
mkdir -p "$REPOS_DIR"

echo -e "${YELLOW}Reading repo list from:${NC} $REPO_LIST"
echo ""

# Parse the repo list, extracting GitHub URLs
# Skip lines that are wrapped in strikethrough (~~...~~)
while IFS= read -r line; do
    # Skip empty lines and header lines
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^#.*$ ]] && continue

    # Skip strikethrough lines (~~...~~)
    if [[ "$line" =~ ~~.*~~ ]]; then
        # Extract URL for reporting
        url=$(echo "$line" | grep -oE 'https://github\.com/[^[:space:]~]+' | head -1)
        if [[ -n "$url" ]]; then
            repo_name=$(basename "$url" .git)
            echo -e "${YELLOW}[SKIP]${NC} $repo_name (marked as strikethrough)"
            ((SKIPPED++))
        fi
        continue
    fi

    # Extract GitHub URL from the line
    url=$(echo "$line" | grep -oE 'https://github\.com/[^[:space:]]+' | head -1)

    # Skip if no URL found
    [[ -z "$url" ]] && continue

    # Clean up URL (remove trailing punctuation, .git suffix)
    url=$(echo "$url" | sed 's/[,)]*$//' | sed 's/\.git$//')

    # Get repo name from URL
    repo_name=$(basename "$url")
    repo_path="$REPOS_DIR/$repo_name"

    echo -e "${BLUE}Processing:${NC} $repo_name"
    echo -e "  URL: $url"

    if [[ -d "$repo_path/.git" ]]; then
        # Existing repo - pull latest
        echo -e "  ${YELLOW}Pulling latest...${NC}"
        cd "$repo_path"

        if git pull --ff-only 2>&1; then
            echo -e "  ${GREEN}[UPDATED]${NC} Successfully pulled latest changes"
            ((UPDATED++))
        else
            echo -e "  ${RED}[ERROR]${NC} Failed to pull (may have local changes or conflicts)"
            ((ERRORS++))
        fi

        cd "$REPO_ROOT"
    else
        # New repo - clone it
        echo -e "  ${YELLOW}Cloning...${NC}"

        # Remove directory if it exists but isn't a git repo
        [[ -d "$repo_path" ]] && rm -rf "$repo_path"

        if git clone "$url" "$repo_path" 2>&1; then
            echo -e "  ${GREEN}[CLONED]${NC} Successfully cloned repository"
            ((CLONED++))
        else
            echo -e "  ${RED}[ERROR]${NC} Failed to clone repository"
            ((ERRORS++))
        fi
    fi

    echo ""

done < "$REPO_LIST"

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "  ${GREEN}Cloned:${NC}  $CLONED"
echo -e "  ${GREEN}Updated:${NC} $UPDATED"
echo -e "  ${YELLOW}Skipped:${NC} $SKIPPED"
echo -e "  ${RED}Errors:${NC}  $ERRORS"
echo ""

if [[ $ERRORS -gt 0 ]]; then
    echo -e "${RED}Some operations failed. Check output above for details.${NC}"
    exit 1
else
    echo -e "${GREEN}All operations completed successfully!${NC}"
    exit 0
fi
