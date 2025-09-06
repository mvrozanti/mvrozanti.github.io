import { useEffect, useState, useRef } from "react";

const AVATAR_URL = "https://avatars.githubusercontent.com/u/11381662?v=4";
const TYPING_DELAY = 40;
const TYPING_DELAY_RANDOMNESS = 40;
const IMAGE_QUALITY_DELAY = 40;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

const COMMANDS = [
  { cmd: "whoami", response: ["Marcelo Vironda Rozanti"] },
  { cmd: "w3m me.png", response: [], special: "image" },
  {
    cmd: "jq < about-me.json",
    response: [
      `[
  "Bachelor of Computer Science @ Mackenzie University",
  "Software Engineer",
  "Cyberpunk enthusiast",
  "Builder of sleek tools"
]`,
    ],
  },
  {
    cmd: "cat skills.txt",
    response: [
      "- Automation",
      "- Linguistics",
      "- Systems Design & Security",
      "- Machine Learning",
      "- FOSS",
    ],
  },
  {
    cmd: "curl https://api.github.com/users/mvrozanti/repos | column -t",
    response: [],
    dynamic: "github-projects",
  },
  {
    cmd: "gh contributions",
    response: [],
    dynamic: "github-contributions",
  },
  {
    cmd: "contact",
    response: [
      "GitHub: github.com/mvrozanti",
      "LinkedIn: linkedin.com/in/mvrozanti",
      "Email: mvrozanti@hotmail.com",
    ],
  },
];

// Format GitHub projects in a table
const formatProjects = (repos) => {
  if (!repos || !repos.length) return [];
  const rows = repos.map((repo) => {
    const date = new Date(repo.updated_at);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    return [repo.name, `★ ${repo.stargazers_count}`, `last: ${formattedDate}`];
  });
  const colWidths = [0, 0, 0];
  rows.forEach((row) => row.forEach((cell, i) => (colWidths[i] = Math.max(colWidths[i], cell.length))));
  return rows.map((row) => row.map((cell, i) => cell.padEnd(colWidths[i])).join("  "));
};

// Format contributions as text heatmap
const formatContributions = (weeks) => {
  if (!weeks || !weeks.length) return ["[No contribution data]"];
  
  const symbols = ["·", "▂", "▃", "▅", "█"];
  
  // Flatten all contribution counts to find the maximum
  const allCounts = weeks.flatMap(week => 
    week.contributionDays.map(day => day.contributionCount)
  );
  const maxCount = Math.max(...allCounts);
  
  // Create a matrix for each day of the week (0-6)
  const daysOfWeek = Array(7).fill().map(() => []);
  
  weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      if (dayOfWeek >= 0 && dayOfWeek < 7) {
        const count = day.contributionCount;
        let symbol = symbols[0]; // Default to lowest symbol
        
        if (count > 0) {
          // Calculate which symbol to use based on contribution count
          const ratio = count / maxCount;
          const symbolIndex = Math.min(
            symbols.length - 1,
            Math.floor(ratio * (symbols.length - 1)) + 1
          );
          symbol = symbols[symbolIndex];
        }
        
        daysOfWeek[dayOfWeek].push(symbol);
      }
    });
  });
  
  // Convert each day's array to a string
  return daysOfWeek.map(daySymbols => daySymbols.join(" "));
};

