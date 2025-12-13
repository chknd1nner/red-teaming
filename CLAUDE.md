# Red-Teaming Security and Research Repository

This is my repository for all my red-teaming security and research work.

## Purpose

This repository serves as a central hub for:
- Prompt injection research and testing
- AI security research and documentation
- Red-teaming techniques and methodologies
- System prompt analysis across different AI providers
- Collection of research papers, blog posts, and community discussions

## Repository Structure

### `.claude/`
Claude Code configuration and custom functionality:
- **skills/** - Custom Claude Code skills
  - `refresh-repos/` - Skill for git pulling to refresh repos in docs/research/repos
  - `test-prompt/` - Skill for adversarial testing of prompts
- **commands/** - Slash commands
  - `refresh-repos.md` - Command that references the refresh-repos skill

### `working/`
Active prompt injections and techniques organized by provider:
- `anthropic/` - Anthropic Claude techniques (sonnet, opus, haiku)
- `google/` - Google Gemini techniques
- `openai/` - OpenAI GPT techniques

### `docs/`
Documentation and research materials:
- **Provider-specific folders** (`anthropic/`, `google/`, `openai/`, `poe/`)
  - `system-prompts/` - Collected system prompts from each provider
- **research/** - Research materials
  - `papers/` - Academic papers
  - `blogs/` - Blog posts and articles
  - `reddit/` - Reddit discussions
  - `discord/` - Discord discussions
  - `repos/` - Useful GitHub repositories from fellow researchers
    - `repo-list.md` - List of repos for automated refresh
- **prompting/** - Prompting resources
  - `guides/` - Prompting guides and tutorials
  - `useful-prompts/` - Collection of useful prompts

## Getting Started

This repository is designed to work with Claude Code and includes custom skills and commands for automated research management.

## Important Notes

This repository is for authorized security testing, defensive security research, CTF challenges, and educational purposes only. All research should be conducted ethically and responsibly.
