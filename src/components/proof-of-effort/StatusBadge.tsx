interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  CREATED: { label: "Created", className: "bg-muted text-muted-foreground" },
  ACTIVE: { label: "Active", className: "bg-primary/20 text-primary" },
  WORK_SUBMITTED: { label: "Work Submitted", className: "bg-score-medium/20 text-score-medium" },
  EVALUATED: { label: "Evaluated", className: "bg-score-high/20 text-score-high" },
  DISPUTED: { label: "Disputed", className: "bg-destructive/20 text-destructive" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