export default function Home() {
  const [commands, setCommands] = useState(COMMANDS);
  const [displayed, setDisplayed] = useState([]);
  const [typing, setTyping] = useState("");
  const [index, setIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [pixelationLevel, setPixelationLevel] = useState(20);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [imageCommandIndex, setImageCommandIndex] = useState(-1);
  const [showCursor, setShowCursor] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Fetch GitHub projects
  useEffect(() => {
    const fetchGitHubProjects = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/users/mvrozanti/repos?sort=updated&per_page=10"
        );
        const repos = await response.json();
        if (Array.isArray(repos)) {
          const formatted = formatProjects(repos);
          setCommands((prev) =>
            prev.map((cmd) => (cmd.dynamic === "github-projects" ? { ...cmd, response: formatted } : cmd))
          );
        }
      } catch (e) {
        console.error("Failed to fetch GitHub projects:", e);
      }
    };
    fetchGitHubProjects();
  }, []);

  // Fetch contributions using GraphQL
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const query = `
          {
            user(login: "mvrozanti") {
              contributionsCollection(from: "2024-01-01T00:00:00Z", to: "2025-01-01T00:00:00Z") {
                contributionCalendar {
                  weeks {
                    contributionDays {
                      date
                      contributionCount
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
        const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;
        const heatmap = formatContributions(weeks);
        
        setCommands((prev) =>
          prev.map((cmd) => (cmd.dynamic === "github-contributions" ? { ...cmd, response: heatmap } : cmd))
        );
      } catch (e) {
        console.error("Failed to fetch contributions:", e);
        // Fallback to empty data if API fails
        setCommands((prev) =>
          prev.map((cmd) => (cmd.dynamic === "github-contributions" ? { ...cmd, response: ["[Failed to load contribution data]"] } : cmd))
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    if (GITHUB_TOKEN) {
      fetchContributions();
    } else {
      console.error("GitHub token not found");
      setIsLoading(false);
    }
  }, []);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setShowCursor((s) => !s), 500);
    return () => clearInterval(id);
  }, []);

  // Preload avatar image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = AVATAR_URL;
    img.onload = () => {
      imageRef.current = img;
      drawPixelatedImage(20);
    };
  }, []);

  const drawPixelatedImage = (level) => {
    if (!canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;
    const maxWidth = 200;
    const ratio = Math.min(maxWidth / img.width, 1);
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width / level;
    const h = canvas.height / level;
    ctx.drawImage(img, 0, 0, w, h);
    ctx.mozImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
  };

  // Typing effect
  useEffect(() => {
    if (isLoading) return;
    let mounted = true;
    const start = async () => {
      if (!mounted || index >= commands.length) return;
      const entry = commands[index];
      setIsTyping(true);
      const text = `$ ${entry.cmd}`;
      for (let i = 0; i < text.length; i++) {
        if (!mounted) return;
        setTyping((s) => s + text[i]);
        await new Promise((r) => setTimeout(r, TYPING_DELAY + Math.random() * TYPING_DELAY_RANDOMNESS));
      }
      setTyping("");
      if (entry.special === "image") {
        setDisplayed((d) => [...d, text]);
        setImageCommandIndex(displayed.length);
        setIsEnhancing(true);
        for (let i = 20; i >= 1; i -= 0.5) {
          if (!mounted) return;
          setPixelationLevel(i);
          drawPixelatedImage(i);
          await new Promise((r) => setTimeout(r, IMAGE_QUALITY_DELAY));
        }
        setIsEnhancing(false);
      } else {
        setDisplayed((d) => [...d, text, ...entry.response]);
      }
      setIndex((i) => i + 1);
    };
    const timeout = setTimeout(start, 700);
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [index, commands, isLoading]);

  // Key handlers
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") {
        if (isTyping) {
          const entry = commands[index];
          if (!entry) return;
          setTyping("");
          if (entry.special === "image") {
            setDisplayed((d) => [...d, `> ${entry.cmd}`]);
            setImageCommandIndex(displayed.length);
            setIsEnhancing(false);
            setPixelationLevel(1);
            drawPixelatedImage(1);
          } else {
            setDisplayed((d) => [...d, `> ${entry.cmd}`, ...entry.response]);
          }
          setIsTyping(false);
          setIndex((i) => i + 1);
        }
      }
      if (e.key.toLowerCase() === "r") {
        setDisplayed([]);
        setTyping("");
        setIndex(0);
        setIsEnhancing(false);
        setImageCommandIndex(-1);
        setPixelationLevel(20);
        drawPixelatedImage(20);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isTyping, index, displayed.length, commands]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [displayed, typing, pixelationLevel]);

  return (
    <div className="min-h-screen bg-black flex items-start justify-start p-6 pt-6">
      <div className="relative w-full max-w-3xl">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(closest-side,rgba(0,255,100,0.06),transparent)]" />
        <div
          ref={containerRef}
          className="relative z-10 rounded-lg overflow-hidden bg-black/95 p-6 font-mono text-green-300 text-sm shadow-[0_0_40px_rgba(0,255,0,0.06)]"
          style={{ boxShadow: "0 0 60px rgba(0,255,0,0.04)" }}
        >
          <div className="h-4 mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500/60 shadow-[0_0_8px_rgba(0,255,0,0.6)]"></div>
            <div className="w-3 h-3 rounded-full bg-green-400/40"></div>
            <div className="w-3 h-3 rounded-full bg-green-300/20"></div>
          </div>

          <div className="space-y-1">
            {displayed.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap leading-6 text-green-200">
                {line}
                {i === imageCommandIndex && (
                  <div className="my-3">
                    {isEnhancing ? (
                      <div className="text-green-400 text-xs mb-1">[ENHANCING IMAGE...]</div>
                    ) : (
                      <div className="text-green-400 text-xs mb-1">[IMAGE ENHANCED]</div>
                    )}
                    <canvas ref={canvasRef} className="block rounded" />
                    {isEnhancing && (
                      <div className="text-green-500 text-xs mt-1">
                        RESOLUTION: {Math.round((1 - (pixelationLevel - 1) / 19) * 100)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && index >= 4 ? (
              <div className="flex items-center gap-2">
                <span className="text-green-300">$ {commands[index]?.cmd}</span>
                <span className={`inline-block w-3 h-5 bg-green-300 ${showCursor ? "opacity-100" : "opacity-0"}`} />
                <span className="text-green-500 ml-2">[loading...]</span>
              </div>
            ) : typing ? (
              <div className="flex items-center gap-2">
                <span className="text-green-300">{typing}</span>
                <span className={`inline-block w-3 h-5 bg-green-300 ${showCursor ? "opacity-100" : "opacity-0"}`} />
              </div>
            ) : index < commands.length ? (
              <div className="flex items-center">
                <span className={`inline-block w-3 h-5 bg-green-300 ml-1 ${showCursor ? "opacity-100" : "opacity-0"}`} />
              </div>
            ) : null}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_4px,rgba(0,0,0,0.08)_4px,rgba(0,0,0,0.08)_5px)] mix-blend-overlay opacity-5" />
      </div>
    </div>
  );
}
