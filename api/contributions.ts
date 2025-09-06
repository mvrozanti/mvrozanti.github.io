// pages/api/github-contributions.js
const GITHUB_TOKEN = process.env.TOKEN_GITHUB;

export default async function handler(req, res) {
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

    const data = await response.json();
    
    // Cache the response for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(data.data.user.contributionsCollection.contributionCalendar.weeks);
  } catch (e) {
    console.error("Failed to fetch contributions:", e);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
}
