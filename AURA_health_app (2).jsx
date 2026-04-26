import { useState, useEffect, useRef } from "react";

const SCREENS = {
  SPLASH: "splash",
  HOME: "home",
  SCAN: "scan",
  AUDIO: "audio",
  SYMPTOMS: "symptoms",
  RESULT: "result",
  ABOUT: "about",
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
  const levels = { low: { pct: 18, color: "#00e5c8", label: "LOW RISK" }, moderate: { pct: 52, color: "#f59e0b", label: "MODERATE" }, high: { pct: 84, color: "#ef4444", label: "HIGH RISK" } };
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

export default function AuraApp() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [scanStep, setScanStep] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState([false, false, false]);
  const [recording, setRecording] = useState(false);
  const [audioAnalyzed, setAudioAnalyzed] = useState(false);
  const [symptoms, setSymptoms] = useState({});
  const [age, setAge] = useState(28);
  const [result, setResult] = useState(null);
  const [scanLine, setScanLine] = useState(0);
  const audioAnimRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(Array(32).fill(3));
  const [dots, setDots] = useState(0);

  // Splash timer
  useEffect(() => {
    if (screen === SCREENS.SPLASH) {
      const t = setTimeout(() => setScreen(SCREENS.HOME), 3200);
      return () => clearTimeout(t);
    }
  }, [screen]);

  // Scan line animation
  useEffect(() => {
    if (!scanning) return;
    let pos = 0;
    const t = setInterval(() => {
      pos = (pos + 2) % 100;
      setScanLine(pos);
    }, 20);
    return () => clearInterval(t);
  }, [scanning]);

  // Loading dots
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  // Audio waveform sim
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => {
      setAudioLevel(Array(32).fill(0).map(() =>
        Math.floor(Math.random() * 55 + 5)
      ));
    }, 80);
    audioAnimRef.current = t;
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
    setResult({
      risk,
      conditions: [
        hasAnemia && { name: "Anemia Indicator", confidence: 73, color: "#ef4444", icon: "🩸" },
        hasDehy && { name: "Dehydration Signs", confidence: 81, color: "#f59e0b", icon: "💧" },
        hasResp && { name: "Respiratory Concern", confidence: 68, color: "#8b5cf6", icon: "🫁" },
        sympCount >= 3 && { name: "Fever Risk Pattern", confidence: 60, color: "#f97316", icon: "🌡️" },
      ].filter(Boolean),
      score: Math.max(100 - sympCount * 11, 38),
      advice: risk === "high"
        ? "Please visit a health worker or clinic soon. This screening detected multiple indicators."
        : risk === "moderate"
        ? "Monitor your symptoms. Rest, hydrate, and consult a health worker if symptoms persist."
        : "No significant risk detected. Stay hydrated and maintain regular health checks.",
    });
    setScreen(SCREENS.RESULT);
  };

  const reset = () => {
    setScanStep(0); setScanDone([false, false, false]);
    setRecording(false); setAudioAnalyzed(false);
    setSymptoms({}); setAge(28); setResult(null);
    setScreen(SCREENS.HOME);
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
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #0d1f2d; }
    ::-webkit-scrollbar-thumb { background: #00e5c844; border-radius: 99px; }
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
        <div style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          <ScannerGrid />
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ color: "#00e5c8", fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>AURA</div>
              <div style={{ color: "#2a5a6a", fontSize: 10, letterSpacing: 2 }}>HEALTH SCREENING v1.0</div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "1px solid #00e5c833",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#00e5c8", cursor: "pointer", fontSize: 16,
            }} onClick={() => setScreen(SCREENS.ABOUT)}>ⓘ</div>
          </div>

          {/* Hero */}
          <div style={{
            background: "linear-gradient(135deg, #0d2333, #071420)",
            borderRadius: 24, padding: "28px 24px",
            border: "1px solid #00e5c811", position: "relative", overflow: "hidden",
            animation: "fadeSlideUp 0.6s ease",
          }}>
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 120, height: 120, borderRadius: "50%",
              background: "radial-gradient(circle, #00e5c818, transparent)",
            }} />
            <div style={{ fontSize: 40, marginBottom: 12, animation: "floatGlow 3s ease-in-out infinite" }}>🫀</div>
            <div style={{ color: "#e8f4f8", fontSize: 20, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>
              Detect Health Conditions Early
            </div>
            <div style={{ color: "#4a7a8a", fontSize: 13, lineHeight: 1.6 }}>
              Uses your camera, mic & symptoms to screen for anemia, dehydration & respiratory issues — <span style={{ color: "#00e5c8" }}>100% offline.</span>
            </div>
          </div>

          {/* Status Row */}
          <div style={{ display: "flex", gap: 10 }}>
            <MetricBadge label="Mode" value="OFFLINE" sub="No internet needed" />
            <MetricBadge label="Models" value="4" color="#8b5cf6" sub="On-device AI" />
          </div>

          {/* Start CTA */}
          <button className="aura-btn" style={{ width: "100%", fontSize: 16, padding: "18px 0" }}
            onClick={() => setScreen(SCREENS.SCAN)}>
            ▶ Begin Health Scan
          </button>

          {/* Condition cards */}
          <div style={{ color: "#2a5a6a", fontSize: 11, letterSpacing: 2, marginBottom: -8 }}>DETECTABLE CONDITIONS</div>
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
          <div style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <ScannerGrid />
            {/* Back + Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
              <button className="aura-btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}
                onClick={() => setScreen(SCREENS.HOME)}>← Back</button>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#2a5a6a", fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>
                  SCAN STEP {scanStep + 1} OF 3
                </div>
                <div style={{ background: "#0d1f2d", borderRadius: 99, height: 4 }}>
                  <div style={{
                    width: `${((scanStep + (scanDone[scanStep] ? 1 : 0)) / 3) * 100}%`,
                    height: "100%", background: "linear-gradient(90deg, #00e5c8, #0099aa)",
                    borderRadius: 99, transition: "width 0.5s ease",
                  }} />
                </div>
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
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 12,
              }}>
                {scanning ? (
                  <>
                    <div style={{
                      position: "absolute", left: 0, right: 0,
                      top: `${scanLine}%`, height: 2,
                      background: "linear-gradient(90deg, transparent, #00e5c8, transparent)",
                      boxShadow: "0 0 16px #00e5c8",
                      transition: "top 0.02s linear",
                    }} />
                    <div style={{ color: "#00e5c8", fontSize: 13, letterSpacing: 2, animation: "scanPulse 1s ease infinite" }}>
                      ANALYZING{".".repeat(dots)}
                    </div>
                    <div style={{
                      width: 60, height: 60, borderRadius: "50%",
                      border: "2px solid #00e5c8",
                      borderTopColor: "transparent",
                      animation: "rotateRing 0.8s linear infinite",
                    }} />
                  </>
                ) : scanDone[scanStep] ? (
                  <>
                    <div style={{ fontSize: 44, filter: "drop-shadow(0 0 16px #00e5c8)" }}>✓</div>
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
              {/* Simulated CNN grid overlay */}
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
            </div>

            {/* Step dots */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {SCAN_TARGETS.map((_, i) => (
                <div key={i} style={{
                  width: scanDone[i] ? 28 : 8, height: 8, borderRadius: 99,
                  background: scanDone[i] ? "#00e5c8" : i === scanStep ? "#00e5c844" : "#0d2e3e",
                  transition: "all 0.3s ease",
                  boxShadow: scanDone[i] ? "0 0 8px #00e5c8" : "none",
                }} />
              ))}
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
                <button className="aura-btn" style={{ flex: 1 }} onClick={() => setScreen(SCREENS.AUDIO)}>
                  Continue → Audio
                </button>
              )}
              {!scanDone[scanStep] && (
                <button className="aura-btn-ghost" onClick={() => {
                  setScanDone(prev => { const n = [...prev]; n[scanStep] = true; return n; });
                  if (scanStep < 2) setScanStep(s => s + 1);
                  else setScreen(SCREENS.AUDIO);
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
        <div style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
          <ScannerGrid />
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
            <button className="aura-btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}
              onClick={() => setScreen(SCREENS.SCAN)}>← Back</button>
            <div style={{ color: "#2a5a6a", fontSize: 11, letterSpacing: 2 }}>STEP 2 · AUDIO ANALYSIS</div>
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
            <CornerBracket pos="tl" />
            <CornerBracket pos="tr" />
            <CornerBracket pos="bl" />
            <CornerBracket pos="br" />
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
          <div style={{
            background: "#0a1c28", borderRadius: 14, padding: "14px 16px",
            border: "1px solid #0d2e3e",
          }}>
            <div style={{ color: "#8ecfe0", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>🧠 Audio Model Pipeline</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Raw Audio", "→", "MFCC Features", "→", "CNN Classifier", "→", "Normal / Abnormal"].map((s, i) => (
                <span key={i} style={{
                  color: s === "→" ? "#2a5a6a" : "#4a9ab0",
                  fontSize: 11,
                  background: s !== "→" ? "#0d2e3e" : "transparent",
                  padding: s !== "→" ? "3px 8px" : "0",
                  borderRadius: 6,
                }}>{s}</span>
              ))}
            </div>
            {audioAnalyzed && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#00340e", borderRadius: 10, color: "#00e5c8", fontSize: 12 }}>
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
              <button className="aura-btn" style={{ flex: 1 }} onClick={() => setScreen(SCREENS.SYMPTOMS)}>
                Continue → Symptoms
              </button>
            )}
            {!recording && (
              <button className="aura-btn-ghost" onClick={() => setScreen(SCREENS.SYMPTOMS)}>
                Skip
              </button>
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
        <div style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 20, maxHeight: 760, overflowY: "auto" }}>
          <ScannerGrid />
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
            <button className="aura-btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}
              onClick={() => setScreen(SCREENS.AUDIO)}>← Back</button>
            <div style={{ color: "#2a5a6a", fontSize: 11, letterSpacing: 2 }}>STEP 3 · SYMPTOMS</div>
          </div>

          <div>
            <div style={{ color: "#e8f4f8", fontSize: 20, fontWeight: 700 }}>Patient Information</div>
            <div style={{ color: "#4a7a8a", fontSize: 13, marginTop: 4 }}>Select all current symptoms</div>
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

          {/* Symptom grid */}
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
        <div style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 18, maxHeight: 760, overflowY: "auto" }}>
          <ScannerGrid />
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ color: "#00e5c8", fontSize: 13, letterSpacing: 3, fontFamily: "'Space Mono', monospace" }}>AURA REPORT</div>
              <div style={{ color: "#2a5a6a", fontSize: 10 }}>{new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</div>
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

          {/* Score circle */}
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
            <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="140" height="140" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                <circle cx="70" cy="70" r="58" fill="none" stroke="#0d2e3e" strokeWidth="8" />
                <circle cx="70" cy="70" r="58" fill="none"
                  stroke={result.score >= 70 ? "#00e5c8" : result.score >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(result.score / 100) * 364} 364`}
                  style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.23,1,0.32,1)" }}
                />
              </svg>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 34, fontWeight: 800, fontFamily: "'Space Mono', monospace",
                  color: result.score >= 70 ? "#00e5c8" : result.score >= 50 ? "#f59e0b" : "#ef4444",
                }}>{result.score}</div>
                <div style={{ color: "#2a5a6a", fontSize: 10, letterSpacing: 1 }}>HEALTH SCORE</div>
              </div>
            </div>
          </div>

          {/* Risk meter */}
          <div style={{ background: "#0a1c28", borderRadius: 16, padding: "16px", border: "1px solid #0d2e3e" }}>
            <RiskMeter level={result.risk} />
          </div>

          {/* Conditions */}
          {result.conditions.length > 0 && (
            <div>
              <div style={{ color: "#2a5a6a", fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>DETECTED INDICATORS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.conditions.map((c, i) => (
                  <div key={i} style={{
                    background: "#0a1c28", borderRadius: 14, padding: "14px",
                    border: `1px solid ${c.color}22`, display: "flex", gap: 12, alignItems: "center",
                  }}>
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
                    <div style={{ color: c.color, fontSize: 13, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
                      {c.confidence}%
                    </div>
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
              <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
              <div style={{ color: "#00e5c8", fontWeight: 700 }}>No significant indicators found</div>
            </div>
          )}

          {/* Advice */}
          <div style={{
            background: "linear-gradient(135deg, #0d2333, #071420)",
            borderRadius: 16, padding: "16px",
            border: "1px solid #00e5c811",
          }}>
            <div style={{ color: "#00e5c8", fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>💡 RECOMMENDATION</div>
            <div style={{ color: "#8ecfe0", fontSize: 13, lineHeight: 1.6 }}>{result.advice}</div>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: "#0d2e3e22", borderRadius: 12, padding: "10px 14px",
            border: "1px solid #0d2e3e",
          }}>
            <div style={{ color: "#2a5a6a", fontSize: 10, lineHeight: 1.6 }}>
              ⚠️ AURA is a screening tool only. Results are not a medical diagnosis. Always consult a qualified healthcare provider.
            </div>
          </div>

          {/* Share + Restart */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="aura-btn" style={{ flex: 1 }} onClick={reset}>
              ↺ New Scan
            </button>
            <button className="aura-btn-ghost" style={{ flex: 1 }}>
              ↑ Export PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ═══ ABOUT ═══
  if (screen === SCREENS.ABOUT) return (
    <>
      <style>{css}</style>
      <div style={wrap}>
        <div style={{ ...phone, padding: 28, display: "flex", flexDirection: "column", gap: 18, maxHeight: 760, overflowY: "auto" }}>
          <ScannerGrid />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="aura-btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}
              onClick={() => setScreen(SCREENS.HOME)}>← Home</button>
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
            <div key={item.title} style={{
              background: "#0a1c28", borderRadius: 16, padding: "16px",
              border: "1px solid #0d2e3e",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ color: "#00e5c8", fontSize: 13, fontWeight: 700 }}>{item.title}</span>
              </div>
              <div style={{ color: "#6b8a9a", fontSize: 13, lineHeight: 1.6 }}>{item.text}</div>
            </div>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { v: "4", l: "Conditions" },
              { v: "100%", l: "Offline" },
              { v: "Free", l: "Forever" },
            ].map(m => (
              <div key={m.l} style={{
                background: "#0a1c28", borderRadius: 14, padding: "14px 10px",
                border: "1px solid #0d2e3e", textAlign: "center",
              }}>
                <div style={{ color: "#00e5c8", fontSize: 22, fontWeight: 800, fontFamily: "'Space Mono', monospace" }}>{m.v}</div>
                <div style={{ color: "#2a5a6a", fontSize: 11, marginTop: 2 }}>{m.l}</div>
              </div>
            ))}
          </div>

          <button className="aura-btn" style={{ width: "100%" }} onClick={() => setScreen(SCREENS.HOME)}>
            Start Scanning
          </button>
        </div>
      </div>
    </>
  );

  return null;
}
