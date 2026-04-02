export function Footer() {
  return (
    <footer className="border-t border-border/50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>Proof of Effort — Outcome-independent professional quality verification</span>
          <div className="flex items-center gap-6">
            <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Powered by GenLayer
            </a>
            <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
