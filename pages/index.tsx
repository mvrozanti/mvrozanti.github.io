import { useEffect, useState, useRef } from "react";

const AVATAR_URL = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80";

const COMMANDS = [
  {
    cmd: "whoami",
    response: ["Marcelo"],
  },
  {
    cmd: "display_avatar --enhance",
    response: [],
    special: "image"
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
  const [pixelationLevel, setPixelationLevel] = useState(20);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [imageCommandIndex, setImageCommandIndex] = useState(-1);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // Preload the image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = AVATAR_URL;
    img.onload = () => {
      imageRef.current = img;
      if (canvasRef.current) {
        drawPixelatedImage(20);
      }
    };
  }, []);

  const drawPixelatedImage = (level) => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Set canvas size to match image aspect ratio but limited width
    const maxWidth = 300;
    const ratio = Math.min(maxWidth / img.width, 1);
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pixelated image
    const w = canvas.width / level;
    const h = canvas.height / level;
    
    // Draw original image at small size
    ctx.drawImage(img, 0, 0, w, h);
    // Stretch the small image to full size
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      if (!mounted || index >= COMMANDS.length) return;
      
      const entry = COMMANDS[index];
      setIsTyping(true);
      
      // Type the command
      const text = `> ${entry.cmd}`;
      for (let i = 0; i < text.length; i++) {
        if (!mounted) return;
        setTyping((s) => s + text[i]);
        await new Promise((r) => setTimeout(r, 40 + Math.random() * 30));
      }
      
      setTyping("");
      
      // For image command, we'll handle it specially
      if (entry.special === "image") {
        setDisplayed((d) => [...d, text]);
        setImageCommandIndex(displayed.length);
        setIsEnhancing(true);
        
        // Gradually enhance image quality (reduce pixelation)
        for (let i = 20; i >= 1; i -= 0.5) {
          if (!mounted) return;
          setPixelationLevel(i);
          drawPixelatedImage(i);
          await new Promise((r) => setTimeout(r, 80));
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
  }, [index]);

  // Key handlers
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") {
        if (isTyping) {
          const entry = COMMANDS[index];
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
        } else {
          if (index < COMMANDS.length) setIndex((i) => i + 0);
        }
      }
      if (e.key.toLowerCase() === "r") {
        setDisplayed([]);
        setTyping("");
        setIndex(0);
        setIsEnhancing(false);
        setImageCommandIndex(-1);
        setPixelationLevel(20);
        if (imageRef.current) {
          drawPixelatedImage(20);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isTyping, index, displayed.length]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayed, typing, pixelationLevel]);

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
                {/* Insert image after the display_avatar command */}
                {i === imageCommandIndex && (
                  <div className="my-3 p-2 border border-green-500/30 rounded bg-black/80 overflow-hidden">
                    {isEnhancing ? (
                      <div className="text-green-400 text-xs mb-1">[ENHANCING IMAGE...]</div>
                    ) : (
                      <div className="text-green-400 text-xs mb-1">[IMAGE ENHANCED]</div>
                    )}
                    <canvas 
                      ref={canvasRef} 
                      className="mx-auto block rounded border border-green-700/50"
                      style={{ 
                        filter: `brightness(${100 + (20 - pixelationLevel) * 2}%) contrast(${100 + (20 - pixelationLevel) * 3}%)`,
                        transition: 'filter 0.2s ease'
                      }}
                    />
                    {isEnhancing && (
                      <div className="text-green-500 text-xs mt-1 flex justify-between">
                        <span>RESOLUTION: {Math.round((1 - (pixelationLevel - 1) / 19) * 100)}%</span>
                        <span>ENHANCING...</span>
                      </div>
                    )}
                  </div>
                )}
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
