#!/usr/bin/env python3
"""
POC: Test Poe's Anthropic-compatible API endpoint.

Usage:
    1. Copy .env.example to .env and add your POE_API_KEY
    2. pip install anthropic python-dotenv
    3. python scripts/poe_api_test.py
"""

import os
from dotenv import load_dotenv
import anthropic

load_dotenv()

def test_poe_api():
    api_key = os.getenv("POE_API_KEY")

    if not api_key or api_key == "your_poe_api_key_here":
        print("❌ POE_API_KEY not set. Copy .env.example to .env and add your key.")
        print("   Get your key at: https://poe.com/api_key")
        return False

    print("🔄 Testing Poe Anthropic-compatible API...")
    print(f"   Base URL: https://api.poe.com")
    print(f"   API Key: {api_key[:8]}...{api_key[-4:]}")
    print()

    client = anthropic.Anthropic(
        api_key=api_key,
        base_url="https://api.poe.com",
    )

    # Test with a simple message
    try:
        message = client.messages.create(
            model="claude-sonnet-4",
            max_tokens=256,
            messages=[{"role": "user", "content": "Say 'Poe API works!' and nothing else."}],
        )

        response_text = message.content[0].text
        print(f"✅ Success! Response from {message.model}:")
        print(f"   {response_text}")
        print()
        print(f"   Usage: {message.usage.input_tokens} input, {message.usage.output_tokens} output tokens")
        print(f"   Stop reason: {message.stop_reason}")
        return True

    except anthropic.AuthenticationError as e:
        print(f"❌ Authentication failed: {e}")
        print("   Check your POE_API_KEY is correct.")
        return False

    except anthropic.RateLimitError as e:
        print(f"⚠️  Rate limited: {e}")
        print("   The API works, but you've hit the 500 rpm limit.")
        return True

    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {e}")
        return False


def test_streaming():
    """Test streaming responses."""
    api_key = os.getenv("POE_API_KEY")
    if not api_key or api_key == "your_poe_api_key_here":
        return

    print("🔄 Testing streaming...")

    client = anthropic.Anthropic(
        api_key=api_key,
        base_url="https://api.poe.com",
    )

    try:
        print("   Response: ", end="", flush=True)
        with client.messages.stream(
            model="claude-sonnet-4",
            max_tokens=100,
            messages=[{"role": "user", "content": "Count from 1 to 5, one number per line."}],
        ) as stream:
            for text in stream.text_stream:
                print(text, end="", flush=True)
        print()
        print("✅ Streaming works!")
        return True

    except Exception as e:
        print(f"\n❌ Streaming error: {type(e).__name__}: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Poe Anthropic-Compatible API Test")
    print("=" * 50)
    print()

    if test_poe_api():
        print()
        test_streaming()

    print()
    print("=" * 50)
