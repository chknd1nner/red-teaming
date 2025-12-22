Check research blogs for new posts using the monitor-blogs skill.

Run `bash .claude/skills/monitor-blogs/scripts/monitor-blogs.sh` to check all configured blogs for new posts. The script compares current blog content against manifest files in each blog's archive directory.

After running, review any new posts reported. If you find posts worth archiving, use WebFetch to retrieve the content, save to the appropriate blog directory (YYYY-MM-DD-slug.md), and update the blog's .manifest.json.
