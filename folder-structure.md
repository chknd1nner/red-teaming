.claude/
    skills/
        refresh-repos/ - skill for git pulling to refresh the repos in docs/research/repos
            tools/
            scripts/
            references/
            SKILL.md
        test-prompt/ - skill for adversarial testing of a prompt
            tools/
            scripts/
            references/
            SKILL.md
    commands/
        refresh-repos.md - slash command that references the refresh-repos skill
working/ - folder for working prompt injections and techniques
    anthropic/
        sonnet/
        opus/
        haiku/
    google/
        gemini/
    openai/
        gpt/
docs/ - documentation and research folder
    poe/
    anthropic/
        system-prompts/
    google/
        system-prompts/
    openai/
        system-prompts/
    research/ - contains research papers, discussions from social media etc
        papers/
        blogs/
        reddit/
        discord/
        repos/ - useful github repos of fellow researchers
            repo-list.md - list of repos for refresh by refresh-repo command/skill
    prompting/
        guides/
        useful-prompts/
.gitignore - ignore MacOS sys files, .claude
CLAUDE.md - This is my repo for all my red-teaming security and research work. Please initialise with the folder structure outlined above
    
