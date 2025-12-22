---
title: "Anthropic Compatible API"
sidebar_position: 3
description: |
  Use the Poe API with the Anthropic Messages API format.
---

# Anthropic Compatible API

The Poe API provides access to Claude models through an Anthropic-compatible endpoint. Use your Poe API key to access Claude without needing a separate Anthropic API key.

**Key benefits:**
- Use your existing Poe subscription points with no additional setup
- Drop-in replacement for the Anthropic API - works with existing Anthropic SDK code
- Requests are proxied directly to the provider with minimal transformation

If you're already using the Anthropic SDK, you can switch to using Poe by simply changing the base URL and API key. For full API reference, see [Anthropic's official documentation](https://docs.anthropic.com/en/api/messages).

## Claude Code

You can use the Poe API with Claude Code by setting two environment variables:

```
export ANTHROPIC_API_KEY=$POE_API_KEY
export ANTHROPIC_BASE_URL="https://api.poe.com"
```

You can then restart Claude Code and verify you're using the Poe API with the `/status` command.

## Differences from our other APIs

Only official Anthropic bots are supported through this API. You cannot call custom bots, or bots from other providers from this endpoint. If you would like to call other bots, please see our [external applications guide](https://creator.poe.com/docs/external-applications/external-application-guide) or our [OpenAI Compatible API](https://creator.poe.com/docs/external-applications/openai-compatible-api).

For the full API reference including request/response formats, message types, and tool use, see [Anthropic's official documentation](https://docs.anthropic.com/en/api/messages).

## Getting Started

<Tabs items={['Python', 'Node.js', 'cURL']}>
<Tab value="Python">
```python
# pip install anthropic
import os
import anthropic

client = anthropic.Anthropic(
    api_key=os.getenv("POE_API_KEY"),  # https://poe.com/api_key
    base_url="https://api.poe.com",
)

message = client.messages.create(
    model="claude-sonnet-4",  # or claude-opus-4, claude-3-5-haiku, etc.
    max_tokens=1024,
    messages=[{"role": "user", "content": "What are the top 3 things to do in NYC?"}],
)
print(message.content[0].text)
```
</Tab>
<Tab value="Node.js">
```tsx
// npm install @anthropic-ai/sdk
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
    apiKey: process.env.POE_API_KEY,  // https://poe.com/api_key
    baseURL: "https://api.poe.com",
});

const message = await client.messages.create({
    model: "claude-sonnet-4",  // or claude-opus-4, claude-3-5-haiku, etc.
    max_tokens: 1024,
    messages: [{ role: "user", content: "What are the top 3 things to do in NYC?" }],
});

console.log(message.content[0].text);
```
</Tab>
<Tab value="cURL">
```bash
curl "https://api.poe.com/v1/messages" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $POE_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -d '{
        "model": "claude-sonnet-4",
        "max_tokens": 1024,
        "messages": [
            {
                "role": "user",
                "content": "What are the top 3 things to do in NYC?"
            }
        ]
    }'
```
</Tab>
</Tabs>

## Authentication

The Poe Anthropic-compatible API supports two authentication methods:

### x-api-key header (recommended)

This is Anthropic's standard authentication method:

```bash
curl "https://api.poe.com/v1/messages" \
    -H "x-api-key: $POE_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    ...
```

### Authorization: Bearer header

For compatibility with tools that use Bearer token authentication:

```bash
curl "https://api.poe.com/v1/messages" \
    -H "Authorization: Bearer $POE_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    ...
```

If both headers are provided, `x-api-key` takes precedence.

Get your API key at [poe.com/api_key](https://poe.com/api_key).

## Streaming

You can stream responses by setting `stream: true`:

<Tabs items={['Python', 'Node.js', 'cURL']}>
<Tab value="Python">
```python
import os
import anthropic

client = anthropic.Anthropic(
    api_key=os.getenv("POE_API_KEY"),
    base_url="https://api.poe.com",
)

with client.messages.stream(
    model="claude-sonnet-4",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Tell me about San Francisco"}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```
</Tab>
<Tab value="Node.js">
```tsx
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
    apiKey: process.env.POE_API_KEY,
    baseURL: "https://api.poe.com",
});

const stream = await client.messages.stream({
    model: "claude-sonnet-4",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Tell me about San Francisco" }],
});

for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        process.stdout.write(event.delta.text);
    }
}
```
</Tab>
<Tab value="cURL">
```bash
curl "https://api.poe.com/v1/messages" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $POE_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -d '{
        "model": "claude-sonnet-4",
        "max_tokens": 1024,
        "stream": true,
        "messages": [
            {
                "role": "user",
                "content": "Tell me about San Francisco"
            }
        ]
    }' \
    --no-buffer
```
</Tab>
</Tabs>

## Supported Models

You can use any Claude model available on Poe. You can use the bot name from poe or the Anthropic API model name.

| Model | Example name |
| --- | --- |
| Claude Sonnet 4.5 | `claude-sonnet-4.5`, `claude-sonnet-4-5-20250929` |
| Claude Opus 4.5 | `claude-opus-4.5`, `claude-opus-4-5-20251101` |
| Claude Haiku 4.5 | `claude-haiku-4.5`, `claude-haiku-4-5-20251001` |
| Claude Opus 4.1 | `claude-opus-4.1`, `claude-opus-4-1-20250805` |
| Claude Sonnet 4 | `claude-sonnet-4`, `claude-sonnet-4-20250514` |
| Claude Opus 4 | `claude-opus-4`, `claude-opus-4-20250514` |
| Claude Sonnet 3.7 | `claude-sonnet-3.7`, `claude-3-7-sonnet-20250219` |
| Claude Haiku 3.5 | `claude-haiku-3.5`, `claude-3-5-haiku-20241022` |
| Claude Haiku 3 | `claude-haiku-3`, `claude-3-haiku-20240307` |

## Rate Limits

Our rate limit is **500 requests per minute** (rpm).

### Rate Limit Headers

The following headers are included in responses:

| Header | Description |
| --- | --- |
| `x-ratelimit-limit-requests` | Maximum requests allowed per time window (500) |
| `x-ratelimit-remaining-requests` | Remaining requests in current time window |
| `x-ratelimit-reset-requests` | Seconds until the rate limit resets |

When rate limited, you'll receive an HTTP 429 response with an error of type `rate_limit_error`.

**Retry tips:**
- Use exponential back-off (starting at 250ms) with jitter
- Check the rate limit headers to avoid hitting limits

## Error Handling

Errors follow the [Anthropic error format](https://docs.anthropic.com/en/api/errors). All errors return:

```json
{
    "type": "error",
    "error": {
        "type": "authentication_error",
        "message": "Invalid API key"
    }
}
```

### Streaming Errors

If an error occurs during streaming, an SSE error event is sent before the stream closes:

```
event: error
data: {"type": "error", "error": {"type": "api_error", "message": "An error occurred"}}
```

## Migration Checklist (Anthropic → Poe)

1. **Swap base URL:** `https://api.anthropic.com` → `https://api.poe.com`
2. **Replace API key:** `ANTHROPIC_API_KEY` → `POE_API_KEY`
3. **Run your code** - Everything else should work the same!

## Pricing & Availability

All Poe subscribers can use their existing subscription points with the API at no additional cost.

This means you can seamlessly transition between the web interface and API without worrying about separate billing structures or additional fees. Your regular monthly point allocation works exactly the same way whether you're chatting directly on Poe or accessing Claude programmatically through the API.

If your Poe subscription is not enough, you can [purchase add-on points](https://poe.com/api_key) to get as much access as your application requires. Any add-on points you purchase can be used with any model or bot on Poe.

## Support

Feel free to [reach out to support](mailto:developers@poe.com) if you come across unexpected behavior or have suggestions for improvements.