import { useState, useEffect, useRef } from "react";

const SCREENS = {
  SPLASH: "splash",
  HOME: "home",
  SCAN: "scan",
  AUDIO: "audio",
  SYMPTOMS: "symptoms",
  RESULT: "result",
  ABOUT: "about",
  HISTORY: "history",
};

const SCAN_TARGETS = [
  { id: "lips", label: "Lips", icon: "💋", desc: "Detects pale coloration → Anemia / Dehydration" },
  { id: "eyes", label: "Inner Eyelid", icon: "👁", desc: "Conjunctiva pallor → Anemia indicator" },
  { id: "skin", label: "Fingertip / Nail", icon: "🖐", desc: "Capillary refill & skin tone → Dehydration" },
];

const SYMPTOM_LIST = [
  { id: "fever", label: "Fever / Chills", icon: "🌡️" },
  { id: "fatigue", label: "Fatigue", icon: "😴" },
  { id: "dizzy", label: "Dizziness", icon: "💫" },
  { id: "shortBreath", label: "Shortness of Breath", icon: "😮‍💨" },
  { id: "drySkin", label: "Dry Skin / Mouth", icon: "🏜️" },
  { id: "cough", label: "Persistent Cough", icon: "🫁" },
  { id: "headache", label: "Headache", icon: "🤕" },
  { id: "darkUrine", label: "Dark Urine", icon: "💧" },
];

const DAILY_TIPS = [
  { icon: "💧", tip: "Drink at least 8 glasses of water daily to prevent dehydration." },
  { icon: "🥦", tip: "Eat iron-rich foods like spinach and lentils to reduce anemia risk." },
  { icon: "🚶", tip: "30 minutes of light exercise daily boosts circulation and immunity." },
  { icon: "😴", tip: "7–9 hours of sleep helps your body repair and maintain health markers." },
  { icon: "🫁", tip: "Practice deep breathing 5 minutes daily for better lung health." },
];

const CONDITION_TIPS = {
  "Anemia Indicator": [
    "Increase iron-rich foods: spinach, lentils, red meat",
    "Take iron supplements only after consulting a doctor",
    "Pair iron foods with vitamin C for better absorption",
  ],
  "Dehydration Signs": [
    "Drink 250ml water every 2 hours",
    "Consume electrolytes after physical activity",
    "Monitor urine color — pale yellow is ideal",
  ],
  "Respiratory Concern": [
    "Avoid smoke and dusty environments",
    "Steam inhalation can relieve mild congestion",
    "See a doctor if breathing difficulty persists",
  ],
  "Fever Risk Pattern": [
    "Rest and stay in a cool environment",
    "Use paracetamol for fever above 38.5°C",
    "Seek care immediately if fever exceeds 40°C",
  ],
};

function useTypewriter(text, speed = 35, active = true) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, active]);
  return displayed;
}

function PulseRing({ size = 120, color = "#00e5c8", delay = 0 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}`,
      position: "absolute",
      animation: `pulseRing 2.4s ease-out infinite`,
      animationDelay: `${delay}s`,
      opacity: 0,
      pointerEvents: "none",
    }} />
  );
}

function ScannerGrid() {
  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden",
      opacity: 0.07, pointerEvents: "none",
    }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={`h${i}`} style={{
          position: "absolute", left: 0, right: 0,
          top: `${i * 5}%`, height: 1,
          background: "linear-gradient(90deg, transparent, #00e5c8 50%, transparent)",
        }} />
      ))}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={`v${i}`} style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${i * 5}%`, width: 1,
          background: "linear-gradient(180deg, transparent, #00e5c8 50%, transparent)",
        }} />
      ))}
    </div>
  );
}

function CornerBracket({ pos }) {
  const s = { position: "absolute", width: 20, height: 20 };
  const corners = {
    tl: { top: 0, left: 0, borderTop: "2px solid #00e5c8", borderLeft: "2px solid #00e5c8" },
    tr: { top: 0, right: 0, borderTop: "2px solid #00e5c8", borderRight: "2px solid #00e5c8" },
    bl: { bottom: 0, left: 0, borderBottom: "2px solid #00e5c8", borderLeft: "2px solid #00e5c8" },
    br: { bottom: 0, right: 0, borderBottom: "2px solid #00e5c8", borderRight: "2px solid #00e5c8" },
  };
  return <div style={{ ...s, ...corners[pos] }} />;
}

