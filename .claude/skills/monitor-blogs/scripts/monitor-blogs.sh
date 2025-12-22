#!/bin/bash

# Blog Monitoring Script
# Checks configured blogs for new posts by comparing against manifest files
# Exit codes: 0 = no new posts, 1 = new posts found, 2 = error

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../../../.." && pwd )"

CONFIG_FILE="$PROJECT_ROOT/.claude/skills/monitor-blogs/blog-monitor-config.json"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Error: Configuration file not found: $CONFIG_FILE${NC}" >&2
    exit 2
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required but not installed${NC}" >&2
    echo "Install with: brew install jq" >&2
    exit 2
fi

# Read blog configuration
BLOG_COUNT=$(jq '.blogs | length' "$CONFIG_FILE")
NEW_POSTS_FOUND=0

echo -e "${BLUE}=== Blog Monitoring Report ===${NC}"
echo "Checking $BLOG_COUNT blog(s)..."
echo ""

# Process each blog
for ((i=0; i<BLOG_COUNT; i++)); do
    BLOG_NAME=$(jq -r ".blogs[$i].name" "$CONFIG_FILE")
    BLOG_URL=$(jq -r ".blogs[$i].url" "$CONFIG_FILE")
    ARCHIVE_DIR=$(jq -r ".blogs[$i].archive_dir" "$CONFIG_FILE")
    DESCRIPTION=$(jq -r ".blogs[$i].description" "$CONFIG_FILE")

    echo -e "${YELLOW}Blog: $BLOG_NAME${NC}"
    echo "URL: $BLOG_URL"
    echo "Description: $DESCRIPTION"

    MANIFEST_FILE="$PROJECT_ROOT/$ARCHIVE_DIR/.manifest.json"

    # Create manifest if it doesn't exist
    if [ ! -f "$MANIFEST_FILE" ]; then
        echo -e "${YELLOW}  ⚠ Manifest not found, creating new manifest${NC}"
        mkdir -p "$PROJECT_ROOT/$ARCHIVE_DIR"
        echo "{\"blog_name\":\"$BLOG_NAME\",\"blog_url\":\"$BLOG_URL\",\"last_checked\":\"\",\"archived_posts\":[]}" | jq '.' > "$MANIFEST_FILE"
    fi

    # Fetch blog homepage
    echo "  Fetching homepage..."
    TEMP_HTML=$(mktemp)

    if ! curl -sS -L -A "Mozilla/5.0" "$BLOG_URL" -o "$TEMP_HTML" 2>/dev/null; then
        echo -e "${RED}  ✗ Failed to fetch $BLOG_URL${NC}"
        rm -f "$TEMP_HTML"
        continue
    fi

    # Parse HTML for post links (looking for /blog/* and /jailbreaks/* paths)
    # Extract href attributes that match the pattern
    FOUND_POSTS=$(grep -oE 'href="(/blog/[^"]+|/jailbreaks/[^"]+)"' "$TEMP_HTML" | \
                  sed 's/href="//;s/"$//' | \
                  sort -u)

    rm -f "$TEMP_HTML"

    if [ -z "$FOUND_POSTS" ]; then
        echo -e "${YELLOW}  ⚠ No posts found on homepage${NC}"
        echo ""
        continue
    fi

    # Load existing manifest
    ARCHIVED_PATHS=$(jq -r '.archived_posts[].path' "$MANIFEST_FILE" 2>/dev/null || echo "")

    # Compare and find new posts
    NEW_POSTS=""
    while IFS= read -r post_path; do
        if ! echo "$ARCHIVED_PATHS" | grep -qF "$post_path"; then
            NEW_POSTS="$NEW_POSTS$post_path"$'\n'
        fi
    done <<< "$FOUND_POSTS"

    # Remove trailing newline
    NEW_POSTS=$(echo "$NEW_POSTS" | sed '/^$/d')

    if [ -n "$NEW_POSTS" ]; then
        NEW_POSTS_FOUND=1
        echo -e "${GREEN}  ✓ Found $(echo "$NEW_POSTS" | wc -l | tr -d ' ') new post(s):${NC}"
        while IFS= read -r post_path; do
            FULL_URL="${BLOG_URL}${post_path}"
            echo -e "    ${GREEN}→${NC} $FULL_URL"
        done <<< "$NEW_POSTS"
    else
        echo -e "${GREEN}  ✓ No new posts (all posts already tracked)${NC}"
    fi

    # Update last_checked timestamp
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    jq --arg ts "$TIMESTAMP" '.last_checked = $ts' "$MANIFEST_FILE" > "$MANIFEST_FILE.tmp"
    mv "$MANIFEST_FILE.tmp" "$MANIFEST_FILE"

    echo ""
done

echo -e "${BLUE}=== End of Report ===${NC}"

if [ $NEW_POSTS_FOUND -eq 1 ]; then
    echo -e "${GREEN}New posts detected! Consider archiving them.${NC}"
    exit 1
else
    echo -e "${GREEN}All blogs are up to date.${NC}"
    exit 0
fi
