import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://didtheychange.com/api/v1";

interface ApiResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
}

async function callApi(path: string, params?: Record<string, string>): Promise<ApiResponse> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": "didtheychange-mcp/1.0" },
  });

  return response.json() as Promise<ApiResponse>;
}

const server = new McpServer({
  name: "didtheychange",
  version: "1.0.0",
});

server.tool(
  "get_stats",
  "Get overview statistics from DidTheyChange: how many companies and policy documents are monitored, how many changes were detected recently, and what categories are tracked. Use this to answer questions like 'how many companies does DidTheyChange monitor?' or 'how active have policy changes been lately?'",
  {},
  async () => {
    try {
      const result = await callApi("/stats");
      if (!result.ok) {
        return { content: [{ type: "text" as const, text: result.error || "Failed to fetch stats" }], isError: true };
      }
      return { content: [{ type: "text" as const, text: JSON.stringify(result.data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: "Failed to connect to DidTheyChange API" }], isError: true };
    }
  }
);

server.tool(
  "list_documents",
  "List all companies and policy documents monitored by DidTheyChange, grouped by company. Each company entry includes the documents being tracked (terms of service, privacy policy, etc.) and when they were last checked or changed. Use this to answer 'what companies does DidTheyChange monitor?', 'does DidTheyChange track [company]?', or 'what documents are monitored for [company]?'",
  {
    category: z.string().optional().describe("Filter by category: AI/ML, Social, Cloud/Dev, Consumer, Finance, or Communication"),
  },
  async ({ category }) => {
    try {
      const params: Record<string, string> = {};
      if (category) params.category = category;

      const result = await callApi("/documents", params);
      if (!result.ok) {
        return { content: [{ type: "text" as const, text: result.error || "Failed to fetch documents" }], isError: true };
      }
      return { content: [{ type: "text" as const, text: JSON.stringify(result.data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: "Failed to connect to DidTheyChange API" }], isError: true };
    }
  }
);

server.tool(
  "search_changes",
  "Search for recent terms of service and privacy policy changes detected by DidTheyChange. This is the primary tool for answering questions like 'did OpenAI change their terms?', 'what high-impact policy changes happened this week?', 'show me recent changes from AI companies', or 'has [company] updated their privacy policy?'. Returns change summaries with impact levels (high/medium/low), word counts, and links to full diffs.",
  {
    company: z.string().optional().describe("Filter by company slug, e.g. 'openai', 'google', 'meta', 'anthropic', 'apple', 'amazon', 'microsoft', 'stripe', 'github', 'spotify', 'discord', 'reddit', 'tiktok'"),
    category: z.string().optional().describe("Filter by category: AI/ML, Social, Cloud/Dev, Consumer, Finance, or Communication"),
    impact: z.string().optional().describe("Filter by impact level: 'high' (legal terms, arbitration, data sharing), 'medium' (structural changes), or 'low' (minor wording)"),
    since: z.string().optional().describe("Only show changes after this date (ISO 8601 format, e.g. '2026-01-01'). Defaults to 90 days ago."),
    until: z.string().optional().describe("Only show changes before this date (ISO 8601 format)"),
    limit: z.number().optional().describe("Maximum number of results to return (1-100, default 20)"),
  },
  async ({ company, category, impact, since, until, limit }) => {
    try {
      const params: Record<string, string> = {};
      if (company) params.company = company;
      if (category) params.category = category;
      if (impact) params.impact = impact;
      if (since) params.since = since;
      if (until) params.until = until;
      if (limit) params.limit = String(limit);

      const result = await callApi("/changes", params);
      if (!result.ok) {
        return { content: [{ type: "text" as const, text: result.error || "Failed to fetch changes" }], isError: true };
      }
      return { content: [{ type: "text" as const, text: JSON.stringify(result.data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: "Failed to connect to DidTheyChange API" }], isError: true };
    }
  }
);

server.tool(
  "get_change",
  "Get full details of a specific policy change by its ID. Use this after search_changes to get more information about a particular change. Returns the company name, document title, impact level, summary, AI-generated explanation, and a link to view the full diff on didtheychange.com.",
  {
    id: z.string().describe("The change ID (UUID) returned by search_changes"),
  },
  async ({ id }) => {
    try {
      const result = await callApi(`/changes/${encodeURIComponent(id)}`);
      if (!result.ok) {
        return { content: [{ type: "text" as const, text: result.error || "Change not found" }], isError: true };
      }
      return { content: [{ type: "text" as const, text: JSON.stringify(result.data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: "Failed to connect to DidTheyChange API" }], isError: true };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("didtheychange-mcp failed to start:", err);
  process.exit(1);
});
