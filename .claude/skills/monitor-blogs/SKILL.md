---
name: monitor-blogs
description: Monitor research blogs for new posts. Use when user wants to check for new content from security researchers, update blog archives, or add new blogs to monitor.
---

# Purpose

Automates discovery and tracking of new blog posts from red-teaming and AI security researchers. This skill helps maintain an up-to-date archive of research materials by monitoring configured blogs and alerting when new content is published.

## Variables

```
BLOG_CONFIG_PATH: scripts/blog-monitor-config.json (configuration file listing blogs to monitor)
ARCHIVE_BASE_DIR: docs/research/blogs/ (base directory for archived blog posts)
AUTO_ARCHIVE: false (whether to automatically archive new posts or just report them)
```

## Instructions

1. **Using the monitoring script**: Execute `scripts/monitor-blogs.sh` to check all configured blogs for new posts. The script compares current blog content against manifest files (`.manifest.json`) in each blog's archive directory.

2. **Configuration file**: Read `scripts/blog-monitor-config.json` to see which blogs are being monitored or to add new blogs.

3. **Manifest files**: Each monitored blog has a `.manifest.json` file in its archive directory (e.g., `docs/research/blogs/ijailbreakllms/.manifest.json`) that tracks discovered and archived posts.

4. **Slash command**: Use `/monitor-blogs` to execute the monitoring script with proper permissions.

## Workflow

1. User requests blog monitoring ("check for new posts", "update blog archives", etc.)
2. Execute `/monitor-blogs` slash command or run `bash scripts/monitor-blogs.sh` directly
3. Review the output to see which blogs have new posts
4. If new posts are found and user wants to archive them:
   - Use WebFetch to retrieve each post's content
   - Extract title, date, author, and body content
   - Format as markdown with proper frontmatter
   - Save to the blog's archive directory with naming convention: `YYYY-MM-DD-slug.md`
   - Update the blog's `.manifest.json` to include the new post
5. If no new posts found, confirm all blogs are up to date

## Cookbook

### Scenario 1: Checking for New Posts

- **IF**: User asks to "check for new blog posts", "update blog archives", "see if there's new content", or similar request
- **THEN**: Follow this approach:
  1. Execute `/monitor-blogs` slash command
  2. Wait for the script output
  3. Report results to user in a clear summary
  4. If new posts found, list them with titles and URLs
  5. Ask user which posts they want to archive (if any)
- **EXAMPLES**:
  - "User says: Check for new posts on the research blogs"
  - "User says: Are there any new jailbreaking articles?"
  - "User says: Update my blog archives"

### Scenario 2: Archiving New Posts

- **IF**: New posts are discovered AND user wants to archive them (explicitly or implicitly)
- **THEN**: Follow this approach:
  1. For each post URL to archive:
     - Use WebFetch to retrieve the full post content
     - Extract: title, publication date, author, category/tags, body content
     - Format as markdown following existing pattern (see examples in archive directories)
     - Determine filename: `YYYY-MM-DD-slug.md` (use publication date if available)
     - Save to appropriate archive directory using Write tool
  2. Read the blog's `.manifest.json` file
  3. Add entry for each newly archived post:
     ```json
     {
       "url": "full_url",
       "path": "/path/from/root",
       "title": "Post Title",
       "discovered_date": "YYYY-MM-DD",
       "archived": true,
       "local_file": "YYYY-MM-DD-slug.md"
     }
     ```
  4. Write updated manifest back to `.manifest.json`
  5. Confirm successful archival to user
- **EXAMPLES**:
  - "User says: Archive those new posts"
  - "User says: Save the first two posts to my archives"
  - "User says: Fetch all the new content"

### Scenario 3: Adding a New Blog to Monitor

- **IF**: User provides a new blog URL to monitor OR asks to add a blog to the monitoring list
- **THEN**: Follow this approach:
  1. Read `scripts/blog-monitor-config.json`
  2. Ask user for required information:
     - Blog name (slug/identifier)
     - Blog URL (homepage)
     - Description (author, focus area)
  3. Create new entry in config following existing pattern
  4. Determine archive directory path: `docs/research/blogs/{blog-name}`
  5. Create the archive directory using Bash (mkdir)
  6. Run `/monitor-blogs` to initialize (will create `.manifest.json` automatically)
  7. Report which posts were discovered (all will be "new" on first run)
  8. Ask user if they want to archive any existing posts
- **EXAMPLES**:
  - "User says: Add this blog to monitoring: https://example.com/security-blog"
  - "User says: Can you track this researcher's blog?"
  - "User says: I found a new red-teaming blog, let's monitor it"

### Scenario 4: Managing the Monitor List

- **IF**: User asks to see monitored blogs, remove a blog, or modify configuration
- **THEN**: Follow this approach:
  1. Read `scripts/blog-monitor-config.json`
  2. If listing: Display all monitored blogs with names, URLs, and descriptions
  3. If removing: Delete the entry from config file, optionally ask if archive should be deleted
  4. If modifying: Edit the appropriate fields in the config
  5. Save changes back to config file
  6. Confirm the changes to user
- **EXAMPLES**:
  - "User says: What blogs are we monitoring?"
  - "User says: Remove ijailbreakllms from the monitor list"
  - "User says: Update the description for that blog"

### Scenario 5: Troubleshooting

- **IF**: Monitoring script fails, returns errors, or behaves unexpectedly
- **THEN**: Follow this approach:
  1. Check if required dependencies exist (curl, jq, grep, sed)
  2. Verify config file is valid JSON
  3. Check if blog URLs are accessible (network connectivity)
  4. Verify manifest files are valid JSON
  5. Check permissions on script (should be executable)
  6. Review script exit codes: 0 = no new posts, 1 = new posts found, 2 = error
  7. Report specific issue to user with suggested fix
- **EXAMPLES**:
  - "User says: The monitor script isn't working"
  - "User says: I'm getting an error when checking blogs"
  - "User says: Why didn't it find any posts?"
