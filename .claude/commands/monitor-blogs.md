---
description: Check research blogs for new posts
allowed-tools: Bash(scripts/monitor-blogs.sh)
---

Execute the blog monitoring script to check for new posts from configured research blogs.

Run: !`bash scripts/monitor-blogs.sh`

After running, review any new posts reported. If you find posts worth archiving:
1. Use WebFetch to retrieve the post content
2. Use Write to save it to the appropriate blog directory (follow naming convention: YYYY-MM-DD-slug.md)
3. Update the blog's .manifest.json to include the new post
