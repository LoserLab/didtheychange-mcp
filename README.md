# didtheychange-mcp

MCP server for [DidTheyChange](https://didtheychange.com). Query terms of service and privacy policy changes at 100+ companies directly from Claude.

## Install

### Claude Code

```bash
claude mcp add didtheychange -- npx didtheychange-mcp
```

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "didtheychange": {
      "command": "npx",
      "args": ["-y", "didtheychange-mcp"]
    }
  }
}
```

No API key needed. The DidTheyChange API is free and public.

## Tools

### `search_changes`

Search recent policy changes with filters. The main tool for answering "did [company] change their terms?"

```
"Did OpenAI update their terms of service recently?"
"Show me high-impact policy changes from AI companies this month"
"What privacy policy changes happened at Google?"
```

Parameters: `company`, `category`, `impact`, `since`, `until`, `limit`

### `get_stats`

Overview statistics: how many companies and documents are monitored, recent change counts.

```
"How many companies does DidTheyChange track?"
```

### `list_documents`

All monitored companies and their policy documents.

```
"What companies does DidTheyChange monitor?"
"Does DidTheyChange track Discord?"
```

Parameters: `category`

### `get_change`

Get full details of a specific change by ID (returned from `search_changes`).

## Categories

- AI/ML (OpenAI, Anthropic, Midjourney, etc.)
- Social (Reddit, Discord, TikTok, X, etc.)
- Cloud/Dev (GitHub, Vercel, Cloudflare, etc.)
- Consumer (Uber, Airbnb, DoorDash, etc.)
- Finance (Stripe, PayPal, Coinbase, etc.)
- Communication (Slack, Zoom, WhatsApp, etc.)

## Impact Levels

- **high**: Changes to legal terms like arbitration, liability, data sharing, AI training rights
- **medium**: Structural changes, new sections, policy reorganization
- **low**: Minor wording updates, formatting, clarifications

## Links

- Website: [didtheychange.com](https://didtheychange.com)
- Public feed: [didtheychange.com/feed](https://didtheychange.com/feed)
- API docs: [didtheychange.com/llms.txt](https://didtheychange.com/llms.txt)

## Author

Built by [heathen](https://github.com/LoserLab) on [Mirra](https://x.com/mirra)

## License

MIT
