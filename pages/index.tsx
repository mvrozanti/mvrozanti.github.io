import { useEffect, useState, useRef, useCallback } from "react";

const AVATAR_URL = "https://avatars.githubusercontent.com/u/11381662?v=4";
const AVATAR_SIZE = 200;
const RESUME_URL = "https://raw.githubusercontent.com/mvrozanti/cv/refs/heads/master/out/resume.png";
const RESUME_SIZE = 600;
const TYPING_DELAY = 35;
const TYPING_DELAY_RANDOMNESS = 40;
const IMAGE_QUALITY_DELAY = 30;

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
    cmd: "gh contributions",
    response: [],
    dynamic: "github-contributions",
  },
  {
    cmd: "contact",
    response: [
      <span key="github">GitHub: <a
        href="https://github.com/mvrozanti"
        target="_blank"
        rel="noopener noreferrer"
        className="text-inherit hover:text-inherit underline"
      >github.com/mvrozanti</a></span>,
      <span key="linkedin">LinkedIn: <a
        href="https://linkedin.com/in/mvrozanti"
        target="_blank"
        rel="noopener noreferrer"
        className="text-inherit hover:text-inherit underline"
      >linkedin.com/in/mvrozanti</a></span>,
      <span key="email">Email: <a
        href="mailto:mvrozanti@hotmail.com"
        className="text-inherit hover:text-inherit underline"
      >mvrozanti@hotmail.com</a></span>,
    ],
  },
  { cmd: "tmux split-window -h", response: ["Split pane created"], special: "split" },
  { cmd: "w3m resume.png", response: [], special: "resume-image", pane: "right" },
];

const formatContributions = (weeks) => {
  if (!weeks || !weeks.length) return null;
  const symbol = "■";
  const allCounts = [];
  weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      allCounts.push(day.contributionCount);
    });
  });
  const maxCount = Math.max(...allCounts, 1);
  const daysOfWeek = Array(7).fill().map(() => []);
  weeks.forEach(week => {
    const weekContributions = Array(7).fill(0);
    week.contributionDays.forEach(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      weekContributions[dayOfWeek] = day.contributionCount;
    });
    for (let i = 0; i < 7; i++) {
      daysOfWeek[i].push(weekContributions[i]);
    }
  });
  const reorderedDays = [
    daysOfWeek[6],
    daysOfWeek[0],
    daysOfWeek[1],
    daysOfWeek[2],
    daysOfWeek[3],
    daysOfWeek[4],
    daysOfWeek[5],
  ];
  const result = [];
  for (let day = 0; day < 7; day++) {
    const dayElements = [];
    reorderedDays[day].forEach((count, weekIndex) => {
      let intensity = 0;
      if (count > 0) {
        intensity = Math.min(4, Math.ceil((count / maxCount) * 4));
      }
      const colors = [
        "#161b22",
        "#0e4429",
        "#006d32",
        "#26a641",
        "#39d353",
      ];
      dayElements.push(
        <span
          key={weekIndex}
          className="contrib-cell"
          style={{ color: colors[intensity] }}
        >
          {symbol}
        </span>
      );
    });
    result.push(
      <div key={day} className="contrib-row">
        {dayElements}
      </div>
    );
  }
  return result;
};

