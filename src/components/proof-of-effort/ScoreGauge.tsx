import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  finalScore: number;
  size?: number;
  label?: string;
}

export function ScoreGauge({ finalScore, size = 200, label = "Effort Score" }: ScoreGaugeProps) {
  const [score, setScore] = useState(0);
  const radius = (size / 2) - 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 120) * circumference;

  useEffect(() => {
    setScore(0);
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setScore((prev) => {
          if (prev >= finalScore) { clearInterval(interval); return finalScore; }
          return prev + 1;
        });
      }, 20);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, [finalScore]);

  const getColor = (s: number) => {
    if (s >= 80) return "hsl(var(--score-high))";
    if (s >= 60) return "hsl(var(--score-medium))";
    return "hsl(var(--score-low))";
  };

  const getColorClass = (s: number) => {
    if (s >= 80) return "score-color-high";
    if (s >= 60) return "score-color-medium";
    return "score-color-low";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--score-gauge-bg))"
            strokeWidth="10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.05s linear, stroke 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold font-display ${getColorClass(score)}`}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground mt-1">/120</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
