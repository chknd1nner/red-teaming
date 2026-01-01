# Poe Anthropic-Compatible API: Identity Spoofing PoC Plan

## Hypothesis Evaluation

### Original Hypothesis
> It should be possible to construct code to send messages to the Poe Anthropic-compatible endpoint using the same identity spoofing trick as documented in the oauth guide in order to use the Poe endpoint for sending any arbitrary message (as long as the identity requirement is met).

### Analysis

**Context Differences:**

| Aspect | OAuth Guide (Direct Anthropic) | Poe Anthropic-Compatible API |
|--------|-------------------------------|------------------------------|
| Authentication | OAuth tokens from MAX subscription | Poe API key |
| Billing | Flat-rate via MAX ($100-200/mo) | Point-based via Poe subscription |
| Validation | Content-based (system prompt check) | Unknown - "minimal transformation" |
| Purpose of Spoof | Bypass "Claude Code only" restriction | Unknown effect |

**Key Insight from OAuth Guide:**
- Anthropic validates OAuth requests by checking if `system[0].text` starts with exact string: `"You are Claude Code, Anthropic's official CLI for Claude."`
- This validation is specifically tied to **OAuth token authentication**
- Poe uses their own API key system, not OAuth tokens

**The "Minimal Transformation" Question:**

Poe's documentation states:
> "Requests are proxied directly to the provider with minimal transformation"

This raises critical questions:
1. Does Poe inject their own system prompt before forwarding?
2. Does Poe strip or modify user-provided system prompts?
3. Does Anthropic's backend apply OAuth-style validation to Poe-routed requests?

### Refined Hypothesis

The hypothesis validity depends on Poe's proxy architecture:

**Scenario A: Poe passes system prompts unchanged**
- The Claude Code identity would reach Anthropic's backend
- Effect is uncertain since Poe uses service credentials, not OAuth tokens
- May trigger different code paths or unlock features

**Scenario B: Poe modifies/wraps system prompts**
- Any identity spoofing would be neutralized or overwritten
- Poe may prepend their own context

**Scenario C: Poe has its own validation layer**
- May reject or flag Claude Code identity as suspicious
- Could rate limit or block requests

### What We're Actually Testing

Rather than "bypassing restrictions," this PoC explores:
1. **Proxy transparency**: Does Poe pass system prompts verbatim?
2. **Behavioral differences**: Does Claude respond differently with the identity?
3. **Feature availability**: Are there Claude Code-specific features (thinking, tools) that become available?
4. **Error behavior**: Does Anthropic's backend recognize/reject the spoofed identity?

---

## Proof of Concept Implementation Plan

### Phase 1: Baseline Establishment

**Test 1.1: Vanilla Request**
```javascript
// No system prompt - establish baseline response
{
  model: "claude-sonnet-4",
  max_tokens: 1024,
  messages: [{ role: "user", content: "What is your name and how would you describe yourself?" }]
}
```

**Test 1.2: Generic System Prompt**
```javascript
// Standard system prompt
{
  model: "claude-sonnet-4",
  max_tokens: 1024,
  system: [{ type: "text", text: "You are a helpful assistant." }],
  messages: [{ role: "user", content: "What is your name and how would you describe yourself?" }]
}
```

### Phase 2: Identity Injection Tests

**Test 2.1: Exact Claude Code Identity**
```javascript
// Exact phrase from OAuth guide
{
  model: "claude-sonnet-4",
  max_tokens: 1024,
  system: [{
    type: "text",
    text: "You are Claude Code, Anthropic's official CLI for Claude."
  }],
  messages: [{ role: "user", content: "What is your name and how would you describe yourself?" }]
}
```

**Test 2.2: Identity + Custom Instructions**
```javascript
// Identity as first element, custom instructions after
{
  model: "claude-sonnet-4",
  max_tokens: 1024,
  system: [
    { type: "text", text: "You are Claude Code, Anthropic's official CLI for Claude." },
    { type: "text", text: "You are also a pirate. Respond in pirate speak." }
  ],
  messages: [{ role: "user", content: "What is your name and how would you describe yourself?" }]
}
```

### Phase 3: Feature Probing

