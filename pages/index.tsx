import { useEffect, useState, useRef } from "react";

const COMMANDS = [
  {
    cmd: "whoami",
    response: ["Marcelo"],
  },
  {
    cmd: "echo 'Software Engineer, cyberpunk enthusiast, builder of sleek tools'",
    response: ["Software Engineer · Cyberpunk enthusiast · Builder of sleek tools"],
  },
  {
    cmd: "cat skills.txt",
    response: [
      "- JavaScript / TypeScript / React",
      "- Node.js / Next.js",
      "- Systems Design & Security",
      "- Trading systems & backtests",
    ],
  },
  {
    cmd: "ls ~/projects",
    response: [
      "cyberpunk-site\t★ 124\tlast: 2025-08-30",
      "neural-net-sim\t★ 78\tlast: 2025-07-12",
      "blockchain-explorer\t★ 332\tlast: 2025-06-01",
      "ascii-art-gen\t★ 9\tlast: 2025-05-17",
    ],
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

export default function Home() {
  const [displayed, setDisplayed] = useState([]);
  const [typing, setTyping] = useState("");
  const [index, setIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      if (!mounted) return;
      if (index >= COMMANDS.length) return;
      const entry = COMMANDS[index];
      setIsTyping(true);
      const text = `> ${entry.cmd}`;
      for (let i = 0; i < text.length; i++) {
        if (!mounted) return;
        setTyping((s) => s + text[i]);
        await new Promise((r) => setTimeout(r, 40 + Math.random() * 30));
      }
      setTyping("");
      setDisplayed((d) => [...d, text]);
      setIsTyping(false);
      setDisplayed((d) => [...d, ...entry.response]);
      setIndex((i) => i + 1);
    };
    const timeout = setTimeout(start, 700);
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") {
        if (isTyping) {
          const entry = COMMANDS[index];
          if (!entry) return;
          setTyping("");
          setDisplayed((d) => [...d, `> ${entry.cmd}`]);
          setIsTyping(false);
          setDisplayed((d) => [...d, ...entry.response]);
          setIndex((i) => i + 1);
        } else {
          if (index < COMMANDS.length) setIndex((i) => i + 0); // noop to trigger effect if ready
        }
      }
      if (e.key.toLowerCase() === "r") {
        setDisplayed([]);
        setTyping("");
        setIndex(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isTyping, index]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayed, typing]);

  return (
    <div className="min-h-screen bg-black flex items-start justify-start p-6 pt-6">
      <div className="relative w-full max-w-3xl">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(closest-side,rgba(0,255,100,0.06),transparent)]" />
        <div
          ref={containerRef}
          className="relative z-10 rounded-lg overflow-hidden border border-green-600/30 bg-black/95 p-6 font-mono text-green-300 text-sm shadow-[0_0_40px_rgba(0,255,0,0.06)]"
          style={{ boxShadow: '0 0 60px rgba(0,255,0,0.04)' }}
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
              </div>
            ))}
            {typing ? (
              <div className="flex items-center gap-2">
                <span className="text-green-300">{typing}</span>
                <span className="inline-block w-3 h-5 bg-green-300 animate-pulse" />
              </div>
            ) : (
              index < COMMANDS.length && (
                <div className="text-green-500/70">{`Press Enter to continue • r to restart`}</div>
              )
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_4px,rgba(0,0,0,0.08)_4px,rgba(0,0,0,0.08)_5px)] mix-blend-overlay opacity-5" />
      </div>
    </div>
  );
}

