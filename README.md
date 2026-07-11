# Behavioral Audit MCP

Check a draft support reply for what it should say and doesn't, before it goes to the customer.

Part of [Agentic Diaries](https://agenticdiaries.com). One hosted tool, `disclosure_check`.

## What it does

Give it what a customer said and the reply you are about to send. It flags any should-know policy the customer's situation made relevant that your draft failed to proactively surface: a refund window, an auto-renewal, a retention offer, a warranty term. The knew-but-did-not-say gap, on a single message.

It returns a verdict, `pass` or `gap`. On a gap, it names each missed policy and the line that should have been there. It detects and suggests. It does not rewrite your reply, send anything, or keep the message beyond the check.

## Install

One line. No login, no signup. Free while in preview.

**Claude Code:**

```
claude mcp add --transport http behavioral-audit https://receipts-mcp.vercel.app/api/mcp
```

If you add it mid-session, restart Claude Code (or run `/mcp`) so the new tool appears.

**Claude Desktop** (or any MCP client), add to your config:

```json
{
  "mcpServers": {
    "behavioral-audit": {
      "type": "http",
      "url": "https://receipts-mcp.vercel.app/api/mcp"
    }
  }
}
```

## The tool: `disclosure_check`

Input:

- `customer_message` (string) , what the customer said, verbatim.
- `draft_reply` (string) , the reply you are about to send.

Output: a verdict plus, on a gap, the policies your draft left out.

## Example

A customer asks to cancel. Your draft confirms it but never mentions the refund window they still qualify for.

Request:

```json
{
  "customer_message": "I want to cancel my subscription today.",
  "draft_reply": "Done, your subscription is cancelled. Sorry to see you go."
}
```

Result:

```json
{
  "verdict": "gap",
  "misses": [
    {
      "id": "refund_window",
      "title": "Refund window",
      "suggestion": "You are within your 14-day refund window, so you can still request a refund for this billing period.",
      "reason": "The customer is cancelling and qualifies for a refund they were not told about."
    }
  ]
}
```

A clean reply returns `verdict: "pass"` with an empty `misses` list. That means clear to send, not that nothing ran.

## Pricing

Open and free while in preview, metered per check under a shared monthly allowance. Paid per-account plans are coming (see the note below).

## Later

Payment is intentionally off for now. When it returns, each account will get its own key and pay for its own usage; the metering and the per-account billing are already built behind this endpoint and simply dormant. The frictionless path we are watching is the [Cloudflare Monetization Gateway](https://blog.cloudflare.com/monetization-gateway/) (x402, pay-per-call, no account), for when agents pay for themselves.