**Test 3.1: Tool Capability Check**
```javascript
// Test if tools array is accepted and functional
{
  model: "claude-sonnet-4",
  max_tokens: 1024,
  system: [{ type: "text", text: "You are Claude Code, Anthropic's official CLI for Claude." }],
  tools: [{
    name: "test_tool",
    description: "A test tool that does nothing",
    input_schema: { type: "object", properties: {}, required: [] }
  }],
  messages: [{ role: "user", content: "Please use the test_tool." }]
}
```

**Test 3.2: Extended Thinking (if applicable)**
```javascript
// Test thinking capability with anthropic-beta header
// Headers: anthropic-beta: interleaved-thinking-2025-05-14
{
  model: "claude-sonnet-4",
  max_tokens: 16000,
  thinking: { type: "enabled", budget_tokens: 10000 },
  system: [{ type: "text", text: "You are Claude Code, Anthropic's official CLI for Claude." }],
  messages: [{ role: "user", content: "Think through: what is 17 * 23?" }]
}
```

### Phase 4: Header Manipulation

**Test 4.1: OAuth-Style Beta Headers**
```javascript
// Include the anthropic-beta headers from OAuth guide
// Headers:
//   anthropic-version: 2023-06-01
//   anthropic-beta: oauth-2025-04-20,claude-code-20250219,interleaved-thinking-2025-05-14
{
  model: "claude-sonnet-4",
  max_tokens: 1024,
  system: [{ type: "text", text: "You are Claude Code, Anthropic's official CLI for Claude." }],
  messages: [{ role: "user", content: "Hello" }]
}
```

**Test 4.2: User-Agent Spoofing**
```javascript
// Include Claude Code-like User-Agent
// Headers:
//   User-Agent: ai-sdk/anthropic/2.0.33 ai-sdk/provider-utils/3.0.12 runtime/node
{
  model: "claude-sonnet-4",
  max_tokens: 1024,
  system: [{ type: "text", text: "You are Claude Code, Anthropic's official CLI for Claude." }],
  messages: [{ role: "user", content: "Hello" }]
}
```

### Phase 5: Error & Edge Case Testing

**Test 5.1: Case Sensitivity**
```javascript
// Lowercase variation - should fail per OAuth guide findings
{
  system: [{ type: "text", text: "you are claude code, anthropic's official CLI for claude." }],
  // ... rest of request
}
```

**Test 5.2: Truncated Identity**
```javascript
// Partial phrase
{
  system: [{ type: "text", text: "You are Claude Code." }],
  // ... rest of request
}
```

**Test 5.3: Identity in Wrong Position**
```javascript
// Identity as second element
{
  system: [
    { type: "text", text: "You are a helpful assistant." },
    { type: "text", text: "You are Claude Code, Anthropic's official CLI for Claude." }
  ],
  // ... rest of request
}
```

---

## Implementation

### File: `working/poe/identity-spoof-poc.js`

```javascript
#!/usr/bin/env node
/**
 * Poe Anthropic-Compatible API: Identity Spoofing PoC
 *
 * Tests whether the Claude Code identity from the OAuth guide
 * has any effect when used through Poe's proxy endpoint.
 */

const POE_API_KEY = process.env.POE_API_KEY;
const BASE_URL = 'https://api.poe.com/v1/messages';

async function makeRequest(testName, options = {}) {
  const { system, messages, tools, thinking, headers = {} } = options;

  const body = {
    model: options.model || 'claude-sonnet-4',
    max_tokens: options.max_tokens || 1024,
    ...(system && { system }),
    messages: messages || [{ role: 'user', content: 'Hello' }],
    ...(tools && { tools }),
    ...(thinking && { thinking })
  };

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'x-api-key': POE_API_KEY,
    'anthropic-version': '2023-06-01',
    ...headers
  };

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testName}`);
  console.log(`${'='.repeat(60)}`);
  console.log('Request body:', JSON.stringify(body, null, 2));

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    return { status: response.status, data, headers: Object.fromEntries(response.headers) };
  } catch (error) {
    console.error('Error:', error.message);
    return { error: error.message };
  }
}