function MetricBadge({ label, value, color, sub }) {
  return (
    <div style={{
      background: "rgba(0,229,200,0.05)",
      border: `1px solid ${color || "#00e5c8"}33`,
      borderRadius: 12, padding: "14px 18px",
      flex: 1,
    }}>
      <div style={{ color: "#6b8a9a", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ color: color || "#00e5c8", fontSize: 26, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ color: "#4a6270", fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function RiskMeter({ level }) {
  const levels = {
    low: { pct: 18, color: "#00e5c8", label: "LOW RISK" },
    moderate: { pct: 52, color: "#f59e0b", label: "MODERATE" },
    high: { pct: 84, color: "#ef4444", label: "HIGH RISK" },
  };
  const { pct, color, label } = levels[level] || levels.low;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#6b8a9a", fontSize: 11, letterSpacing: 1 }}>RISK LEVEL</span>
        <span style={{ color, fontSize: 11, letterSpacing: 2, fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ background: "#0d1f2d", borderRadius: 99, height: 8, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 99,
          background: `linear-gradient(90deg, #00e5c8, ${color})`,
          transition: "width 1.2s cubic-bezier(0.23,1,0.32,1)",
          boxShadow: `0 0 12px ${color}88`,
        }} />
      </div>
    </div>
  );
}

function StepIndicator({ current, total, labels }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < total - 1 ? 1 : 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: i < current ? "#00e5c8" : i === current ? "#00e5c822" : "#0d2e3e",
            border: `2px solid ${i <= current ? "#00e5c8" : "#0d2e3e"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            color: i < current ? "#050e17" : "#00e5c8",
            fontSize: 11, fontWeight: 700,
            transition: "all 0.3s ease",
          }}>
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{
              flex: 1, height: 2,
              background: i < current ? "#00e5c8" : "#0d2e3e",
              transition: "background 0.3s ease",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function TipCard({ tip }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0a1c28, #061420)",
      border: "1px solid #00e5c811",
      borderRadius: 14, padding: "14px 16px",
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{tip.icon}</span>
      <span style={{ color: "#6b9aaa", fontSize: 12, lineHeight: 1.6 }}>{tip.tip}</span>
    </div>
  );
}

export default function AuraApp() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [scanStep, setScanStep] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState([false, false, false]);
  const [recording, setRecording] = useState(false);
  const [audioAnalyzed, setAudioAnalyzed] = useState(false);
  const [symptoms, setSymptoms] = useState({});
  const [age, setAge] = useState(28);
  const [height, setHeight] = useState(165);
  const [weight, setWeight] = useState(65);
  const [result, setResult] = useState(null);
  const [scanLine, setScanLine] = useState(0);
  const [audioLevel, setAudioLevel] = useState(Array(32).fill(3));
  const [dots, setDots] = useState(0);
  const [history, setHistory] = useState([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [expandedCondition, setExpandedCondition] = useState(null);
  const [copied, setCopied] = useState(false);
  const [screenAnim, setScreenAnim] = useState(true);

  const bmi = weight / ((height / 100) ** 2);
  const bmiLabel = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const bmiColor = bmi < 18.5 ? "#f59e0b" : bmi < 25 ? "#00e5c8" : bmi < 30 ? "#f97316" : "#ef4444";

  const navigate = (s) => {
    setScreenAnim(false);
    setTimeout(() => { setScreen(s); setScreenAnim(true); }, 80);
  };

  useEffect(() => {
    if (screen === SCREENS.SPLASH) {
      const t = setTimeout(() => navigate(SCREENS.HOME), 3200);
      return () => clearTimeout(t);
    }
  }, [screen]);

  useEffect(() => {
    if (!scanning) return;
    let pos = 0;
    const t = setInterval(() => { pos = (pos + 2) % 100; setScanLine(pos); }, 20);
    return () => clearInterval(t);
  }, [scanning]);

  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTipIndex(i => (i + 1) % DAILY_TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => {
      setAudioLevel(Array(32).fill(0).map(() => Math.floor(Math.random() * 55 + 5)));
    }, 80);
    return () => clearInterval(t);
  }, [recording]);

  const doScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanDone(prev => { const n = [...prev]; n[scanStep] = true; return n; });
      if (scanStep < 2) setScanStep(s => s + 1);
    }, 2800);
  };

  const doRecord = () => {
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      setAudioLevel(Array(32).fill(3));
      setAudioAnalyzed(true);
    }, 4000);
  };

  const generateResult = () => {
    const sympCount = Object.values(symptoms).filter(Boolean).length;
    const hasAnemia = scanDone[1] && (symptoms.fatigue || symptoms.dizzy);
    const hasDehy = scanDone[2] && (symptoms.drySkin || symptoms.darkUrine);
    const hasResp = audioAnalyzed && (symptoms.cough || symptoms.shortBreath);
    const risk = sympCount >= 4 ? "high" : sympCount >= 2 ? "moderate" : "low";
    const bmiFlag = bmi < 18.5 || bmi >= 30;
    const newResult = {
      risk,
      bmi: bmi.toFixed(1),
      bmiLabel,
      conditions: [
        hasAnemia && { name: "Anemia Indicator", confidence: 73, color: "#ef4444", icon: "🩸" },
        hasDehy && { name: "Dehydration Signs", confidence: 81, color: "#f59e0b", icon: "💧" },
        hasResp && { name: "Respiratory Concern", confidence: 68, color: "#8b5cf6", icon: "🫁" },
        sympCount >= 3 && { name: "Fever Risk Pattern", confidence: 60, color: "#f97316", icon: "🌡️" },
        bmiFlag && { name: "BMI Concern", confidence: 88, color: "#f59e0b", icon: "⚖️" },
      ].filter(Boolean),
      score: Math.max(100 - sympCount * 11 - (bmiFlag ? 8 : 0), 32),
      advice: risk === "high"
        ? "Please visit a health worker or clinic soon. This screening detected multiple indicators."
        : risk === "moderate"
        ? "Monitor your symptoms. Rest, hydrate, and consult a health worker if symptoms persist."
        : "No significant risk detected. Stay hydrated and maintain regular health checks.",
      date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      symptoms: Object.keys(symptoms).filter(k => symptoms[k]),
      age,
    };
    setResult(newResult);
    setHistory(prev => [newResult, ...prev.slice(0, 9)]);
    navigate(SCREENS.RESULT);
  };

  const reset = () => {
    setScanStep(0); setScanDone([false, false, false]);
    setRecording(false); setAudioAnalyzed(false);
    setSymptoms({}); setAge(28); setResult(null);
    setHeight(165); setWeight(65);
    setExpandedCondition(null);
    navigate(SCREENS.HOME);
  };

  const copyResult = () => {
    if (!result) return;
    const text = `AURA Health Report · ${result.date}\nHealth Score: ${result.score}/100\nRisk: ${result.risk.toUpperCase()}\nBMI: ${result.bmi} (${result.bmiLabel})\nConditions: ${result.conditions.map(c => c.name).join(", ") || "None"}\n\n${result.advice}\n\n⚠️ Not a medical diagnosis.`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #050e17; }
    @keyframes pulseRing {
      0% { transform: scale(0.85); opacity: 0.7; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(22px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes floatGlow {
      0%,100% { transform: translateY(0); filter: drop-shadow(0 0 18px #00e5c888); }
      50% { transform: translateY(-8px); filter: drop-shadow(0 0 32px #00e5c8cc); }
    }
    @keyframes scanPulse {
      0%,100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes rotateRing {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 200px; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    .aura-btn {
      background: linear-gradient(135deg, #00e5c8, #0099aa);
      color: #050e17; border: none; border-radius: 14px;
      padding: 16px 32px; font-family: 'Syne', sans-serif;
      font-size: 15px; font-weight: 700; cursor: pointer;
      letter-spacing: 0.5px; transition: all 0.2s;
      box-shadow: 0 0 24px #00e5c844;
    }
    .aura-btn:hover { transform: translateY(-2px); box-shadow: 0 0 36px #00e5c877; }
    .aura-btn:active { transform: scale(0.97); }
    .aura-btn-ghost {
      background: transparent;
      border: 1px solid #00e5c844; color: #00e5c8;
      border-radius: 14px; padding: 14px 28px;
      font-family: 'Syne', sans-serif; font-size: 14px;
      font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .aura-btn-ghost:hover { background: #00e5c811; border-color: #00e5c8; }
    .aura-btn-danger {
      background: linear-gradient(135deg, #ef4444, #b91c1c);
      color: #fff; border: none; border-radius: 14px;
      padding: 14px 28px; font-family: 'Syne', sans-serif;
      font-size: 14px; font-weight: 700; cursor: pointer;
      letter-spacing: 0.5px; transition: all 0.2s;
      box-shadow: 0 0 24px #ef444444;
    }
    .aura-btn-danger:hover { transform: translateY(-2px); box-shadow: 0 0 36px #ef444488; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #0d1f2d; }
    ::-webkit-scrollbar-thumb { background: #00e5c844; border-radius: 99px; }
    .screen-anim { animation: fadeIn 0.3s ease; }
  `;

  const wrap = {
    fontFamily: "'Syne', sans-serif",
    background: "#050e17",
    minHeight: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
  };

  const phone = {
    width: "100%", maxWidth: 390,
    minHeight: 760,
    background: "#07141e",
    borderRadius: 40,
    overflow: "hidden",
    position: "relative",
    border: "1px solid #00e5c822",
    boxShadow: "0 0 80px #00e5c81a, 0 40px 120px #00000080",
  };

  const animClass = screenAnim ? "screen-anim" : "";

  // ═══ SPLASH ═══
  if (screen === SCREENS.SPLASH) return (
    <>
      <style>{css}</style>
      <div style={wrap}>
        <div style={{ ...phone, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
          <ScannerGrid />
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 140, height: 140 }}>
            <PulseRing size={100} delay={0} />
            <PulseRing size={100} delay={0.8} />
            <PulseRing size={100} delay={1.6} />
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "radial-gradient(circle, #00e5c822, #050e17)",
              border: "2px solid #00e5c8",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 38, animation: "floatGlow 3s ease-in-out infinite",
              zIndex: 1,
            }}>✦</div>
          </div>
          <div>
            <div style={{
              fontSize: 52, fontWeight: 800, letterSpacing: 8,
              background: "linear-gradient(135deg, #00e5c8, #ffffff, #00e5c8)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite",
              textAlign: "center",
            }}>AURA</div>
            <div style={{ color: "#4a8a9a", fontSize: 12, letterSpacing: 4, textAlign: "center", marginTop: 4 }}>
              AI HEALTH SCREENING
            </div>
          </div>
          <div style={{ color: "#1e4a5e", fontSize: 13, letterSpacing: 2, animation: "blink 1.2s ease infinite" }}>
            INITIALIZING{".".repeat(dots)}
          </div>
          <div style={{ position: "absolute", bottom: 40, color: "#1a3a4a", fontSize: 11, letterSpacing: 1 }}>
            OFFLINE CAPABLE · AI-POWERED · FREE
          </div>
        </div>
      </div>
    </>
  );

  // ═══ HOME ═══
  if (screen === SCREENS.HOME) return (
    <>
      <style>{css}</style>
      <div style={wrap}>
        <div className={animClass} style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 18, maxHeight: 820, overflowY: "auto" }}>
          <ScannerGrid />
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ color: "#00e5c8", fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>AURA</div>
              <div style={{ color: "#2a5a6a", fontSize: 10, letterSpacing: 2 }}>HEALTH SCREENING v2.0</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {history.length > 0 && (
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "1px solid #00e5c833",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#00e5c8", cursor: "pointer", fontSize: 16,
                  position: "relative",
                }} onClick={() => navigate(SCREENS.HISTORY)}>
                  📋
                  <div style={{
                    position: "absolute", top: -4, right: -4,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#00e5c8", color: "#050e17",
                    fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{history.length}</div>
                </div>
              )}
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1px solid #00e5c833",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#00e5c8", cursor: "pointer", fontSize: 16,
              }} onClick={() => navigate(SCREENS.ABOUT)}>ⓘ</div>
            </div>
          </div>

          {/* Hero */}
          <div style={{
            background: "linear-gradient(135deg, #0d2333, #071420)",
            borderRadius: 24, padding: "24px 20px",
            border: "1px solid #00e5c811", position: "relative", overflow: "hidden",
            animation: "fadeSlideUp 0.6s ease",
          }}>
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 120, height: 120, borderRadius: "50%",
              background: "radial-gradient(circle, #00e5c818, transparent)",
            }} />
            <div style={{ fontSize: 36, marginBottom: 10, animation: "floatGlow 3s ease-in-out infinite" }}>🫀</div>
            <div style={{ color: "#e8f4f8", fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
              Detect Health Conditions Early
            </div>
            <div style={{ color: "#4a7a8a", fontSize: 12, lineHeight: 1.6 }}>
              Camera · Mic · Symptoms → Screen for anemia, dehydration & respiratory issues — <span style={{ color: "#00e5c8" }}>100% offline.</span>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "flex", gap: 10 }}>
            <MetricBadge label="Mode" value="OFFLINE" sub="No internet needed" />
            <MetricBadge label="Scans Done" value={history.length} color="#8b5cf6" sub="Local history" />
          </div>

          {/* Start CTA */}
          <button className="aura-btn" style={{ width: "100%", fontSize: 16, padding: "18px 0" }}
            onClick={() => navigate(SCREENS.SCAN)}>
            ▶ Begin Health Scan
          </button>

          {/* Daily Tip */}
          <div style={{
            background: "#040f18", borderRadius: 16,
            border: "1px solid #00e5c811", padding: "14px 16px",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ color: "#2a5a6a", fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>DAILY HEALTH TIP</div>
            <TipCard tip={DAILY_TIPS[tipIndex]} />
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10 }}>
              {DAILY_TIPS.map((_, i) => (
                <div key={i} onClick={() => setTipIndex(i)} style={{
                  width: i === tipIndex ? 18 : 6, height: 6, borderRadius: 99,
                  background: i === tipIndex ? "#00e5c8" : "#0d2e3e",
                  cursor: "pointer", transition: "all 0.3s ease",
                }} />
              ))}
            </div>
          </div>

          {/* Last scan preview */}
          {history.length > 0 && (
            <div style={{
              background: "#0a1c28", borderRadius: 16, padding: "14px 16px",
              border: "1px solid #0d2e3e",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ color: "#2a5a6a", fontSize: 10, letterSpacing: 2 }}>LAST SCAN</div>
                <div style={{
                  padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: 1,
                  background: history[0].risk === "high" ? "#ef444422" : history[0].risk === "moderate" ? "#f59e0b22" : "#00e5c822",
                  color: history[0].risk === "high" ? "#ef4444" : history[0].risk === "moderate" ? "#f59e0b" : "#00e5c8",
                }}>
                  {history[0].risk.toUpperCase()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "#0d2e3e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontSize: 16, fontWeight: 800, fontFamily: "'Space Mono', monospace",
                    color: history[0].score >= 70 ? "#00e5c8" : history[0].score >= 50 ? "#f59e0b" : "#ef4444",
                  }}>{history[0].score}</span>
                </div>
                <div>
                  <div style={{ color: "#8ecfe0", fontSize: 12 }}>{history[0].date}</div>
                  <div style={{ color: "#2a5a6a", fontSize: 11, marginTop: 2 }}>
                    {history[0].conditions.length > 0 ? history[0].conditions.map(c => c.icon).join(" ") + " " + history[0].conditions.length + " indicator(s)" : "No conditions found"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Condition cards */}
          <div style={{ color: "#2a5a6a", fontSize: 11, letterSpacing: 2, marginBottom: -6 }}>DETECTABLE CONDITIONS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "🩸", name: "Anemia", method: "Camera · Lips" },
              { icon: "💧", name: "Dehydration", method: "Camera · Skin" },
              { icon: "🫁", name: "Respiratory", method: "Microphone" },
              { icon: "🌡️", name: "Fever Risk", method: "Symptoms" },
            ].map(c => (
              <div key={c.name} style={{
                background: "#0a1c28", borderRadius: 14, padding: "14px",
                border: "1px solid #0d2e3e",
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                <div style={{ color: "#c8e8f0", fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                <div style={{ color: "#2a5a6a", fontSize: 11, marginTop: 2 }}>{c.method}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ═══ SCAN ═══
  if (screen === SCREENS.SCAN) {
    const target = SCAN_TARGETS[scanStep];
    return (
      <>
        <style>{css}</style>
        <div style={wrap}>
          <div className={animClass} style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
            <ScannerGrid />
            {/* Back + Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
              <button className="aura-btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}
                onClick={() => navigate(SCREENS.HOME)}>← Back</button>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#2a5a6a", fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>
                  STEP 1 OF 3 · VISUAL SCAN
                </div>
                <StepIndicator current={scanStep} total={3} />
              </div>
            </div>

            {/* Target info */}
            <div style={{ textAlign: "center", animation: "fadeSlideUp 0.4s ease" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{target.icon}</div>
              <div style={{ color: "#e8f4f8", fontSize: 20, fontWeight: 700 }}>Scan: {target.label}</div>
              <div style={{ color: "#4a7a8a", fontSize: 13, marginTop: 4 }}>{target.desc}</div>
            </div>

            {/* Camera viewport */}
            <div style={{
              position: "relative", width: "100%", paddingBottom: "75%",
              background: "linear-gradient(135deg, #040f18, #081824)",
              borderRadius: 20, border: "1px solid #00e5c822", overflow: "hidden",
            }}>
              <CornerBracket pos="tl" />
              <CornerBracket pos="tr" />
              <CornerBracket pos="bl" />
              <CornerBracket pos="br" />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                {scanning ? (
                  <>
                    <div style={{
                      position: "absolute", left: 0, right: 0, top: `${scanLine}%`, height: 2,
                      background: "linear-gradient(90deg, transparent, #00e5c8, transparent)",
                      boxShadow: "0 0 16px #00e5c8", transition: "top 0.02s linear",
                    }} />
                    <div style={{ color: "#00e5c8", fontSize: 13, letterSpacing: 2, animation: "scanPulse 1s ease infinite" }}>
                      ANALYZING{".".repeat(dots)}
                    </div>
                    <div style={{
                      width: 60, height: 60, borderRadius: "50%",
                      border: "2px solid #00e5c8", borderTopColor: "transparent",
                      animation: "rotateRing 0.8s linear infinite",
                    }} />
                  </>
                ) : scanDone[scanStep] ? (
                  <>
                    <div style={{ fontSize: 44, filter: "drop-shadow(0 0 16px #00e5c8)", animation: "countUp 0.4s ease" }}>✓</div>
                    <div style={{ color: "#00e5c8", fontSize: 13, letterSpacing: 2 }}>SCAN COMPLETE</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 32, opacity: 0.4 }}>📷</div>
                    <div style={{ color: "#2a5a6a", fontSize: 12, letterSpacing: 1, textAlign: "center", padding: "0 24px" }}>
                      Position your {target.label.toLowerCase()} within the frame
                    </div>
                  </>
                )}
              </div>
              {scanning && (
                <div style={{
                  position: "absolute", inset: 0, opacity: 0.12,
                  backgroundImage: "repeating-linear-gradient(0deg, #00e5c8 0px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, #00e5c8 0px, transparent 1px, transparent 24px)",
                }} />
              )}
            </div>

            {/* CNN info */}
            <div style={{
              background: "#0a1c28", borderRadius: 14, padding: "12px 16px",
              border: "1px solid #0d2e3e", display: "flex", gap: 10, alignItems: "center",
            }}>
              <div style={{ color: "#00e5c8", fontSize: 20 }}>🧠</div>
              <div>
                <div style={{ color: "#8ecfe0", fontSize: 12, fontWeight: 700 }}>CNN Image Model</div>
                <div style={{ color: "#2a5a6a", fontSize: 11 }}>MobileNetV2 · TFLite · On-device · &lt;50ms</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                {scanDone.map((done, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: done ? "#00e5c8" : "#0d2e3e",
                    boxShadow: done ? "0 0 6px #00e5c8" : "none",
                    transition: "all 0.3s",
                  }} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              {!scanning && !scanDone[scanStep] && (
                <button className="aura-btn" style={{ flex: 1 }} onClick={doScan}>
                  📸 Capture & Analyze
                </button>
              )}
              {scanning && (
                <div style={{
                  flex: 1, padding: 16, textAlign: "center",
                  color: "#00e5c8", fontSize: 14, letterSpacing: 1,
                  background: "#00e5c811", borderRadius: 14,
                }}>
                  Processing{".".repeat(dots)}
                </div>
              )}
              {scanDone[scanStep] && scanStep < 2 && (
                <button className="aura-btn" style={{ flex: 1 }} onClick={() => setScanStep(s => s + 1)}>
                  Next Scan →
                </button>
              )}
              {scanDone[2] && (
                <button className="aura-btn" style={{ flex: 1 }} onClick={() => navigate(SCREENS.AUDIO)}>
                  Continue → Audio
                </button>
              )}
              {!scanDone[scanStep] && (
                <button className="aura-btn-ghost" onClick={() => {
                  setScanDone(prev => { const n = [...prev]; n[scanStep] = true; return n; });
                  if (scanStep < 2) setScanStep(s => s + 1);
                  else navigate(SCREENS.AUDIO);
                }}>Skip</button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ═══ AUDIO ═══
  if (screen === SCREENS.AUDIO) return (
    <>
      <style>{css}</style>
      <div style={wrap}>
        <div className={animClass} style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          <ScannerGrid />
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
            <button className="aura-btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}
              onClick={() => navigate(SCREENS.SCAN)}>← Back</button>
            <div style={{ color: "#2a5a6a", fontSize: 11, letterSpacing: 2 }}>STEP 2 OF 3 · AUDIO ANALYSIS</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 10, animation: "floatGlow 2s ease-in-out infinite" }}>🎤</div>
            <div style={{ color: "#e8f4f8", fontSize: 20, fontWeight: 700 }}>Cough & Breath Analysis</div>
            <div style={{ color: "#4a7a8a", fontSize: 13, marginTop: 6 }}>
              Take a deep breath and cough naturally 2–3 times into the microphone
            </div>
          </div>

          {/* Waveform visualizer */}
          <div style={{
            background: "#040f18", borderRadius: 20,
            border: "1px solid #00e5c822", padding: "24px 16px",
            position: "relative", overflow: "hidden",
          }}>
            <CornerBracket pos="tl" /><CornerBracket pos="tr" />
            <CornerBracket pos="bl" /><CornerBracket pos="br" />
            <div style={{ display: "flex", alignItems: "center", height: 80, gap: 2, justifyContent: "center" }}>
              {audioLevel.map((v, i) => (
                <div key={i} style={{
                  width: 6, borderRadius: 99,
                  height: `${v}%`, minHeight: 4,
                  background: recording
                    ? `hsl(${168 + i * 2}, 80%, ${40 + v * 0.2}%)`
                    : audioAnalyzed ? "#00e5c855" : "#0d2e3e",
                  transition: recording ? "height 0.08s ease" : "height 0.5s ease",
                  boxShadow: recording ? `0 0 6px #00e5c888` : "none",
                }} />
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 12, color: recording ? "#00e5c8" : "#2a5a6a", fontSize: 12, letterSpacing: 2 }}>
              {recording ? `● RECORDING${".".repeat(dots)}` : audioAnalyzed ? "✓ ANALYSIS COMPLETE" : "READY TO RECORD"}
            </div>
          </div>

          {/* MFCC info */}
          <div style={{ background: "#0a1c28", borderRadius: 14, padding: "14px 16px", border: "1px solid #0d2e3e" }}>
            <div style={{ color: "#8ecfe0", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>🧠 Audio Model Pipeline</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Raw Audio", "→", "MFCC Features", "→", "CNN Classifier", "→", "Normal / Abnormal"].map((s, i) => (
                <span key={i} style={{
                  color: s === "→" ? "#2a5a6a" : "#4a9ab0", fontSize: 11,
                  background: s !== "→" ? "#0d2e3e" : "transparent",
                  padding: s !== "→" ? "3px 8px" : "0", borderRadius: 6,
                }}>{s}</span>
              ))}
            </div>
            {audioAnalyzed && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#00340e", borderRadius: 10, color: "#00e5c8", fontSize: 12, animation: "fadeIn 0.4s ease" }}>
                ✓ Pattern: <strong>Mild bronchial resonance</strong> detected · 68% confidence
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {!recording && !audioAnalyzed && (
              <button className="aura-btn" style={{ flex: 1 }} onClick={doRecord}>
                🔴 Start Recording
              </button>
            )}
            {recording && (
              <div style={{
                flex: 1, padding: 16, textAlign: "center", color: "#ef4444",
                background: "#ef444411", borderRadius: 14, fontSize: 14,
                animation: "scanPulse 1s ease infinite",
              }}>
                ● Recording{".".repeat(dots)}
              </div>
            )}
            {audioAnalyzed && (
              <button className="aura-btn" style={{ flex: 1 }} onClick={() => navigate(SCREENS.SYMPTOMS)}>
                Continue → Symptoms
              </button>
            )}
            {!recording && (
              <button className="aura-btn-ghost" onClick={() => navigate(SCREENS.SYMPTOMS)}>Skip</button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // ═══ SYMPTOMS ═══
  if (screen === SCREENS.SYMPTOMS) return (
    <>
      <style>{css}</style>
      <div style={wrap}>
        <div className={animClass} style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 18, maxHeight: 820, overflowY: "auto" }}>
          <ScannerGrid />
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
            <button className="aura-btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}
              onClick={() => navigate(SCREENS.AUDIO)}>← Back</button>
            <div style={{ color: "#2a5a6a", fontSize: 11, letterSpacing: 2 }}>STEP 3 OF 3 · SYMPTOMS</div>
          </div>

          <div>
            <div style={{ color: "#e8f4f8", fontSize: 20, fontWeight: 700 }}>Patient Information</div>
            <div style={{ color: "#4a7a8a", fontSize: 13, marginTop: 4 }}>Enter your details and select symptoms</div>
          </div>

          {/* Age slider */}
          <div style={{ background: "#0a1c28", borderRadius: 16, padding: "16px", border: "1px solid #0d2e3e" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "#6b8a9a", fontSize: 12 }}>AGE</span>
              <span style={{ color: "#00e5c8", fontSize: 18, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{age}</span>
            </div>
            <input type="range" min={5} max={90} value={age}
              onChange={e => setAge(+e.target.value)}
              style={{ width: "100%", accentColor: "#00e5c8" }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#2a5a6a", fontSize: 10, marginTop: 4 }}>
              <span>5</span><span>90</span>
            </div>
          </div>

          {/* BMI Calculator */}
          <div style={{ background: "#0a1c28", borderRadius: 16, padding: "16px", border: "1px solid #0d2e3e" }}>
            <div style={{ color: "#6b8a9a", fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>BMI CALCULATOR</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#4a7a8a", fontSize: 11, marginBottom: 6 }}>Height (cm)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="range" min={100} max={220} value={height}
                    onChange={e => setHeight(+e.target.value)}
                    style={{ flex: 1, accentColor: "#00e5c8" }} />
                  <span style={{ color: "#00e5c8", fontSize: 14, fontFamily: "'Space Mono', monospace", fontWeight: 700, minWidth: 36 }}>{height}</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#4a7a8a", fontSize: 11, marginBottom: 6 }}>Weight (kg)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="range" min={20} max={180} value={weight}
                    onChange={e => setWeight(+e.target.value)}
                    style={{ flex: 1, accentColor: "#00e5c8" }} />
                  <span style={{ color: "#00e5c8", fontSize: 14, fontFamily: "'Space Mono', monospace", fontWeight: 700, minWidth: 36 }}>{weight}</span>
                </div>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#0d2e3e", borderRadius: 10, padding: "10px 14px",
            }}>
              <span style={{ color: "#6b8a9a", fontSize: 12 }}>BMI</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: bmiColor, fontSize: 20, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{bmi.toFixed(1)}</span>
                <span style={{
                  padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                  background: `${bmiColor}22`, color: bmiColor,
                }}>{bmiLabel}</span>
              </div>
            </div>
          </div>

          {/* Symptom grid */}
          <div style={{ color: "#2a5a6a", fontSize: 11, letterSpacing: 2 }}>CURRENT SYMPTOMS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SYMPTOM_LIST.map(s => (
              <button key={s.id} onClick={() => setSymptoms(p => ({ ...p, [s.id]: !p[s.id] }))}
                style={{
                  background: symptoms[s.id] ? "linear-gradient(135deg, #003d30, #00261e)" : "#0a1c28",
                  border: `1px solid ${symptoms[s.id] ? "#00e5c8" : "#0d2e3e"}`,
                  borderRadius: 14, padding: "14px 12px", cursor: "pointer",
                  textAlign: "left", transition: "all 0.2s",
                  boxShadow: symptoms[s.id] ? "0 0 12px #00e5c822" : "none",
                }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ color: symptoms[s.id] ? "#00e5c8" : "#8ecfe0", fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                {symptoms[s.id] && <div style={{ color: "#00e5c888", fontSize: 10, marginTop: 2 }}>✓ Selected</div>}
              </button>
            ))}
          </div>

          <div style={{ color: "#4a7a8a", fontSize: 12, textAlign: "center" }}>
            {Object.values(symptoms).filter(Boolean).length} symptom(s) selected
          </div>

          <button className="aura-btn" style={{ width: "100%", fontSize: 16, padding: "18px 0" }}
            onClick={generateResult}>
            🧠 Generate AI Report
          </button>
        </div>
      </div>
    </>
  );

  // ═══ RESULT ═══
  if (screen === SCREENS.RESULT && result) return (
    <>
      <style>{css}</style>
      <div style={wrap}>
        <div className={animClass} style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 16, maxHeight: 820, overflowY: "auto" }}>
          <ScannerGrid />
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ color: "#00e5c8", fontSize: 13, letterSpacing: 3, fontFamily: "'Space Mono', monospace" }}>AURA REPORT</div>
              <div style={{ color: "#2a5a6a", fontSize: 10 }}>{result.date}</div>
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: 99,
              background: result.risk === "high" ? "#ef444422" : result.risk === "moderate" ? "#f59e0b22" : "#00e5c822",
              border: `1px solid ${result.risk === "high" ? "#ef4444" : result.risk === "moderate" ? "#f59e0b" : "#00e5c8"}44`,
              color: result.risk === "high" ? "#ef4444" : result.risk === "moderate" ? "#f59e0b" : "#00e5c8",
              fontSize: 10, fontWeight: 700, letterSpacing: 2,
            }}>
              {result.risk.toUpperCase()}
            </div>
          </div>

          {/* Score circle + BMI */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="120" height="120" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#0d2e3e" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={result.score >= 70 ? "#00e5c8" : result.score >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(result.score / 100) * 314} 314`}
                  style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.23,1,0.32,1)" }}
                />
              </svg>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 28, fontWeight: 800, fontFamily: "'Space Mono', monospace",
                  color: result.score >= 70 ? "#00e5c8" : result.score >= 50 ? "#f59e0b" : "#ef4444",
                  animation: "countUp 0.8s ease",
                }}>{result.score}</div>
                <div style={{ color: "#2a5a6a", fontSize: 9, letterSpacing: 1 }}>SCORE</div>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "#0a1c28", borderRadius: 12, padding: "10px 14px", border: "1px solid #0d2e3e" }}>
                <div style={{ color: "#6b8a9a", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>BMI</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: bmiColor, fontSize: 18, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{result.bmi}</span>
                  <span style={{ color: bmiColor, fontSize: 10 }}>{result.bmiLabel}</span>
                </div>
              </div>
              <div style={{ background: "#0a1c28", borderRadius: 12, padding: "10px 14px", border: "1px solid #0d2e3e" }}>
                <div style={{ color: "#6b8a9a", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>AGE</div>
                <div style={{ color: "#00e5c8", fontSize: 18, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{result.age} yrs</div>
              </div>
            </div>
          </div>

          {/* Risk meter */}
          <div style={{ background: "#0a1c28", borderRadius: 16, padding: "14px", border: "1px solid #0d2e3e" }}>
            <RiskMeter level={result.risk} />
          </div>

          {/* Emergency alert for high risk */}
          {result.risk === "high" && (
            <div style={{
              background: "linear-gradient(135deg, #1a0808, #2a0a0a)",
              border: "1px solid #ef444444", borderRadius: 16, padding: "14px 16px",
              animation: "fadeIn 0.5s ease",
            }}>
              <div style={{ color: "#ef4444", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>⚠️ HIGH RISK DETECTED</div>
              <div style={{ color: "#9a4a4a", fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
                Multiple health indicators found. Please seek medical attention promptly.
              </div>
              <button className="aura-btn-danger" style={{ width: "100%", padding: "12px 0", fontSize: 13 }}>
                📞 Find Nearest Clinic
              </button>
            </div>
          )}

          {/* Conditions with expandable tips */}
          {result.conditions.length > 0 && (
            <div>
              <div style={{ color: "#2a5a6a", fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>DETECTED INDICATORS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.conditions.map((c, i) => (
                  <div key={i} style={{
                    background: "#0a1c28", borderRadius: 14,
                    border: `1px solid ${expandedCondition === i ? c.color + "44" : c.color + "22"}`,
                    overflow: "hidden", transition: "border-color 0.2s",
                  }}>
                    <div style={{
                      padding: "14px", display: "flex", gap: 12, alignItems: "center",
                      cursor: "pointer",
                    }} onClick={() => setExpandedCondition(expandedCondition === i ? null : i)}>
                      <div style={{ fontSize: 24 }}>{c.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#c8e8f0", fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                        <div style={{ marginTop: 4, background: "#0d2e3e", borderRadius: 99, height: 4 }}>
                          <div style={{
                            width: `${c.confidence}%`, height: "100%", borderRadius: 99,
                            background: `linear-gradient(90deg, ${c.color}88, ${c.color})`,
                            boxShadow: `0 0 8px ${c.color}66`,
                          }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <div style={{ color: c.color, fontSize: 13, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
                          {c.confidence}%
                        </div>
                        <div style={{ color: "#2a5a6a", fontSize: 10 }}>{expandedCondition === i ? "▲" : "▼"} tips</div>
                      </div>
                    </div>
                    {expandedCondition === i && CONDITION_TIPS[c.name] && (
                      <div style={{
                        borderTop: `1px solid ${c.color}22`,
                        padding: "12px 14px", background: "#061420",
                        animation: "fadeIn 0.2s ease",
                      }}>
                        <div style={{ color: "#6b8a9a", fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>RECOMMENDED ACTIONS</div>
                        {CONDITION_TIPS[c.name].map((tip, ti) => (
                          <div key={ti} style={{
                            display: "flex", gap: 8, alignItems: "flex-start",
                            marginBottom: ti < CONDITION_TIPS[c.name].length - 1 ? 8 : 0,
                          }}>
                            <div style={{ color: c.color, fontSize: 12, flexShrink: 0, marginTop: 1 }}>→</div>
                            <div style={{ color: "#7a9aaa", fontSize: 12, lineHeight: 1.5 }}>{tip}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.conditions.length === 0 && (
            <div style={{
              background: "#003d3022", border: "1px solid #00e5c822",
              borderRadius: 14, padding: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 8, animation: "countUp 0.5s ease" }}>✓</div>
              <div style={{ color: "#00e5c8", fontWeight: 700 }}>No significant indicators found</div>
              <div style={{ color: "#2a5a6a", fontSize: 12, marginTop: 4 }}>Continue regular health check-ups</div>
            </div>
          )}

          {/* Advice */}
          <div style={{
            background: "linear-gradient(135deg, #0d2333, #071420)",
            borderRadius: 16, padding: "16px", border: "1px solid #00e5c811",
          }}>
            <div style={{ color: "#00e5c8", fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>💡 RECOMMENDATION</div>
            <div style={{ color: "#8ecfe0", fontSize: 13, lineHeight: 1.6 }}>{result.advice}</div>
          </div>

          {/* Disclaimer */}
          <div style={{ background: "#0d2e3e22", borderRadius: 12, padding: "10px 14px", border: "1px solid #0d2e3e" }}>
            <div style={{ color: "#2a5a6a", fontSize: 10, lineHeight: 1.6 }}>
              ⚠️ AURA is a screening tool only. Results are not a medical diagnosis. Always consult a qualified healthcare provider.
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="aura-btn" style={{ flex: 1 }} onClick={reset}>↺ New Scan</button>
            <button className="aura-btn-ghost" style={{ flex: 1 }} onClick={copyResult}>
              {copied ? "✓ Copied!" : "↑ Copy Report"}
            </button>
          </div>
          {history.length > 1 && (
            <button className="aura-btn-ghost" style={{ width: "100%", fontSize: 13 }} onClick={() => navigate(SCREENS.HISTORY)}>
              📋 View Scan History ({history.length})
            </button>
          )}
        </div>
      </div>
    </>
  );

  // ═══ HISTORY ═══
  if (screen === SCREENS.HISTORY) return (
    <>
      <style>{css}</style>
      <div style={wrap}>
        <div className={animClass} style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 18, maxHeight: 820, overflowY: "auto" }}>
          <ScannerGrid />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="aura-btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}
              onClick={() => navigate(SCREENS.HOME)}>← Home</button>
            <div style={{ color: "#00e5c8", fontSize: 14, fontWeight: 700 }}>Scan History</div>
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#2a5a6a" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14 }}>No scans yet. Complete a health scan to see your history.</div>
            </div>
          ) : (
            <>
              {/* Score trend */}
              <div style={{ background: "#0a1c28", borderRadius: 16, padding: "16px", border: "1px solid #0d2e3e" }}>
                <div style={{ color: "#6b8a9a", fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>SCORE TREND</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
                  {[...history].reverse().map((h, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: "100%", borderRadius: 4,
                        height: `${(h.score / 100) * 52}px`,
                        background: h.score >= 70 ? "#00e5c8" : h.score >= 50 ? "#f59e0b" : "#ef4444",
                        opacity: 0.7 + (i / history.length) * 0.3,
                        transition: "height 0.5s ease",
                      }} />
                      <div style={{ color: "#2a5a6a", fontSize: 9 }}>{h.score}</div>
                    </div>
                  ))}
                </div>
              </div>

              {history.map((h, i) => (
                <div key={i} style={{
                  background: "#0a1c28", borderRadius: 16, padding: "16px",
                  border: `1px solid ${i === 0 ? "#00e5c822" : "#0d2e3e"}`,
                  animation: "fadeIn 0.3s ease",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ color: "#8ecfe0", fontSize: 13, fontWeight: 700 }}>{h.date}</div>
                      {i === 0 && <div style={{ color: "#00e5c8", fontSize: 10, letterSpacing: 1 }}>LATEST</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 20,
                        color: h.score >= 70 ? "#00e5c8" : h.score >= 50 ? "#f59e0b" : "#ef4444",
                      }}>{h.score}</span>
                      <div style={{
                        padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: 1,
                        background: h.risk === "high" ? "#ef444422" : h.risk === "moderate" ? "#f59e0b22" : "#00e5c822",
                        color: h.risk === "high" ? "#ef4444" : h.risk === "moderate" ? "#f59e0b" : "#00e5c8",
                      }}>{h.risk.toUpperCase()}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ background: "#0d2e3e", borderRadius: 6, padding: "2px 8px", color: "#4a7a8a", fontSize: 11 }}>
                      Age: {h.age}
                    </span>
                    <span style={{ background: "#0d2e3e", borderRadius: 6, padding: "2px 8px", color: bmiColor, fontSize: 11 }}>
                      BMI: {h.bmi}
                    </span>
                    {h.conditions.map((c, ci) => (
                      <span key={ci} style={{
                        background: `${c.color}11`, border: `1px solid ${c.color}22`,
                        borderRadius: 6, padding: "2px 8px", color: c.color, fontSize: 11,
                      }}>{c.icon} {c.name}</span>
                    ))}
                    {h.conditions.length === 0 && (
                      <span style={{ background: "#00e5c811", borderRadius: 6, padding: "2px 8px", color: "#00e5c8", fontSize: 11 }}>
                        ✓ Clear
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          <button className="aura-btn" style={{ width: "100%" }} onClick={() => navigate(SCREENS.SCAN)}>
            + New Scan
          </button>
        </div>
      </div>
    </>
  );

  // ═══ ABOUT ═══
  if (screen === SCREENS.ABOUT) return (
    <>
      <style>{css}</style>
      <div style={wrap}>
        <div className={animClass} style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 18, maxHeight: 820, overflowY: "auto" }}>
          <ScannerGrid />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="aura-btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}
              onClick={() => navigate(SCREENS.HOME)}>← Home</button>
            <div style={{ color: "#00e5c8", fontSize: 14, fontWeight: 700 }}>About AURA</div>
          </div>

          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: 6, color: "#00e5c8", marginBottom: 4 }}>AURA</div>
            <div style={{ color: "#4a7a8a", fontSize: 12, letterSpacing: 3 }}>AI-POWERED OFFLINE HEALTH SCREENING</div>
          </div>

          {[
            { title: "Mission", icon: "🎯", text: "Bring early health detection to remote and resource-limited areas — no hospital, no internet, no expensive devices required." },
            { title: "How It Works", icon: "🧠", text: "AURA uses on-device TFLite AI models to analyze camera images (CNN) and audio recordings (MFCC classifier) combined with symptom data to flag potential health concerns." },
            { title: "Privacy First", icon: "🔒", text: "All processing runs locally on your device. No images, audio, or health data ever leaves your phone." },
            { title: "Tech Stack", icon: "⚙️", text: "React Native · TensorFlow Lite · MobileNetV2 CNN · MFCC Audio Model · OpenCV · Librosa · Python training pipeline" },
          ].map(item => (
            <div key={item.title} style={{ background: "#0a1c28", borderRadius: 16, padding: "16px", border: "1px solid #0d2e3e" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ color: "#00e5c8", fontSize: 13, fontWeight: 700 }}>{item.title}</span>
              </div>
              <div style={{ color: "#6b8a9a", fontSize: 13, lineHeight: 1.6 }}>{item.text}</div>
            </div>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { v: "5", l: "Conditions" },
              { v: "100%", l: "Offline" },
              { v: "Free", l: "Forever" },
            ].map(m => (
              <div key={m.l} style={{ background: "#0a1c28", borderRadius: 14, padding: "14px 10px", border: "1px solid #0d2e3e", textAlign: "center" }}>
                <div style={{ color: "#00e5c8", fontSize: 22, fontWeight: 800, fontFamily: "'Space Mono', monospace" }}>{m.v}</div>
                <div style={{ color: "#2a5a6a", fontSize: 11, marginTop: 2 }}>{m.l}</div>
              </div>
            ))}
          </div>

          <button className="aura-btn" style={{ width: "100%" }} onClick={() => navigate(SCREENS.HOME)}>
            Start Scanning
          </button>
        </div>
      </div>
    </>
  );

  return null;
}
