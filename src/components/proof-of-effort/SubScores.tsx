interface SubScoresProps {
  process: number;
  decision: number;
  docs: number;
  professionalism: number;
}

function ScoreBar({ label, icon, value, max }: { label: string; icon: string; value: number; max: number }) {
  const percent = Math.min((value / max) * 100, 100);
  const getColor = () => {
    const ratio = value / max;
    if (ratio >= 0.8) return "bg-score-high";
    if (ratio >= 0.6) return "bg-score-medium";
    return "bg-score-low";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-muted-foreground">{label}</span>
        </span>
        <span className="font-semibold text-foreground">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor()}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function SubScores({ process, decision, docs, professionalism }: SubScoresProps) {
  return (
    <div className="space-y-4">
      <ScoreBar label="Process Quality" icon="⚙️" value={process} max={40} />
      <ScoreBar label="Decision Quality" icon="🧠" value={decision} max={35} />
      <ScoreBar label="Documentation" icon="📄" value={docs} max={25} />
      <ScoreBar label="Professionalism" icon="🤝" value={professionalism} max={20} />
    </div>
  );
}