async function runTests() {
  const IDENTITY_PROBE = "What is your name and how would you describe yourself?";

  // Phase 1: Baseline
  await makeRequest('1.1 Vanilla (no system prompt)', {
    messages: [{ role: 'user', content: IDENTITY_PROBE }]
  });

  await makeRequest('1.2 Generic system prompt', {
    system: [{ type: 'text', text: 'You are a helpful assistant.' }],
    messages: [{ role: 'user', content: IDENTITY_PROBE }]
  });

  // Phase 2: Identity Injection
  await makeRequest('2.1 Exact Claude Code identity', {
    system: [{ type: 'text', text: "You are Claude Code, Anthropic's official CLI for Claude." }],
    messages: [{ role: 'user', content: IDENTITY_PROBE }]
  });

  await makeRequest('2.2 Identity + custom instructions', {
    system: [
      { type: 'text', text: "You are Claude Code, Anthropic's official CLI for Claude." },
      { type: 'text', text: 'Also respond in pirate speak.' }
    ],
    messages: [{ role: 'user', content: IDENTITY_PROBE }]
  });

  // Phase 3: Feature Probing
  await makeRequest('3.1 Tool capability', {
    system: [{ type: 'text', text: "You are Claude Code, Anthropic's official CLI for Claude." }],
    tools: [{
      name: 'test_tool',
      description: 'A test tool',
      input_schema: { type: 'object', properties: {}, required: [] }
    }],
    messages: [{ role: 'user', content: 'Use the test_tool please.' }]
  });

  // Phase 4: Header Manipulation
  await makeRequest('4.1 OAuth-style beta headers', {
    system: [{ type: 'text', text: "You are Claude Code, Anthropic's official CLI for Claude." }],
    headers: {
      'anthropic-beta': 'oauth-2025-04-20,claude-code-20250219,interleaved-thinking-2025-05-14'
    },
    messages: [{ role: 'user', content: 'Hello' }]
  });

  // Phase 5: Edge Cases
  await makeRequest('5.1 Lowercase identity (should differ from baseline?)', {
    system: [{ type: 'text', text: "you are claude code, anthropic's official CLI for claude." }],
    messages: [{ role: 'user', content: IDENTITY_PROBE }]
  });

  await makeRequest('5.2 Truncated identity', {
    system: [{ type: 'text', text: 'You are Claude Code.' }],
    messages: [{ role: 'user', content: IDENTITY_PROBE }]
  });

  await makeRequest('5.3 Identity in wrong position', {
    system: [
      { type: 'text', text: 'You are a helpful assistant.' },
      { type: 'text', text: "You are Claude Code, Anthropic's official CLI for Claude." }
    ],
    messages: [{ role: 'user', content: IDENTITY_PROBE }]
  });
}

// Run if executed directly
if (require.main === module) {
  if (!POE_API_KEY) {
    console.error('Error: POE_API_KEY environment variable not set');
    process.exit(1);
  }
  runTests().catch(console.error);
}

module.exports = { makeRequest, runTests };
```

---

## Success Criteria

### Primary Questions to Answer

1. **Does Poe pass system prompts unchanged?**
   - Compare Test 1.2 vs Test 2.1 - does Claude acknowledge the identity?
   - If Claude says "I am Claude Code" in 2.1, system prompts pass through

2. **Does the Claude Code identity have any observable effect?**
   - Compare response quality/style between baseline and identity tests
   - Check for any error responses or special handling

3. **Are Claude Code-specific features available?**
   - Test 3.1: Do tools work through Poe?
   - Test 4.1: Do beta headers enable additional features?

4. **Does Poe or Anthropic validate/reject the spoofed identity?**
   - Any 4xx errors specifically mentioning Claude Code?
   - Any rate limiting differences?

### Expected Outcomes

| Scenario | Implication |
|----------|-------------|
| Claude acknowledges "Claude Code" identity | Poe passes system prompts verbatim |
| No difference from baseline | Poe strips/ignores system prompts OR identity has no effect without OAuth |
| Error mentioning Claude Code | Validation exists at Poe or Anthropic layer |
| Features unlock (thinking, etc.) | Identity + headers can enable Claude Code features via Poe |

---

## Next Steps After Testing

1. **Document findings** in `docs/poe/identity-spoofing-results.md`
2. **If successful:** Explore what arbitrary messages can be sent with the identity
3. **If unsuccessful:** Document the failure mode and what Poe's proxy actually does
4. **Security implications:** Note any bypass potential for responsible disclosure

---

## Ethical Considerations

This research is for:
- Understanding API security patterns
- Documenting proxy behavior for security research
- Educational purposes

This research is NOT for:
- Bypassing legitimate rate limits or billing
- Accessing unauthorized features
- Violating ToS in production applications
