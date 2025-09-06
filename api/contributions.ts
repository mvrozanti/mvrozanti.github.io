// api/github-contributions.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 60 * 5; // 5 minutes

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: "Token not configured" });

  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL * 1000) {
    return res.status(200).json({ source: "cache", data: cache.data });
  }

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setFullYear(toDate.getFullYear() - 1);

  const query = `
    {
      user(login: "mvrozanti") {
        contributionsCollection(from: "${fromDate.toISOString()}", to: "${toDate.toISOString()}") {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "GitHub API error" });
    }

    const data = await response.json();
    cache = { data, timestamp: now };

    res.status(200).json({ source: "api", data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
