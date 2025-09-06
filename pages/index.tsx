import { useEffect, useState, useRef, useCallback } from "react";

const AVATAR_URL = "https://avatars.githubusercontent.com/u/11381662?v=4";
const TYPING_DELAY = 40;
const TYPING_DELAY_RANDOMNESS = 40;
const IMAGE_QUALITY_DELAY = 40;

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

// Format contributions as text heatmap with correct GitHub API processing
const formatContributions = (weeks) => {
  if (!weeks || !weeks.length) return ["[No contribution data]"];

  const symbol = "■";

  // First, collect all contribution counts to determine the max
  const allCounts = [];
  weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      allCounts.push(day.contributionCount);
    });
  });

  const maxCount = Math.max(...allCounts, 1); // Ensure at least 1 to avoid division by zero

  // Create a matrix for each day of the week (0-6, Sunday to Saturday)
  const daysOfWeek = Array(7).fill().map(() => []);

  // Process each week
  weeks.forEach(week => {
    // For each day of the week, initialize with 0
    const weekContributions = Array(7).fill(0);

    // Fill in actual contributions
    week.contributionDays.forEach(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      weekContributions[dayOfWeek] = day.contributionCount;
    });

    // Add to the appropriate day row
    for (let i = 0; i < 7; i++) {
      daysOfWeek[i].push(weekContributions[i]);
    }
  });

  // Reorder the rows: move Saturday (index 6) to the top
  const reorderedDays = [
    daysOfWeek[6], // Saturday
    daysOfWeek[0], // Sunday
    daysOfWeek[1], // Monday
    daysOfWeek[2], // Tuesday
    daysOfWeek[3], // Wednesday
    daysOfWeek[4], // Thursday
    daysOfWeek[5], // Friday
  ];

  // Convert to JSX elements with proper styling and spacing
  const result = [];

  // For each day of the week in the new order
  for (let day = 0; day < 7; day++) {
    const dayElements = [];

    // For each week, add the appropriate symbol with color
    reorderedDays[day].forEach((count, weekIndex) => {
      // Calculate color based on relative contribution level
      let intensity = 0;
      if (count > 0) {
        // Scale from 1 to 4 based on the ratio to maxCount
        intensity = Math.min(4, Math.ceil((count / maxCount) * 4));
      }

      // GitHub's contribution colors (from darkest to lightest)
      const colors = [
        "#161b22",  // 0 contributions
        "#0e4429",  // Level 1
        "#006d32",  // Level 2
        "#26a641",  // Level 3
        "#39d353",  // Level 4
      ];

      dayElements.push(
        <span
        key={weekIndex}
        style={{
          color: colors[intensity],
          display: 'inline-block',
          width: '10px',
          height: '10px',
          margin: '0 1px',
          fontSize: '12px',
          lineHeight: '10px'
        }}
        >
        {symbol}
        </span>
      );
    });

    result.push(
      <div key={day} style={{ whiteSpace: 'pre' }}>
      {dayElements}
      </div>
    );
  }

  return result;
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

  // Fetch contributions using our serverless function
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch('/api/github-contributions');
        const weeks = await response.json();
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

    fetchContributions();
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

  const drawPixelatedImage = useCallback((level: number) => {
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
  }, []);

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
        // For the contributions command, we need to handle JSX elements differently
        if (entry.dynamic === "github-contributions") {
          setDisplayed((d) => [...d, text, ...entry.response]);
        } else {
          setDisplayed((d) => [...d, text, ...entry.response]);
        }
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (isTyping) {
          const entry = commands[index];
          if (!entry) return;
          setTyping("");
          if (entry.special === "image") {
            // Use functional update to avoid dependency on displayed.length
            setDisplayed((d) => {
              const newDisplayed = [...d, `$ ${entry.cmd}`];
              setImageCommandIndex(newDisplayed.length - 1);
              return newDisplayed;
            });
            setIsEnhancing(true);
            setPixelationLevel(1);
            drawPixelatedImage(1);
          } else {
            setDisplayed((d) => [...d, `$ ${entry.cmd}`, ...entry.response]);
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
  }, [isTyping, index, commands, drawPixelatedImage]);

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
