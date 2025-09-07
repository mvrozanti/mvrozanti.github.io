import { NextApiRequest, NextApiResponse } from 'next';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ALLOWED_ORIGIN = "https://mvrozanti.github.io"

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  try {
    // Calculate dates for the past year
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

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    // Cache the response for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(data.data.user.contributionsCollection.contributionCalendar.weeks);
  } catch (error) {
    console.error("Failed to fetch contributions:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: 'Failed to fetch contributions', details: errorMessage });
  }
}