export default function Home() {
  const [commands, setCommands] = useState(COMMANDS);
  const [leftDisplayed, setLeftDisplayed] = useState([]);
  const [rightDisplayed, setRightDisplayed] = useState([]);
  const [leftTyping, setLeftTyping] = useState("");
  const [rightTyping, setRightTyping] = useState("");
  const [index, setIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [pixelationLevel, setPixelationLevel] = useState(20);
  const [resumePixelationLevel, setResumePixelationLevel] = useState(20);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isResumeEnhancing, setIsResumeEnhancing] = useState(false);
  const [imageCommandIndex, setImageCommandIndex] = useState(-1);
  const [showCursor, setShowCursor] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSplit, setIsSplit] = useState(false);
  const [activePane, setActivePane] = useState("left");
  const canvasRef = useRef(null);
  const resumeCanvasRef = useRef(null);
  const imageRef = useRef(null);
  const resumeImageRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 640px)").matches) {
      setCommands((prev) =>
        prev.map((c) => (c.special === "split" ? { ...c, cmd: "tmux split-window -v" } : c))
      );
    }
  }, []);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch('https://api.mvr.ac/contributions');
        const weeks = await response.json();
        const heatmap = formatContributions(weeks);
        setCommands((prev) =>
          prev.map((cmd) =>
            cmd.dynamic === "github-contributions"
              ? (heatmap ? { ...cmd, response: heatmap } : { ...cmd, skip: true })
              : cmd
          )
        );
      } catch (e) {
        console.error("Failed to fetch contributions:", e);
        setCommands((prev) =>
          prev.map((cmd) => (cmd.dynamic === "github-contributions" ? { ...cmd, skip: true } : cmd))
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchContributions();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setShowCursor((s) => !s), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = AVATAR_URL;
    img.onload = () => {
      imageRef.current = img;
      drawPixelatedImage(20, canvasRef, img, AVATAR_SIZE);
    };

    const resumeImg = new Image();
    resumeImg.crossOrigin = "anonymous";
    resumeImg.src = RESUME_URL;
    resumeImg.onload = () => {
      resumeImageRef.current = resumeImg;
      drawPixelatedImage(20, resumeCanvasRef, resumeImg, RESUME_SIZE);
    };
  }, []);

  const drawPixelatedImage = useCallback((level, canvasRef, image, maxWidth) => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const ratio = Math.min(maxWidth / image.width, 1);
    canvas.width = image.width * ratio;
    canvas.height = image.height * ratio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width / level;
    const h = canvas.height / level;
    ctx.drawImage(image, 0, 0, w, h);
    ctx.mozImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    let mounted = true;
    const start = async () => {
      if (!mounted || index >= commands.length) return;
      const entry = commands[index];
      if (entry.skip) {
        setIndex((i) => i + 1);
        return;
      }
      setIsTyping(true);

      if (entry.pane === "right") {
        setActivePane("right");
      }

      const text = `$ ${entry.cmd}`;

      const setTyping = entry.pane === "right" ? setRightTyping : setLeftTyping;

      for (let i = 0; i < text.length; i++) {
        if (!mounted) return;
        setTyping((s) => s + text[i]);
        await new Promise((r) => setTimeout(r, TYPING_DELAY + Math.random() * TYPING_DELAY_RANDOMNESS));
      }

      if (entry.pane === "right") {
        setRightTyping("");
      } else {
        setLeftTyping("");
      }

      if (entry.special === "split") {
        setIsSplit(true);
        setLeftDisplayed((d) => [...d, text, ...entry.response]);
      }
      else if (entry.pane === "right") {
        setRightDisplayed((d) => [...d, text]);
        setIsResumeEnhancing(true);
        for (let i = 20; i >= 1; i -= 0.5) {
          if (!mounted) return;
          setResumePixelationLevel(i);
          drawPixelatedImage(i, resumeCanvasRef, resumeImageRef.current, RESUME_SIZE);
          await new Promise((r) => setTimeout(r, IMAGE_QUALITY_DELAY));
        }
        setIsResumeEnhancing(false);
      }
      else if (entry.special === "image") {
        setLeftDisplayed((d) => [...d, text]);
        setImageCommandIndex(leftDisplayed.length);
        setIsEnhancing(true);
        for (let i = 20; i >= 1; i -= 0.5) {
          if (!mounted) return;
          setPixelationLevel(i);
          drawPixelatedImage(i, canvasRef, imageRef.current, AVATAR_SIZE);
          await new Promise((r) => setTimeout(r, IMAGE_QUALITY_DELAY));
        }
        setIsEnhancing(false);
      } else {
        setLeftDisplayed((d) => [...d, text, ...entry.response]);
      }
      setIndex((i) => i + 1);
    };
    const timeout = setTimeout(start, 700);
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [index, commands, isLoading, drawPixelatedImage]);

  const advance = useCallback(() => {
    if (!isTyping) return;
    const entry = commands[index];
    if (!entry) return;
    if (entry.skip) {
      setIsTyping(false);
      setIndex((i) => i + 1);
      return;
    }

    if (entry.pane === "right") {
      setRightTyping("");
    } else {
      setLeftTyping("");
    }

    if (entry.special === "split") {
      setIsSplit(true);
      setLeftDisplayed((d) => [...d, `$ ${entry.cmd}`, ...entry.response]);
    }
    else if (entry.pane === "right") {
      setRightDisplayed((d) => [...d, `$ ${entry.cmd}`]);
      setIsResumeEnhancing(true);
      setResumePixelationLevel(1);
      drawPixelatedImage(1, resumeCanvasRef, resumeImageRef.current, RESUME_SIZE);
    }
    else if (entry.special === "image") {
      setLeftDisplayed((d) => {
        const newDisplayed = [...d, `$ ${entry.cmd}`];
        setImageCommandIndex(newDisplayed.length - 1);
        return newDisplayed;
      });
      setIsEnhancing(true);
      setPixelationLevel(1);
      drawPixelatedImage(1, canvasRef, imageRef.current, AVATAR_SIZE);
    } else {
      setLeftDisplayed((d) => [...d, `$ ${entry.cmd}`, ...entry.response]);
    }
    setIsTyping(false);
    setIndex((i) => i + 1);
  }, [isTyping, index, commands, drawPixelatedImage]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") {
        advance();
      }
      if (e.key.toLowerCase() === "r") {
        setLeftDisplayed([]);
        setRightDisplayed([]);
        setLeftTyping("");
        setRightTyping("");
        setIndex(0);
        setIsEnhancing(false);
        setIsResumeEnhancing(false);
        setImageCommandIndex(-1);
        setPixelationLevel(20);
        setResumePixelationLevel(20);
        setIsSplit(false);
        setActivePane("left");
        drawPixelatedImage(20, canvasRef, imageRef.current, AVATAR_SIZE);
        drawPixelatedImage(20, resumeCanvasRef, resumeImageRef.current, RESUME_SIZE);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isTyping, index, commands, drawPixelatedImage]);

  useEffect(() => {
    if (index >= commands.length) return;
    const doc = document.documentElement;
    const fromBottom = doc.scrollHeight - window.innerHeight - window.scrollY;
    if (fromBottom < 300) window.scrollTo(0, doc.scrollHeight);
  }, [leftDisplayed, rightDisplayed, leftTyping, rightTyping, pixelationLevel, resumePixelationLevel, index, commands.length]);

  return (
    <div className="min-h-screen bg-black flex items-start justify-start p-0 sm:p-6 pb-[max(2rem,env(safe-area-inset-bottom))]" onClick={advance}>
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(closest-side,rgba(0,255,100,0.06),transparent)]" />
        <div className="relative z-10 rounded-lg overflow-hidden bg-black/95 m-1.5 sm:m-4 p-3 sm:p-6 border border-green-500/30 font-mono text-green-300 text-sm shadow-[0_0_60px_rgba(0,255,0,0.04)]">
          <div className="h-4 mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500/60 shadow-[0_0_8px_rgba(0,255,0,0.6)]"></div>
            <div className="w-3 h-3 rounded-full bg-green-400/40"></div>
            <div className="w-3 h-3 rounded-full bg-green-300/20"></div>
          </div>

          <div className="flex w-full items-stretch flex-col sm:flex-row" style={{ minHeight: "400px" }}>
            <div className={`${isSplit ? "w-full sm:w-1/2 sm:pr-4 pb-3 sm:pb-0 border-b sm:border-b-0 sm:border-r border-green-500/80" : "w-full"}`}>
              <div className="space-y-1">
                {leftDisplayed.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap leading-6 text-green-300">
                    {line}
                    {i === imageCommandIndex && (
                      <div className="my-3">
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

                {activePane === "left" && leftTyping && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-300">{leftTyping}</span>
                    <span className={`inline-block w-3 h-5 bg-green-300 ${showCursor ? "opacity-100" : "opacity-0"}`} />
                  </div>
                )}
              </div>
            </div>

            {isSplit && (
              <div className="w-full sm:w-1/2 sm:pl-4 pt-3 sm:pt-0">
                <div className="space-y-1">
                  {rightDisplayed.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap leading-6 text-green-300">
                      {line}
                    </div>
                  ))}

                  {rightDisplayed.length > 0 && (
                    <div className="my-3">
                      <canvas ref={resumeCanvasRef} className="block rounded mx-auto max-w-full h-auto" />
                      {isResumeEnhancing && (
                        <div className="text-green-500 text-xs mt-1 text-center">
                          RESOLUTION: {Math.round((1 - (resumePixelationLevel - 1) / 19) * 100)}%
                        </div>
                      )}
                    </div>
                  )}

                  {activePane === "right" && rightTyping && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-300">{rightTyping}</span>
                      <span className={`inline-block w-3 h-5 bg-green-300 ${showCursor ? "opacity-100" : "opacity-0"}`} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {!isSplit && !leftTyping && !rightTyping && index < commands.length && (
            <div className="flex items-center gap-2 mt-4">
              {isLoading && index >= 4 ? (
                <>
                  <span className="text-green-300">$ {commands[index]?.cmd}</span>
                  <span className={`inline-block w-3 h-5 bg-green-300 ${showCursor ? "opacity-100" : "opacity-0"}`} />
                  <span className="text-green-500 ml-2">[loading...]</span>
                </>
              ) : (
                <span className={`inline-block w-3 h-5 bg-green-300 ml-1 ${showCursor ? "opacity-100" : "opacity-0"}`} />
              )}
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_4px,rgba(0,0,0,0.08)_4px,rgba(0,0,0,0.08)_5px)] mix-blend-overlay opacity-5" />
      </div>
    </div>
  );
}
